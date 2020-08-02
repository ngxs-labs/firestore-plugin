import { createSelector } from '@ngxs/store';
import { NgxsFirestoreState, NgxsFirestoreStateModel } from './ngxs-firestore.state';

export const ngxsFirectoreConnections = createSelector([NgxsFirestoreState], (state: NgxsFirestoreStateModel) => {
  return state.connections;
});
