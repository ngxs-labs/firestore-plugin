import { State, StateContext, NgxsOnInit, Action, Selector } from '@ngxs/store';
import { NgxsFirestoreConnectActions } from './ngxs-firestore-connect.actions';
import { patch, insertItem, removeItem, updateItem } from '@ngxs/store/operators';
import { Injectable } from '@angular/core';

export interface FirestoreConnection {
    id: string;
    connectedAt: Date;
    emmitedAt: Date[];
    reads: number;
    creates: number;
    updates: number;
    deletes: number;
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
    @Selector() public static connections(state: NgxsFirestoreStateModel) {
        return state.connections;
    }

    ngxsOnInit({ dispatch }: StateContext<NgxsFirestoreStateModel>) {}

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
        const { id, items } = payload;
        setState(patch({ connections: updateItem((x) => x.id === id, patch({ reads: items && items.length })) }));
    }

    @Action([NgxsFirestoreConnectActions.StreamDisconnected])
    streamDisconnected(
        { setState, getState }: StateContext<NgxsFirestoreStateModel>,
        { payload }: NgxsFirestoreConnectActions.StreamDisconnected
    ) {
        setState(patch({ connections: removeItem((x) => x.id === payload) }));
    }
}
