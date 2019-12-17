import { State, StateContext, NgxsOnInit, Action, Selector } from '@ngxs/store';
import { NgxsFirestoreActions } from './ngxs-firestore-debug.actions';
import { patch, insertItem, removeItem } from '@ngxs/store/operators';

export interface NgxsFirestoreDebugStateModel {
  connections: string[];
  reads: number;
  creates: number;
  updates: number;
  deletes: number;
}

@State<NgxsFirestoreDebugStateModel>({
  name: 'ngxs_firestore_debug',
  defaults: {
    connections: [],
    reads: 0,
    creates: 0,
    updates: 0,
    deletes: 0
  }
})
export class NgxsFirestoreDebugState implements NgxsOnInit {

  @Selector() public static connections(state: NgxsFirestoreDebugStateModel) { return state.connections; }

  ngxsOnInit({ dispatch }: StateContext<NgxsFirestoreDebugStateModel>) {

  }

  @Action(NgxsFirestoreActions.AddConnection)
  addConnection(
    { getState, setState, patchState }: StateContext<NgxsFirestoreDebugStateModel>,
    { payload }: NgxsFirestoreActions.AddConnection
  ) {
    setState(patch({ connections: insertItem(payload) }));
  }

  @Action(NgxsFirestoreActions.RemoveConnection)
  removeConnection(
    { getState, setState, patchState }: StateContext<NgxsFirestoreDebugStateModel>,
    { payload }: NgxsFirestoreActions.AddConnection
  ) {
    setState(patch({ connections: removeItem(x => x === payload) }));
  }

  @Action(NgxsFirestoreActions.SetCount)
  setCount(
    { getState, setState, patchState }: StateContext<NgxsFirestoreDebugStateModel>,
    { payload }: NgxsFirestoreActions.SetCount
  ) {
    patchState({ [payload.prop]: payload.quantity });
  }

  @Action(NgxsFirestoreActions.IncrementCount)
  incrementCount(
    { getState, setState, patchState }: StateContext<NgxsFirestoreDebugStateModel>,
    { payload }: NgxsFirestoreActions.IncrementCount
  ) {
    patchState({ [payload.prop]: getState()[payload.prop.toString()] + (payload.quantity || 1) });
  }

  @Action(NgxsFirestoreActions.DecrementCount)
  decrementCount(
    { getState, setState, patchState }: StateContext<NgxsFirestoreDebugStateModel>,
    { payload }: NgxsFirestoreActions.DecrementCount
  ) {
    patchState({ [payload]: getState()[payload.toString()] - 1 });
  }

}
