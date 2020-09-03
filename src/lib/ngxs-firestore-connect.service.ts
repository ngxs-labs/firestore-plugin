import { Injectable, OnDestroy } from '@angular/core';
import { Store, ActionType, Actions, ofActionDispatched } from '@ngxs/store';
import { tap, catchError, mergeMap, takeUntil, finalize, filter, take, switchMap, share } from 'rxjs/operators';
import { Observable, race, Subscription, Subject, defer, iif, of } from 'rxjs';
import { StreamConnected, StreamEmitted, StreamDisconnected, StreamErrored } from './action-decorator-helpers';
import { NgxsFirestoreConnectActions } from './ngxs-firestore-connect.actions';
import { DisconnectStream, DisconnectAll, Disconnect } from './actions';
import { attachAction } from './attach-action';
import { NgxsFirestoreState } from './ngxs-firestore.state';

interface ActionTypeDef<T> {
  type: string;
  new (...args: any): T;
}

function defaultTrackBy(action: any) {
  return action.payload || '';
}

function streamId(opts: { actionType: ActionType; action: any; trackBy: (action: any) => string }) {
  let id = `${opts.actionType.type}`;
  if (opts.trackBy(opts.action)) {
    id = id.concat(` (${opts.trackBy(opts.action)})`);
  }
  return id;
}

function tapOnce<T>(fn: (value) => void) {
  return (source: Observable<any>) =>
    defer(() => {
      let first = true;
      return source.pipe(
        tap<T>((payload) => {
          if (first) {
            fn(payload);
          }
          first = false;
        })
      );
    }).pipe(share());
}

@Injectable({ providedIn: 'root' })
export class NgxsFirestoreConnect implements OnDestroy {
  private firestoreConnectionsSub: Subscription[] = [];
  private activeFirestoreConnections: string[] = [];
  private actionsPending: string[] = [];

  constructor(private store: Store, private actions: Actions) {}

  connect<T>(
    actionType: ActionTypeDef<T>,
    opts: {
      to: (action: T) => Observable<any>;
      trackBy?: (action: T) => string;
      connectedActionFinishesOn?: 'FirstEmit' | 'StreamCompleted';
      cancelPrevious?: boolean;
    }
  ) {
    const connectedActionFinishesOn = opts.connectedActionFinishesOn || 'FirstEmit';
    const trackBy = opts.trackBy || defaultTrackBy;
    const cancelPrevious = opts.cancelPrevious;

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
      const { actionCompletedHandlerSubject } = getSubjects(streamId({ actionType, action, trackBy }));

      const completed$ = actionCompletedHandlerSubject.asObservable().pipe(take(1));

      if (this.activeFirestoreConnections.includes(streamId({ actionType, action, trackBy }))) {
        return;
      }

      if (this.actionsPending.includes(streamId({ actionType, action, trackBy }))) {
        return completed$;
      }

      return completed$;
    });

    const actionDispatched$ = this.actions.pipe(
      ofActionDispatched(actionType),
      // skip actions already connected
      filter((action) => {
        return !this.activeFirestoreConnections.includes(streamId({ actionType, action, trackBy }));
      }),
      // filter actions dispatched on same tick
      filter((action) => {
        return !this.actionsPending.includes(streamId({ actionType, action, trackBy }));
      }),
      tap((action) => {
        this.actionsPending.push(streamId({ actionType, action, trackBy }));
      })
    );

    const firestoreStreamHandler$ = (action) => {
      const streamFn = opts.to;
      return streamFn(action).pipe(
        // connected
        tapOnce((_) => {
          const StreamConnectedClass = StreamConnected(actionType);
          this.store.dispatch(new StreamConnectedClass(action));
          this.activeFirestoreConnections.push(streamId({ actionType, action, trackBy }));
          // remove from actionsPending once connected
          this.actionsPending.splice(this.actionsPending.indexOf(streamId({ actionType, action, trackBy })), 1);

          this.store.dispatch(
            new NgxsFirestoreConnectActions.StreamConnected(streamId({ actionType, action, trackBy }))
          );
        }),
        // emmited
        tap((payload) => {
          const StreamEmittedClass = StreamEmitted(actionType);
          this.store.dispatch(new StreamEmittedClass(action, payload));
          this.store.dispatch(
            new NgxsFirestoreConnectActions.StreamEmitted({
              id: streamId({ actionType, action, trackBy }),
              items: payload
            })
          );
        }),
        // completed if FirstEmit
        tapOnce(() => {
          if (connectedActionFinishesOn === 'FirstEmit') {
            const { actionCompletedHandlerSubject } = getSubjects(streamId({ actionType, action, trackBy }));
            actionCompletedHandlerSubject.next(action);
          }
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
                const disconnectedStreamId = streamId({
                  actionType: payload.constructor || payload,
                  action: disconnectAction.payload,
                  trackBy
                });
                if (disconnectedStreamId === streamId({ actionType, action, trackBy })) {
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
            new NgxsFirestoreConnectActions.StreamDisconnected(streamId({ actionType, action, trackBy }))
          );
          this.activeFirestoreConnections.splice(
            this.activeFirestoreConnections.indexOf(streamId({ actionType, action, trackBy })),
            1
          );

          // completed if StreamCompleted
          if (connectedActionFinishesOn === 'StreamCompleted') {
            const { actionCompletedHandlerSubject } = getSubjects(streamId({ actionType, action, trackBy }));
            actionCompletedHandlerSubject.next(action);
          }
        }),
        catchError((err) => {
          const { actionCompletedHandlerSubject } = getSubjects(streamId({ actionType, action, trackBy }));
          actionCompletedHandlerSubject.error(err);

          const StreamErroredClass = StreamErrored(actionType);
          this.store.dispatch(new StreamErroredClass(action, err));

          return of({});
        })
      );
    };

    this.firestoreConnectionsSub.push(
      iif(
        () => cancelPrevious,
        // we use switchMap to cancel when action is called more than once
        actionDispatched$.pipe(switchMap(firestoreStreamHandler$)),
        // we use mergeMap to support a same action being called with different payloads.
        actionDispatched$.pipe(mergeMap(firestoreStreamHandler$))
      ).subscribe()
    );
  }

  ngOnDestroy() {
    if (this.firestoreConnectionsSub) {
      this.firestoreConnectionsSub.forEach((sub) => sub.unsubscribe());
    }
  }
}
