import { createSelector } from '@ngxs/store';
import { NgxsFirestorePageState, NgxsFirestorePageStateModel } from './ngxs-firestore-page.state';

export function ngxsFirestorePage(id: string) {
  return createSelector([NgxsFirestorePageState], (state: NgxsFirestorePageStateModel) => {
    return state.pages.find((page) => page.id === id);
  });
}
