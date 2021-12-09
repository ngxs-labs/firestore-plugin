import { Injectable } from '@angular/core';
import { defer, Observable } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';
import { Actions, ofActionDispatched, Store } from '@ngxs/store';
import { AngularFirestore, FieldPath, QueryFn } from '@angular/fire/firestore';
import { SavePage } from './ngxs-firestore-page.actions';
import { GetNextPage } from './actions';
import { ngxsFirestorePage } from './ngxs-firestore-page.selector';

@Injectable({ providedIn: 'root' })
export abstract class NgxsFirestorePageService {
  constructor(private actions$: Actions, private store: Store, private firestore: AngularFirestore) {}

  create<T>(
    queryFn: (pageFn: QueryFn) => Observable<T>,
    size: number,
    orderBy: { fieldPath: string | FieldPath; directionStr?: 'desc' | 'asc' }[]
  ): Observable<{ results: T; pageId: string }> {
    return defer(() => {
      return this.actions$.pipe(
        ofActionDispatched(GetNextPage),
        startWith({ payload: this.firestore.createId() }),
        map(({ payload }) => {
          const limit = (this.store.selectSnapshot(ngxsFirestorePage(payload))?.limit || 0) + size;
          this.store.dispatch(new SavePage({ id: payload, limit }));

          return { pageId: payload, limit };
        }),
        switchMap(({ pageId, limit }) => {
          return queryFn((ref) =>
            orderBy.reduce((prev, curr) => prev.orderBy(curr.fieldPath, curr.directionStr || 'asc'), ref).limit(limit)
          ).pipe(
            map((results) => {
              return { results, pageId };
            })
          );
        })
      );
    });
  }
}
