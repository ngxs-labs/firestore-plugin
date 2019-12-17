import { NgxsFirestoreDebugStateModel } from './ngxs-firestore-debug.state';

namespace NgxsFirestorePayloads {
  export interface IncrementCount { prop: keyof NgxsFirestoreDebugStateModel; quantity?: number; }
  export interface SetCount { prop: keyof NgxsFirestoreDebugStateModel; quantity?: number; }
}

export namespace NgxsFirestoreActions {
  export class IncrementCount {
    public static readonly type = '[NgxsFirestore] IncrementCount';
    constructor(public payload: NgxsFirestorePayloads.IncrementCount) { }
  }
  export class DecrementCount {
    public static readonly type = '[NgxsFirestore] DecrementCount';
    constructor(public payload: keyof NgxsFirestoreDebugStateModel) { }
  }

  export class AddSub {
    public static readonly type = '[NgxsFirestore] AddSub';
    constructor(public payload: string) { }
  }

  export class SetCount {
    public static readonly type = '[NgxsFirestore] SetCount';
    constructor(public payload: NgxsFirestorePayloads.SetCount) { }
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
