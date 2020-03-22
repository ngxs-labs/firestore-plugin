import { Injectable, OnDestroy } from '@angular/core';
import { Store, ActionType, Actions, ofActionDispatched } from '@ngxs/store';
import { tap, catchError, mergeMap, takeUntil, finalize, filter, take } from 'rxjs/operators';
import { Observable, race, Subscription, of, Subject } from 'rxjs';
import { StreamConnected, StreamEmitted, StreamDisconnected } from './action-decorator-helpers';
import { NgxsFirestoreConnectActions } from './ngxs-firestore-connect.actions';
import { DisconnectStream, DisconnectAll, Disconnect } from './actions';
import { attachAction } from './attach-action';
import { NgxsFirestoreState } from './ngxs-firestore.state';

interface ActionTypeDef<T> {
    type: string;
    new (...args: any): T;
}

function streamId(actionType: ActionType, action: any) {
    return `${actionType.type}${action.payload ? ` (${action.payload})` : ''}`;
}

function tapOnce<T>(fn) {
    return function(source: Observable<T>) {
        source
            .pipe(
                take(1),
                tap((_) => fn(_))
            )
            .subscribe();
        return source;
    };
}

@Injectable({ providedIn: 'root' })
export class NgxsFirestoreConnect implements OnDestroy {
    firestoreConnectionsSub: Subscription[] = [];
    activeFirestoreConnections: string[] = [];
    actionsPending: string[] = [];

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

        interface CompletedHandler {
            actionCompletedHandlerSubject: Subject<unknown>;
        }

        const subjects: { [key: string]: CompletedHandler } = {};
        function getSubjects(id: string): CompletedHandler {
            if (!subjects[id]) {
                const actionCompletedHandlerSubject = new Subject();
                subjects[id] = {
                    actionCompletedHandlerSubject
                };
            }

            return subjects[id];
        }

        attachAction(NgxsFirestoreState, actionType, (_stateContext, action) => {
            const { actionCompletedHandlerSubject } = getSubjects(streamId(actionType, action));
            if (this.actionsPending.includes(streamId(actionType, action))) {
                return;
            }

            return actionCompletedHandlerSubject.asObservable().pipe(
                take(1),
                catchError((_) => {
                    // NGXS doesnt complete the action returning EMPTY
                    return of({});
                })
            );
        });

        this.firestoreConnectionsSub.push(
            this.actions
                .pipe(
                    ofActionDispatched(actionType),
                    // filter actions dispatched on same tick
                    filter((action) => {
                        return !this.actionsPending.includes(streamId(actionType, action));
                    }),
                    tap((action) => {
                        this.actionsPending.push(streamId(actionType, action));
                    }),
                    // skip actions already connected
                    filter((action) => {
                        return !this.activeFirestoreConnections.includes(streamId(actionType, action));
                    }),
                    // we use mergeMap to support a same action being called with different payloads.
                    mergeMap((action) => {
                        const streamFn = opts.to;
                        return streamFn(action).pipe(
                            //connected
                            tapOnce((_) => {
                                const StreamConnectedClass = StreamConnected(actionType);
                                this.store.dispatch(new StreamConnectedClass(actionType));
                                this.activeFirestoreConnections.push(streamId(actionType, action));
                                // remove from actionsPending once connected
                                this.actionsPending.splice(
                                    this.actionsPending.indexOf(streamId(actionType, action)),
                                    1
                                );

                                this.store.dispatch(
                                    new NgxsFirestoreConnectActions.StreamConnected(streamId(actionType, action))
                                );
                            }),
                            //completed if FirstEmit
                            tapOnce(() => {
                                if (opts.connectedActionFinishesOn === 'FirstEmit') {
                                    const { actionCompletedHandlerSubject } = getSubjects(streamId(actionType, action));
                                    actionCompletedHandlerSubject.next(action);
                                }
                            }),
                            //emmited
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
                                this.store.dispatch(new StreamDisconnectedClass(action));
                                this.store.dispatch(
                                    new NgxsFirestoreConnectActions.StreamDisconnected(streamId(actionType, action))
                                );
                                this.activeFirestoreConnections.splice(
                                    this.activeFirestoreConnections.indexOf(streamId(actionType, action)),
                                    1
                                );

                                //completed if StreamCompleted
                                if (opts.connectedActionFinishesOn === 'StreamCompleted') {
                                    const { actionCompletedHandlerSubject } = getSubjects(streamId(actionType, action));
                                    actionCompletedHandlerSubject.next(action);
                                }
                            }),
                            catchError((err) => {
                                const { actionCompletedHandlerSubject } = getSubjects(streamId(actionType, action));
                                actionCompletedHandlerSubject.error(err);
                                return of({});
                            })
                        );
                    })
                )
                .subscribe()
        );
    }

    ngOnDestroy() {
        if (this.firestoreConnectionsSub) {
            this.firestoreConnectionsSub.forEach((sub) => sub.unsubscribe());
        }
    }
}
