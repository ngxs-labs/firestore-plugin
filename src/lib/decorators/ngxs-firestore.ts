import { Subscription, race } from 'rxjs';
import { takeUntil, finalize, take, tap, filter } from 'rxjs/operators';
import { ofActionCompleted, ActionType, ensureStoreMetadata, getActionTypeFromInstance } from '@ngxs/store';
import { emitAction, disconnectAction } from '../helpers/action-creator-helper';
import { Disconnect } from '../actions';

export function NgxsFirestore(
    actionType: ActionType,
    fn?: (payload: any) => {}
): MethodDecorator {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {

        const originalMethod = descriptor.value;
        let sub: Subscription;
        const action = getActionTypeFromInstance(actionType);
        const emitActionType = emitAction({ type: action })
        const emitType = getActionTypeFromInstance(emitActionType);
        const meta = ensureStoreMetadata(target.constructor);
        class NgxsFirestoreEmitAction {
            public static readonly type = emitType;
            constructor(public payload: any) { }
        }

        if (fn) {
            if (!meta.actions[emitType]) {
                meta.actions[emitType] = [];
            }

            target[emitType] = ({ patchState }, { payload }) => {
                patchState(fn(payload))
            }

            meta.actions[emitType].push({
                fn: emitType,
                options: {},
                type: emitType
            });
        }

        descriptor.value = function () {
            if (sub) {
                return;
            }

            const { dispatch } = arguments[0]
            sub = originalMethod.apply(this, arguments).pipe(
                takeUntil(
                    race(
                        this.actions.pipe(ofActionCompleted(disconnectAction({ type: action }))),
                        this.actions.pipe(ofActionCompleted(Disconnect), filter((actionCtx: any) => {
                            return actionCtx.action.payload.type === action;
                        }))
                    )
                ),
                tap(payload => {
                    dispatch(new NgxsFirestoreEmitAction(payload));
                }),
                finalize(() => {
                    sub = null;
                })
            ).subscribe();

            return this.actions.pipe(
                ofActionCompleted({ type: emitType }),
                take(1)
            );
        };
    };
}
