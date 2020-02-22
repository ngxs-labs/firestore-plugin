import { NgxsFirestoreStateModel } from './ngxs-firestore.state';
import { ActionType } from '@ngxs/store';
namespace NgxsFirestoreDebugPayloads {
    export interface IncrementCount {
        prop: keyof NgxsFirestoreStateModel;
        quantity?: number;
    }
    export interface SetCount {
        prop: keyof NgxsFirestoreStateModel;
        quantity?: number;
    }

    export interface StreamEmitted {
        id: string;
        items: any;
    }
}

export namespace NgxsFirestoreActions {
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

    export class Disconnect {
        static readonly type = '[NgxsFirestore] Disconnect';
        constructor(public payload: ActionType) {}
    }
}
