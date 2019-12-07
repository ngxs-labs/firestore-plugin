import { NgxsFirestoreStateModel } from './ngxs-firestore.state';

namespace NgxsFirestorePayloads {
  export interface IncrementCount { prop: keyof NgxsFirestoreStateModel; quantity?: number; }
}

export namespace NgxsFirestoreActions {
  export class IncrementCount {
    public static readonly type = '[NgxsFirestore] IncrementCount';
    constructor(public payload: NgxsFirestorePayloads.IncrementCount) { }
  }
  export class DecrementCount {
    public static readonly type = '[NgxsFirestore] DecrementCount';
    constructor(public payload: keyof NgxsFirestoreStateModel) { }
  }
}
