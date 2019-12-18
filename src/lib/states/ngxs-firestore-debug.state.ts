import { State, StateContext, NgxsOnInit, Action, Selector } from '@ngxs/store';
import { NgxsFirestoreDebugActions } from './ngxs-firestore-debug.actions';
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

  @Action(NgxsFirestoreDebugActions.AddConnection)
  addConnection(
    { getState, setState, patchState }: StateContext<NgxsFirestoreDebugStateModel>,
    { payload }: NgxsFirestoreDebugActions.AddConnection
  ) {
    setState(patch({ connections: insertItem(payload) }));
  }

  @Action(NgxsFirestoreDebugActions.RemoveConnection)
  removeConnection(
    { getState, setState, patchState }: StateContext<NgxsFirestoreDebugStateModel>,
    { payload }: NgxsFirestoreDebugActions.AddConnection
  ) {
    setState(patch({ connections: removeItem(x => x === payload) }));
  }

  @Action(NgxsFirestoreDebugActions.SetCount)
  setCount(
    { getState, setState, patchState }: StateContext<NgxsFirestoreDebugStateModel>,
    { payload }: NgxsFirestoreDebugActions.SetCount
  ) {
    patchState({ [payload.prop]: payload.quantity });
  }

  @Action(NgxsFirestoreDebugActions.IncrementCount)
  incrementCount(
    { getState, setState, patchState }: StateContext<NgxsFirestoreDebugStateModel>,
    { payload }: NgxsFirestoreDebugActions.IncrementCount
  ) {
    patchState({ [payload.prop]: getState()[payload.prop.toString()] + (payload.quantity || 1) });
  }

  @Action(NgxsFirestoreDebugActions.DecrementCount)
  decrementCount(
    { getState, setState, patchState }: StateContext<NgxsFirestoreDebugStateModel>,
    { payload }: NgxsFirestoreDebugActions.DecrementCount
  ) {
    patchState({ [payload]: getState()[payload.toString()] - 1 });
  }

}
