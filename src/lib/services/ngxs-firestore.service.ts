import { Injectable } from '@angular/core';
import { Store, ActionType, Actions, ofActionDispatched } from '@ngxs/store';
import { tap, take, catchError, mergeMap, takeUntil, finalize } from 'rxjs/operators';
import { Subject, EMPTY, Observable, race } from 'rxjs';
import { NgxsFirestoreState } from '../states/ngxs-firestore.state';
import { attachAction } from '@ngxs-labs/attach-action';
import {
    StreamConnectedOf,
    StreamEmittedOf,
    StreamDisconnectOf,
    StreamDisconnectedOf
} from '../decorators/action-decorator-helpers';
import { NgxsFirestoreDebugActions } from '../states/ngxs-firestore.actions';
import { Disconnect } from '../actions';

function streamId(action: ActionType, actionCtx: any) {
    return `${action.type}${actionCtx.payload ? ` (${actionCtx.payload})` : ''}`;
}

@Injectable({ providedIn: 'root' })
export class NgxsFirestore {
    constructor(private store: Store, private actions: Actions) {}

    connect<T, U>(
        action: ActionType,
        opts: {
            to: (payload: any) => Observable<U>;
            trackBy: (payload: any) => string;
        }
    ) {
        const actionHandlerSubject = new Subject();

        attachAction(NgxsFirestoreState, action, () => {
            return actionHandlerSubject.asObservable().pipe(
                take(1),
                tap((actionCtx) => {
                    //call action stream connected
                    const StreamConnectedClass = StreamConnectedOf(action);
                    this.store.dispatch(new StreamConnectedClass(action));

                    // internal stream logging
                    this.store.dispatch(new NgxsFirestoreDebugActions.StreamConnected(streamId(action, actionCtx)));
                }),
                catchError((_) => {
                    return EMPTY;
                })
            );
        });

        this.actions
            .pipe(
                ofActionDispatched(action),
                // TODO FILTER by track by id
                // filter(actionCtx => {
                //     debugger
                //     const stream = this.store.selectSnapshot(streamConnected(streamId(action, actionCtx)));
                //     return !stream;
                // }),
                mergeMap((actionCtx) => {
                    const streamFn = opts.to;
                    return streamFn(actionCtx.payload).pipe(
                        tap((_) => actionHandlerSubject.next(actionCtx)),
                        tap((payload) => {
                            const StreamEmittedClass = StreamEmittedOf(action);
                            this.store.dispatch(new StreamEmittedClass(actionCtx, payload));
                            this.store.dispatch(
                                new NgxsFirestoreDebugActions.StreamEmitted({
                                    id: streamId(action, actionCtx),
                                    items: payload
                                })
                            );
                        }),
                        takeUntil(
                            race(
                                this.actions.pipe(ofActionDispatched(StreamDisconnectOf(action))),
                                this.actions.pipe(ofActionDispatched(Disconnect))
                            )
                        ),
                        finalize(() => {
                            const StreamDisconnectedClass = StreamDisconnectedOf(action);
                            this.store.dispatch(new StreamDisconnectedClass());
                            this.store.dispatch(
                                new NgxsFirestoreDebugActions.StreamDisconnected(streamId(action, actionCtx))
                            );
                        }),
                        catchError((err) => {
                            actionHandlerSubject.error(err);
                            return EMPTY;
                        })
                    );
                })
            )
            .subscribe();
    }
}
