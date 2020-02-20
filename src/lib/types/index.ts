import { ActionContext } from '@ngxs/store/src/actions-stream';

export type Connected<T> = { action: T };
export type Emitted<T, U> = { actionCtx: ActionContext<T>; payload: U };
export type Disconnected<T> = { action: T };
