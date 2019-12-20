import { race } from 'rxjs';
import { takeUntil, finalize, take, tap, filter, delay } from 'rxjs/operators';
import { ofActionCompleted, ActionType, ensureStoreMetadata, getActionTypeFromInstance, Actions, ActionCompletion } from '@ngxs/store';
import { emitAction, disconnectAction } from '../util/action-creator-helper';
import { Disconnect } from '../actions';
import { StateClassInternal } from '@ngxs/store/src/internal/internals';
import { NgxsInjector } from '../services/ngxs-injector.service';
import { NgxsActiveConnectionsService } from '../services/ngxs-active-connections.service';

export function NgxsFirestoreConnect(
    actionType: ActionType,
    emitPatchFn: (payload) => {}
): MethodDecorator {
    return (target, propertyKey: string | Symbol, descriptor: PropertyDescriptor) => {

        const originalMethod = descriptor.value;
        const action = getActionTypeFromInstance(actionType);
        const emitActionType = emitAction({ type: action });
        const emitType = getActionTypeFromInstance(emitActionType);
        const meta = ensureStoreMetadata(target.constructor as StateClassInternal);

        class NgxsFirestoreEmitAction {
            public static readonly type = emitType;
            constructor(public payload: unknown) { }
        }

        if (emitPatchFn) {
            if (!meta.actions[emitType]) {
                meta.actions[emitType] = [];
            }

            target[emitType] = ({ patchState }, { payload }) => {
                patchState(emitPatchFn(payload));
            };

            meta.actions[emitType].push({
                fn: emitType,
                options: {},
                type: emitType
            });
        }

        descriptor.value = function () {
            const activeConns = NgxsInjector.injector.get(NgxsActiveConnectionsService);
            if (activeConns.contains(action)) {
                return;
            }
            const { dispatch } = arguments[0];

            activeConns.add(action,
                originalMethod.apply(this, arguments).pipe(
                    takeUntil(
                        race(
                            NgxsInjector.injector.get(Actions).pipe(
                                ofActionCompleted(disconnectAction({ type: action }))
                            ),
                            NgxsInjector.injector.get(Actions).pipe(
                                ofActionCompleted(Disconnect),
                                filter((actionCtx: ActionCompletion) => actionCtx.action.payload.type === action)
                            )
                        )
                    ),
                    tap(payload => {
                        dispatch(new NgxsFirestoreEmitAction(payload));
                    }),
                    finalize(() => {
                        activeConns.remove(action);
                    })
                ).subscribe()
            );

            return NgxsInjector.injector.get(Actions).pipe(
                ofActionCompleted({ type: emitType }),
                take(1),
                delay(0)
            );
        };
    };
}
