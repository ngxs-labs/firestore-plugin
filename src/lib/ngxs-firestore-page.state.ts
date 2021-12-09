import { State, StateContext, NgxsOnInit, Action } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { SavePage } from './ngxs-firestore-page.actions';
import { iif, insertItem, patch, updateItem } from '@ngxs/store/operators';

export interface FirestorePage {
  limit: number;
  id: string;
}

export interface NgxsFirestorePageStateModel {
  pages: FirestorePage[];
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
    ctx.setState(
      patch<NgxsFirestorePageStateModel>({
        pages: iif(
          (s) => !!s.find((c) => c.id === action.payload.id),
          updateItem((c) => c.id === action.payload.id, patch({ ...action.payload })),
          insertItem(action.payload)
        )
      })
    );
  }
}
