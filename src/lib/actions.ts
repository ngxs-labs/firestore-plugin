export class DisconnectStream {
    constructor(actionType) {
        return { type: `${actionType.type} Disconnect` };
    }
}

export class DisconnectAll {
    static readonly type = '[NgxsFirestore] DisconnectAll';
}

export class Disconnect {
    static readonly type = '[NgxsFirestore] Disconnect';
    constructor(public payload: any) {}
}
