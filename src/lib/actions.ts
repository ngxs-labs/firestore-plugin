import { ActionType } from '@ngxs/store';

export class Connect {
    public static readonly type = '[NgxsFirestore] Connect';
    constructor(public payload: ActionType | ActionType[]) { }
}

export class Disconnect {
    public static readonly type = '[NgxsFirestore] Disconnect';
    constructor(public payload: ActionType | ActionType[]) { }
}
