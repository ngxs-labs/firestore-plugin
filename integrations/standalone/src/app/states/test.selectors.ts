import { createSelector } from '@ngxs/store';
import { TestState, TestStateModel } from './test.state';

export const all = createSelector([TestState], (state: TestStateModel) => {
  return state.items;
});
