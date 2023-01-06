import { State, StateContext, NgxsOnInit, Action } from '@ngxs/store';
import { NgxsFirestoreConnectActions } from './ngxs-firestore-connect.actions';
import { patch, insertItem, removeItem, updateItem } from '@ngxs/store/operators';
import { Injectable } from '@angular/core';

export interface FirestoreConnection {
  id: string;
  connectedAt: Date;
  emmitedAt: Date;
}

export interface NgxsFirestoreStateModel {
  connections: FirestoreConnection[];
}
@State<NgxsFirestoreStateModel>({
  name: 'ngxs_firestore',
  defaults: {
    connections: []
  }
})
@Injectable()
export class NgxsFirestoreState implements NgxsOnInit {
  ngxsOnInit(_ctx: StateContext<NgxsFirestoreStateModel>) {
  }

  @Action([NgxsFirestoreConnectActions.StreamConnected])
  streamConnected(
    { setState, getState }: StateContext<NgxsFirestoreStateModel>,
    { payload }: NgxsFirestoreConnectActions.StreamConnected
  ) {
    const state = getState();
    const exists = state.connections.findIndex((r) => r.id === payload);
    if (exists > -1) {
      setState(
        patch<NgxsFirestoreStateModel>({
          connections: updateItem((x) => x.id === payload, patch({ connectedAt: new Date() }))
        })
      );
    } else {
      const conn = {
        connectedAt: new Date(),
        id: payload
      } as FirestoreConnection;
      setState(patch({ connections: insertItem(conn) }));
    }

    if (state.connections.length > 30) {
      console.log('firestore-plugin cleaning connections: ' + state.connections.length);

      let conns = [...state.connections];
      conns = conns.sort((a, b) => {
        if (a.id === b.id) {
          return a.connectedAt < b.connectedAt ? -1 : 1;
        } else {
          return a.id < b.id ? -1 : 1;
        }
      });

      conns = conns.filter((value, index, self) => {
        if (index == self.length - 1) {
          // keep the last value, it has to be correct
          return true;
        }
        // Check ahead and remove duplicate entries older than 1 day
        if (value.id === self[index + 1].id && value.connectedAt < self[index + 1].connectedAt) {
          return false;
        }
        return true;
      });
      setState(patch({ connections: conns }));
    }
  }

  @Action([NgxsFirestoreConnectActions.StreamEmitted])
  streamEmitted(
    { setState }: StateContext<NgxsFirestoreStateModel>,
    { payload }: NgxsFirestoreConnectActions.StreamEmitted
  ) {
    const { id } = payload;
    setState(
      patch<NgxsFirestoreStateModel>({
        connections: updateItem((x) => x.id === id, patch({ emmitedAt: new Date() }))
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
