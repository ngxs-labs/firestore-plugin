import { State, StateContext, NgxsOnInit, Action, Selector } from '@ngxs/store';
import { NgxsFirestoreActions } from './ngxs-firestore.actions';
import { patch, insertItem, removeItem } from '@ngxs/store/operators';

export interface NgxsFirestoreStateModel {
  connections: string[];
  reads: number;
  creates: number;
  updates: number;
  deletes: number;
}

@State<NgxsFirestoreStateModel>({
  name: 'ngxs_firestore',
  defaults: {
    connections: [],
    reads: 0,
    creates: 0,
    updates: 0,
    deletes: 0
  }
})
export class NgxsFirestoreState implements NgxsOnInit {

  @Selector() public static connections(state: NgxsFirestoreStateModel) { return state.connections; }

  ngxsOnInit({ dispatch }: StateContext<NgxsFirestoreStateModel>) {

  }

  @Action(NgxsFirestoreActions.AddConnection)
  addConnection(
    { getState, setState, patchState }: StateContext<NgxsFirestoreStateModel>,
    { payload }: NgxsFirestoreActions.AddConnection
  ) {
    setState(patch({ connections: insertItem(payload) }));
  }

  @Action(NgxsFirestoreActions.RemoveConnection)
  removeConnection(
    { getState, setState, patchState }: StateContext<NgxsFirestoreStateModel>,
    { payload }: NgxsFirestoreActions.AddConnection
  ) {
    setState(patch({ connections: removeItem(x => x === payload) }));
  }

  @Action(NgxsFirestoreActions.SetCount)
  setCount(
    { getState, setState, patchState }: StateContext<NgxsFirestoreStateModel>,
    { payload }: NgxsFirestoreActions.SetCount
  ) {
    patchState({ [payload.prop]: payload.quantity });
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
    patchState({ [payload]: getState()[payload.toString()] - 1 });
  }

}
