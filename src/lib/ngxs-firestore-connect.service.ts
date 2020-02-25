import { Injectable, OnDestroy } from '@angular/core';
import { Store, ActionType, Actions, ofActionDispatched } from '@ngxs/store';
import { tap, catchError, mergeMap, takeUntil, finalize, filter, switchMap, first, mapTo, take } from 'rxjs/operators';
import { Subject, Observable, race, Subscription, of } from 'rxjs';
import { NgxsFirestoreState } from './ngxs-firestore.state';
import { attachAction } from '@ngxs-labs/attach-action';
import { StreamConnected, StreamEmitted, StreamDisconnected } from './action-decorator-helpers';
import { NgxsFirestoreConnectActions } from './ngxs-firestore-connect.actions';
import { DisconnectStream, DisconnectAll, Disconnect } from './actions';

interface ActionTypeDef<T> {
    type: string;
    new (...args: any): T;
}

function runOnce<T>(once: (arg) => void): (source: Observable<T>) => Observable<T> {
    return function inner(source: Observable<T>): Observable<T> {
        source
            .pipe(
                first(),
                tap((t) => once(t))
            )
            .subscribe();
        return source;
    };
}

function streamId(actionType: ActionType, action: any) {
    return `${actionType.type}${action.payload ? ` (${action.payload})` : ''}`;
}

@Injectable({ providedIn: 'root' })
export class NgxsFirestoreConnect implements OnDestroy {
    firestoreConnectionsSub: Subscription;
    activeFirestoreConnections: string[] = [];

    constructor(private store: Store, private actions: Actions) {}

    connect<T>(
        actionType: ActionTypeDef<T>,
        opts: {
            to: (payload: T) => Observable<any>;
            trackBy?: (payload: T) => string;
            connectedActionFinishesOn?: 'FirstEmit' | 'StreamCompleted';
        }
    ) {
        opts.connectedActionFinishesOn = opts.connectedActionFinishesOn || 'FirstEmit';

        const actionDispatchedHandlerSubject = new Subject();
        const actionConnectedHandlerSubject = new Subject();
        const actionCompletedHandlerSubject = new Subject();

        attachAction(NgxsFirestoreState, actionType, () => {
            return actionDispatchedHandlerSubject.asObservable().pipe(
                take(1),
                switchMap((action) => {
                    // skip actions already connected
                    if (!!this.activeFirestoreConnections.includes(streamId(actionType, action))) {
                        // NGXS doesnt complete the action returning EMPTY
                        return of({});
                    } else {
                        actionConnectedHandlerSubject
                            .asObservable()
                            .pipe(
                                tap((_) => {
                                    // call action stream connected
                                    const StreamConnectedClass = StreamConnected(actionType);
                                    this.store.dispatch(new StreamConnectedClass(actionType));

                                    this.activeFirestoreConnections.push(streamId(actionType, action));

                                    // internal stream logging
                                    this.store.dispatch(
                                        new NgxsFirestoreConnectActions.StreamConnected(streamId(actionType, action))
                                    );
                                })
                            )
                            .subscribe();
                        if (opts.connectedActionFinishesOn === 'FirstEmit') {
                            return actionCompletedHandlerSubject.asObservable().pipe(take(1), mapTo({}));
                        } else {
                            return actionCompletedHandlerSubject.asObservable().pipe(take(1), mapTo({}));
                        }
                    }
                }),
                catchError((_) => {
                    // NGXS doesnt complete the action returning EMPTY
                    return of({});
                })
            );
        });

        this.firestoreConnectionsSub = this.actions
            .pipe(
                ofActionDispatched(actionType),
                runOnce((action) => {
                    actionDispatchedHandlerSubject.next(action);
                    actionDispatchedHandlerSubject.complete();
                }),
                filter((action) => {
                    return !this.activeFirestoreConnections.includes(streamId(actionType, action));
                }),
                mergeMap((action) => {
                    const streamFn = opts.to;
                    return streamFn(action).pipe(
                        runOnce(() => {
                            actionConnectedHandlerSubject.next(action);
                            actionConnectedHandlerSubject.complete();

                            if (opts.connectedActionFinishesOn === 'FirstEmit') {
                                actionCompletedHandlerSubject.next();
                                actionCompletedHandlerSubject.complete();
                            }
                        }),
                        tap((payload) => {
                            const StreamEmittedClass = StreamEmitted(actionType);
                            this.store.dispatch(new StreamEmittedClass(action, payload));
                            this.store.dispatch(
                                new NgxsFirestoreConnectActions.StreamEmitted({
                                    id: streamId(actionType, action),
                                    items: payload
                                })
                            );
                        }),
                        takeUntil(
                            race(
                                this.actions.pipe(ofActionDispatched(new DisconnectStream(actionType))),
                                this.actions.pipe(ofActionDispatched(DisconnectAll)),
                                this.actions.pipe(ofActionDispatched(Disconnect)).pipe(
                                    filter((disconnectAction) => {
                                        const { payload } = disconnectAction;
                                        if (!payload) {
                                            return false;
                                        }
                                        const disconnectedStreamId = streamId(
                                            payload.constructor || payload,
                                            disconnectAction.payload
                                        );
                                        if (disconnectedStreamId === streamId(actionType, action)) {
                                            return true;
                                        }

                                        return false;
                                    })
                                )
                            )
                        ),
                        finalize(() => {
                            const StreamDisconnectedClass = StreamDisconnected(actionType);
                            this.store.dispatch(new StreamDisconnectedClass());
                            this.store.dispatch(
                                new NgxsFirestoreConnectActions.StreamDisconnected(streamId(actionType, action))
                            );
                            this.activeFirestoreConnections.splice(
                                this.activeFirestoreConnections.indexOf(streamId(actionType, action)),
                                1
                            );
                            if (opts.connectedActionFinishesOn === 'StreamCompleted') {
                                actionCompletedHandlerSubject.next();
                                actionCompletedHandlerSubject.complete();
                            }
                        }),
                        catchError((err) => {
                            actionDispatchedHandlerSubject.error(err);
                            return of({});
                        })
                    );
                })
            )
            .subscribe();
    }

    ngOnDestroy() {
        if (this.firestoreConnectionsSub) {
            this.firestoreConnectionsSub.unsubscribe();
        }
    }
}
