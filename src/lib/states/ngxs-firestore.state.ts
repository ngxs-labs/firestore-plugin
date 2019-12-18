import { NgxsOnInit, StateContext } from '@ngxs/store';
import { finalize, tap } from 'rxjs/operators';
import { FirestoreService } from '../services/firestore.service';
import { patch, updateItem } from '@ngxs/store/operators';

export interface NgxsFirestoreItem {
  id: string;
}

export interface NgxsFirestoreStateModel<T extends NgxsFirestoreItem> {
  items: T[];
}

export class NgxsFirestoreState<T extends NgxsFirestoreItem> implements NgxsOnInit {

  constructor(
    protected FS: FirestoreService<T>
  ) { }

  ngxsOnInit({ dispatch }: StateContext<NgxsFirestoreStateModel<T>>) {

  }

  getAllOnce({ patchState }: StateContext<NgxsFirestoreStateModel<T>>) {
    return this.FS.collectionOnce$().pipe(
      tap(items => {
        patchState({ items });
      })
    );
  }

  getOnce({ setState }, { payload }) {
    return this.FS.docOnce$(payload).pipe(
      tap(item => {
        setState(patch({ items: updateItem(x => x.id === payload, item) }));
      })
    );
  }

  getAll({ patchState }: StateContext<NgxsFirestoreStateModel<T>>) {
    return this.FS.collection$().pipe();
  }

  create({ patchState, dispatch }: StateContext<NgxsFirestoreStateModel<T>>, { payload }) {
    return this.FS.create$(payload.id, payload).pipe(
      finalize(() => {
        // dispatch(new RacesActions.GetAllOnce());
      })
    );
  }

  update({ patchState, dispatch }: StateContext<NgxsFirestoreStateModel<T>>, { payload }) {
    return this.FS.update$(payload.id, {
      ...payload
    }).pipe(
      finalize(() => {
        // dispatch(new RacesActions.GetOnce(payload.id));
      })
    );
  }

  delete({ patchState, dispatch }: StateContext<NgxsFirestoreStateModel<T>>, { payload }) {
    return this.FS.delete$(payload).pipe(
      finalize(() => {
        // dispatch(new RacesActions.GetAllOnce());
      })
    );
  }
}
