import { Injectable, OnDestroy } from '@angular/core';
import { Store, ActionType, Actions, ofActionDispatched } from '@ngxs/store';
import { tap, take, catchError, mergeMap, takeUntil, finalize, filter, switchMap } from 'rxjs/operators';
import { Subject, Observable, race, Subscription, of } from 'rxjs';
import { NgxsFirestoreState } from './ngxs-firestore.state';
import { attachAction } from '@ngxs-labs/attach-action';
import {
    StreamConnectedOf,
    StreamEmittedOf,
    StreamDisconnectOf,
    StreamDisconnectedOf
} from './action-decorator-helpers';
import { NgxsFirestoreConnectActions } from './ngxs-firestore-connect.actions';

function streamId(action: ActionType, actionCtx: any) {
    return `${action.type}${actionCtx.payload ? ` (${actionCtx.payload})` : ''}`;
}

@Injectable({ providedIn: 'root' })
export class NgxsFirestoreConnect implements OnDestroy {
    firestoreConnectionsSub: Subscription;

    constructor(private store: Store, private actions: Actions) {}

    connect(
        action: ActionType,
        opts: {
            to: (payload: any) => Observable<any>;
            trackBy?: (payload: any) => string;
        }
    ) {
        const actionHandlerSubject = new Subject();
        const actionConnectedHandlerSubject = new Subject();

        attachAction(NgxsFirestoreState, action, () => {
            return actionHandlerSubject.asObservable().pipe(
                take(1),
                switchMap((actionCtx) => {
                    if (!!this.store.selectSnapshot(NgxsFirestoreState.isConnected(streamId(action, actionCtx)))) {
                        // NGXS doesnt complete the action returning EMPTY
                        return of({});
                    } else {
                        return actionConnectedHandlerSubject.asObservable().pipe(
                            take(1),
                            tap((_) => {
                                // call action stream connected
                                const StreamConnectedClass = StreamConnectedOf(action);
                                this.store.dispatch(new StreamConnectedClass(action));

                                // internal stream logging
                                this.store.dispatch(
                                    new NgxsFirestoreConnectActions.StreamConnected(streamId(action, actionCtx))
                                );
                            })
                        );
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
                ofActionDispatched(action),
                tap((actionCtx) => actionHandlerSubject.next(actionCtx)),
                filter((actionCtx) => {
                    return !this.store.selectSnapshot(NgxsFirestoreState.isConnected(streamId(action, actionCtx)));
                }),
                mergeMap((actionCtx) => {
                    const streamFn = opts.to;
                    return streamFn(actionCtx.payload).pipe(
                        tap((_) => actionConnectedHandlerSubject.next(actionCtx)),
                        tap((payload) => {
                            const StreamEmittedClass = StreamEmittedOf(action);
                            this.store.dispatch(new StreamEmittedClass(actionCtx, payload));
                            this.store.dispatch(
                                new NgxsFirestoreConnectActions.StreamEmitted({
                                    id: streamId(action, actionCtx),
                                    items: payload
                                })
                            );
                        }),
                        takeUntil(
                            race(
                                this.actions.pipe(ofActionDispatched(StreamDisconnectOf(action))),
                                this.actions.pipe(ofActionDispatched(NgxsFirestoreConnectActions.DisconnectAll)),
                                this.actions.pipe(ofActionDispatched(NgxsFirestoreConnectActions.Disconnect)).pipe(
                                    filter((disconnectActionCtx) => {
                                        const { payload } = disconnectActionCtx;
                                        if (!payload) {
                                            return false;
                                        }
                                        const disconnectedStreamId = streamId(
                                            payload.constructor || payload,
                                            disconnectActionCtx.payload
                                        );
                                        if (disconnectedStreamId === streamId(action, actionCtx)) {
                                            return true;
                                        }

                                        return false;
                                    })
                                )
                            )
                        ),
                        finalize(() => {
                            const StreamDisconnectedClass = StreamDisconnectedOf(action);
                            this.store.dispatch(new StreamDisconnectedClass());
                            this.store.dispatch(
                                new NgxsFirestoreConnectActions.StreamDisconnected(streamId(action, actionCtx))
                            );
                        }),
                        catchError((err) => {
                            actionHandlerSubject.error(err);
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
