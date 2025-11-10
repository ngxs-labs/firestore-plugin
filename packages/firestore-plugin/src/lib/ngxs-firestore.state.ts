import { State, StateContext, NgxsOnInit, Action, StateToken } from '@ngxs/store';
import { NgxsFirestoreConnectActions } from './ngxs-firestore-connect.actions';
import { patch, insertItem, removeItem, updateItem } from '@ngxs/store/operators';
import { Injectable } from '@angular/core';

export const NGXS_FIRESTORE_STATE_TOKEN = new StateToken<string[]>('ngxs_firestore');

export interface FirestoreConnection {
  id: string;
  connectedAt: Date;
  emmitedAt: Date[];
}

export interface NgxsFirestoreStateModel {
  connections: FirestoreConnection[];
}

@State<NgxsFirestoreStateModel>({
  name: NGXS_FIRESTORE_STATE_TOKEN,
  defaults: {
    connections: []
  }
})
@Injectable()
export class NgxsFirestoreState implements NgxsOnInit {
  ngxsOnInit(_ctx: StateContext<NgxsFirestoreStateModel>) {}

  @Action([NgxsFirestoreConnectActions.StreamConnected])
  streamConnected(
    { setState }: StateContext<NgxsFirestoreStateModel>,
    { payload }: NgxsFirestoreConnectActions.StreamConnected
  ) {
    const conn = {
      connectedAt: new Date(),
      id: payload
    } as FirestoreConnection;
    setState(patch({ connections: insertItem(conn) }));
  }

  @Action([NgxsFirestoreConnectActions.StreamEmitted])
  streamEmitted(
    { setState }: StateContext<NgxsFirestoreStateModel>,
    { payload }: NgxsFirestoreConnectActions.StreamEmitted
  ) {
    const { id } = payload;
    setState(
      patch<NgxsFirestoreStateModel>({
        connections: updateItem((x) => x.id === id, patch({ emmitedAt: insertItem(new Date()) }))
      })
    );
  }

  @Action([NgxsFirestoreConnectActions.StreamDisconnected])
  streamDisconnected(
    { setState, getState }: StateContext<NgxsFirestoreStateModel>,
    { payload }: NgxsFirestoreConnectActions.StreamDisconnected
  ) {
    setState(
      patch<NgxsFirestoreStateModel>({ connections: removeItem((x) => x.id === payload) })
    );
  }
}
