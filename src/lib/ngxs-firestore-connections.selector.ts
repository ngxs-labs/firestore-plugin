import { createSelector } from '@ngxs/store';
import { NgxsFirestoreState, NgxsFirestoreStateModel } from './ngxs-firestore.state';

export const connections = createSelector([NgxsFirestoreState], (state: NgxsFirestoreStateModel) => {
    return state.connections;
});
