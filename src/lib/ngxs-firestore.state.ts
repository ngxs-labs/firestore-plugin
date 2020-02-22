import { State, StateContext, NgxsOnInit, Action, Selector } from '@ngxs/store';
import { NgxsFirestoreActions } from './ngxs-firestore.actions';
import { patch, insertItem, removeItem, updateItem } from '@ngxs/store/operators';

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
export class NgxsFirestoreState implements NgxsOnInit {
    @Selector() public static connections(state: NgxsFirestoreStateModel) {
        return state.connections;
    }
    ngxsOnInit({ dispatch }: StateContext<NgxsFirestoreStateModel>) {}

    @Action([NgxsFirestoreActions.StreamConnected])
    streamConnected(
        { setState }: StateContext<NgxsFirestoreStateModel>,
        { payload }: NgxsFirestoreActions.StreamConnected
    ) {
        const conn = {
            connectedAt: new Date(),
            id: payload
        } as FirestoreConnection;
        setState(patch({ connections: insertItem(conn) }));
    }

    @Action([NgxsFirestoreActions.StreamEmitted])
    streamEmitted(
        { setState }: StateContext<NgxsFirestoreStateModel>,
        { payload }: NgxsFirestoreActions.StreamEmitted
    ) {
        const { id, items } = payload;
        setState(patch({ connections: updateItem((x) => x.id === id, patch({ reads: items && items.length })) }));
    }

    @Action([NgxsFirestoreActions.StreamDisconnected])
    streamDisconnected(
        { setState, getState }: StateContext<NgxsFirestoreStateModel>,
        { payload }: NgxsFirestoreActions.StreamDisconnected
    ) {
        setState(patch({ connections: removeItem((x) => x.id === payload) }));
    }
}
