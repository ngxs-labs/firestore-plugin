import { State, StateContext, NgxsOnInit, Action, Selector } from '@ngxs/store';
import { NgxsFirestoreDebugActions } from './ngxs-firestore.actions';
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
    firestoreConnections: FirestoreConnection[];
    connections: string[];
    reads: number;
    creates: number;
    updates: number;
    deletes: number;
}

@State<NgxsFirestoreStateModel>({
    name: 'ngxs_firestore',
    defaults: {
        firestoreConnections: [],
        connections: [],
        reads: 0,
        creates: 0,
        updates: 0,
        deletes: 0
    }
})
export class NgxsFirestoreState implements NgxsOnInit {
    @Selector() public static connections(state: NgxsFirestoreStateModel) {
        return state.connections;
    }

    @Selector() public static firestoreConnections(state: NgxsFirestoreStateModel) {
        return state.firestoreConnections;
    }

    ngxsOnInit({ dispatch }: StateContext<NgxsFirestoreStateModel>) {}

    @Action(NgxsFirestoreDebugActions.AddConnection)
    addConnection(
        { getState, setState, patchState }: StateContext<NgxsFirestoreStateModel>,
        { payload }: NgxsFirestoreDebugActions.AddConnection
    ) {
        setState(patch({ connections: insertItem(payload) }));
    }

    @Action(NgxsFirestoreDebugActions.RemoveConnection)
    removeConnection(
        { getState, setState, patchState }: StateContext<NgxsFirestoreStateModel>,
        { payload }: NgxsFirestoreDebugActions.AddConnection
    ) {
        setState(patch({ connections: removeItem((x) => x === payload) }));
    }

    @Action(NgxsFirestoreDebugActions.IncrementCount)
    incrementCount(
        { getState, setState, patchState }: StateContext<NgxsFirestoreStateModel>,
        { payload }: NgxsFirestoreDebugActions.IncrementCount
    ) {
        patchState({ [payload.prop]: getState()[payload.prop.toString()] + (payload.quantity || 1) });
    }

    @Action([NgxsFirestoreDebugActions.StreamConnected])
    streamConnected(
        { setState }: StateContext<NgxsFirestoreStateModel>,
        { payload }: NgxsFirestoreDebugActions.StreamConnected
    ) {
        const conn = {
            connectedAt: new Date(),
            id: payload
        } as FirestoreConnection;
        setState(patch({ firestoreConnections: insertItem(conn) }));
    }

    @Action([NgxsFirestoreDebugActions.StreamEmitted])
    streamEmitted(
        { setState }: StateContext<NgxsFirestoreStateModel>,
        { payload }: NgxsFirestoreDebugActions.StreamEmitted
    ) {
        const { id, items } = payload;
        setState(
            patch({ firestoreConnections: updateItem((x) => x.id === id, patch({ reads: items && items.length })) })
        );
    }

    @Action([NgxsFirestoreDebugActions.StreamDisconnected])
    streamDisconnected(
        { setState, getState }: StateContext<NgxsFirestoreStateModel>,
        { payload }: NgxsFirestoreDebugActions.StreamDisconnected
    ) {
        setState(patch({ firestoreConnections: removeItem((x) => x.id === payload) }));
    }
}
