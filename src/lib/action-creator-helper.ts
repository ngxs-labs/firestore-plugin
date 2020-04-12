import { ActionType } from '@ngxs/store';

export function disconnectAction(actionType: ActionType): ActionType {
    return { type: disconnectActionName(actionType) };
}

export function disconnectActionName(actionType: ActionType): string {
    return `${actionType.type} Disconnect`;
}

export function emitActionName(actionType: ActionType): string {
    return `${actionType.type} Emit`;
}
