import { ActionType } from '@ngxs/store';

export function StreamConnected(actionType: ActionType) {
  return class {
    static readonly type = `${actionType.type} Connected`;
    constructor(public action: any) {}
  };
}

export function StreamEmitted(actionType: ActionType) {
  return class {
    static readonly type = `${actionType.type} Emitted`;
    constructor(public action: any, public payload: any) {}
  };
}

export function Page(actionType: ActionType) {
  return class {
    static readonly type = `Page ${actionType.type}`;
    constructor(public payload: string) {}
  };
}

export function StreamDisconnected(actionType: ActionType) {
  return class {
    static readonly type = `${actionType.type} Disconnected`;
    constructor(public action: any) {}
  };
}

export function StreamErrored(actionType: ActionType) {
  return class {
    static readonly type = `${actionType.type} Errored`;
    constructor(public action: any, public error: any) {}
  };
}
