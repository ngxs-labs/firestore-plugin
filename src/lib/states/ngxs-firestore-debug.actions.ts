import { NgxsFirestoreDebugStateModel } from './ngxs-firestore-debug.state';

namespace NgxsFirestoreDebugPayloads {
  export interface IncrementCount { prop: keyof NgxsFirestoreDebugStateModel; quantity?: number; }
  export interface SetCount { prop: keyof NgxsFirestoreDebugStateModel; quantity?: number; }
}

export namespace NgxsFirestoreDebugActions {
  export class IncrementCount {
    public static readonly type = '[NgxsFirestore] IncrementCount';
    constructor(public payload: NgxsFirestoreDebugPayloads.IncrementCount) { }
  }

  export class AddConnection {
    public static readonly type = '[NgxsFirestore] AddConnection';
    constructor(public payload: string) { }
  }

  export class RemoveConnection {
    public static readonly type = '[NgxsFirestore] RemoveConnection';
    constructor(public payload: string) { }
  }
}
