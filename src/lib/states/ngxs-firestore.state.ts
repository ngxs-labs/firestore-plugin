import { State, StateContext, NgxsOnInit, Action } from '@ngxs/store';
import { NgxsFirestoreActions } from './ngxs-firestore.actions';

export interface NgxsFirestoreStateModel {
  activeConnections: number;
  reads: number;
  creates: number;
  updates: number;
  deletes: number;
}

@State<NgxsFirestoreStateModel>({
  name: 'ngxs_firestore',
  defaults: {
    activeConnections: 0,
    reads: 0,
    creates: 0,
    updates: 0,
    deletes: 0
  }
})
export class NgxsFirestoreState implements NgxsOnInit {

  ngxsOnInit({ dispatch }: StateContext<NgxsFirestoreStateModel>) {

  }

  @Action(NgxsFirestoreActions.IncrementCount)
  incrementCount(
    { getState, setState, patchState }: StateContext<NgxsFirestoreStateModel>,
    { payload }: NgxsFirestoreActions.IncrementCount
  ) {
    patchState({ [payload.prop]: getState()[payload.prop.toString()] + (payload.quantity || 1) });
  }

  @Action(NgxsFirestoreActions.DecrementCount)
  decrementCount(
    { getState, setState, patchState }: StateContext<NgxsFirestoreStateModel>,
    { payload }: NgxsFirestoreActions.DecrementCount
  ) {
    patchState({ [payload]: getState()[payload] - 1 });
  }

}
