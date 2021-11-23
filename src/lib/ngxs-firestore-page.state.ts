import { State, StateContext, NgxsOnInit, createSelector, Action } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { SavePage } from './ngxs-firestore-page.service';
import { iif, insertItem, patch, updateItem } from '@ngxs/store/operators';

export interface FirestorePage {
  action: string;
  size: number;
}

export interface NgxsFirestorePageStateModel {
  pages: FirestorePage[];
}

export function NgxsFirestorePage(action: string) {
  return createSelector([NgxsFirestorePageState], (state: NgxsFirestorePageStateModel) => {
    return state.pages.find((page) => page.action === action);
  });
}

@State<NgxsFirestorePageStateModel>({
  name: 'ngxs_firestore_page',
  defaults: {
    pages: []
  }
})
@Injectable()
export class NgxsFirestorePageState implements NgxsOnInit {
  ngxsOnInit(_ctx: StateContext<NgxsFirestorePageStateModel>) {}

  @Action(SavePage)
  savePage(ctx: StateContext<NgxsFirestorePageStateModel>, action: SavePage) {
    debugger;
    ctx.setState(
      patch<NgxsFirestorePageStateModel>({
        pages: iif(
          (s) => !!s.find((c) => c.action === action.payload),
          updateItem((c) => c.action === action.payload, patch({ ...action })),
          insertItem({ action: action.payload, size: action.size })
        )
      })
    );
  }
}
