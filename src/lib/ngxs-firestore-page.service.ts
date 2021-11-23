import { Injectable } from '@angular/core';
import { defer, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Actions, getActionTypeFromInstance, ofActionDispatched, Store } from '@ngxs/store';
import { NgxsFirestorePage } from './ngxs-firestore-page.state';
import { FieldPath, QueryFn } from '@angular/fire/firestore';
import { SavePage } from './ngxs-firestore-page.actions';
import { GetNextPage } from './actions';

@Injectable({ providedIn: 'root' })
export abstract class NgxsFirestorePageService {
  constructor(private actions$: Actions, private store: Store) {}

  create<T>(
    queryFn: (pageFn: QueryFn) => Observable<T>,
    size: number,
    orderBy: { fieldPath: string | FieldPath; directionStr?: 'desc' | 'asc' }[]
  ) {
    return defer(() => {
      return this.actions$.pipe(
        ofActionDispatched(GetNextPage),
        map(({ payload }) => {
          const id = getActionTypeFromInstance(payload);
          const value = (this.store.selectSnapshot(NgxsFirestorePage(id))?.size || 0) + size;
          this.store.dispatch(new SavePage(id, value));
          return value;
        }),
        switchMap((value) => {
          return queryFn((ref) =>
            orderBy.reduce((prev, curr) => prev.orderBy(curr.fieldPath, curr.directionStr || 'asc'), ref).limit(value)
          );
        })
      );
    });
  }
}
