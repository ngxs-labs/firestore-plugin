namespace NgxsFirestoreDebugPayloads {
  export interface StreamEmitted {
    id: string;
    items: any;
  }
}

export namespace NgxsFirestoreConnectActions {
  export class StreamConnected {
    static readonly type = '[NgxsFirestore] Connected';
    constructor(public payload: string) {}
  }
  export class StreamEmitted {
    static readonly type = '[NgxsFirestore] Emitted';
    constructor(public payload: NgxsFirestoreDebugPayloads.StreamEmitted) {}
  }
  export class StreamDisconnected {
    static readonly type = '[NgxsFirestore] Disconnected';
    constructor(public payload: string) {}
  }
}
