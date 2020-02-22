import { ActionType } from '@ngxs/store';
import { ActionContext } from '@ngxs/store/src/actions-stream';

export function StreamConnectedOf(actionType: ActionType) {
    return class {
        static readonly type = `${actionType.type} Connected`;
        constructor(public action: ActionType) {}
    };
}

export function StreamEmittedOf(actionType: ActionType) {
    return class {
        static readonly type = `${actionType.type} Emitted`;
        constructor(public actionCtx: ActionContext, public payload: any) {}
    };
}

export function StreamDisconnectedOf(actionType: ActionType) {
    return class {
        static readonly type = `${actionType.type} Disconnected`;
        constructor() {}
    };
}

export function StreamDisconnectOf(actionType: ActionType): ActionType {
    return { type: `${actionType.type} Disconnect` };
}
