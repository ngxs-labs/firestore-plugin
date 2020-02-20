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

export namespace NgxsFirestoreDebugActions {
    export class IncrementCount {
        public static readonly type = '[NgxsFirestore] IncrementCount';
        constructor(public payload: NgxsFirestoreDebugPayloads.IncrementCount) {}
    }

    export class AddConnection {
        public static readonly type = '[NgxsFirestore] AddConnection';
        constructor(public payload: string) {}
    }

    export class RemoveConnection {
        public static readonly type = '[NgxsFirestore] RemoveConnection';
        constructor(public payload: string) {}
    }

    export class StreamConnected {
        static readonly type = '[StreamPlugin] Connected';
        constructor(public payload: string) {}
    }

    export class StreamEmitted {
        static readonly type = '[StreamPlugin] Emitted';
        constructor(public payload: NgxsFirestoreDebugPayloads.StreamEmitted) {}
    }

    export class StreamDisconnected {
        static readonly type = '[StreamPlugin] Disconnected';
        constructor(public payload: string) {}
    }

    export class Disconnect {
        static readonly type = '[StreamPlugin] Disconnect';
        constructor(public payload: ActionType) {}
    }
}
