import { Injectable } from '@angular/core';
import { defer, Observable } from 'rxjs';
import { filter, map, startWith, switchMap } from 'rxjs/operators';
import { Actions, getActionTypeFromInstance, ofActionDispatched } from '@ngxs/store';
import { AngularFirestore, FieldPath, QueryFn } from '@angular/fire/compat/firestore';
import { GetNextPage, GetLastPage } from './actions';
export interface FirestorePage {
  limit: number;
  id: string;
}

@Injectable()
export class NgxsFirestorePageIdService {
  constructor(private firestore: AngularFirestore) {}

  createId() {
    return this.firestore.createId();
  }
}

@Injectable({ providedIn: 'root' })
export class NgxsFirestorePageService {
  constructor(private actions$: Actions, private pageId: NgxsFirestorePageIdService) {}

  create<T>(
    queryFn: (pageFn: QueryFn) => Observable<T>,
    size: number,
    orderBy: { fieldPath: string | FieldPath; directionStr?: 'desc' | 'asc' }[]
  ): Observable<{ results: T; pageId: string }> {
    return defer(() => {
      const pages: FirestorePage[] = [];

      return this.actions$.pipe(
        ofActionDispatched(GetNextPage, GetLastPage),
        startWith('INIT'),
        map((action) => {
          const actionType = <'GetNextPage' | 'GetLastPage'>getActionTypeFromInstance(action);
          const payload = action === 'INIT' ? this.pageId.createId() : action.payload;
          return { payload, actionType: actionType || 'GetNextPage' };
        }),
        filter(({ payload, actionType }) => {
          return pages.length === 0 || !!pages.find((page) => page.id === payload);
        }),
        map(({ payload, actionType }) => {
          const thePage = pages.find((page) => page.id === payload);
          let limit = thePage?.limit || 0;

          if (actionType === 'GetNextPage') {
            limit += size;
          } else if (limit - size > 0) {
            limit -= size;
          }

          // firestore max linit is 10000
          const skip = thePage?.limit === limit || limit > 10000;

          if (thePage) {
            thePage.limit = limit;
          } else {
            pages.push({ id: payload, limit });
          }

          return { pageId: payload, limit, skip };
        }),
        filter(({ skip }) => {
          return !skip;
        }),
        switchMap(({ pageId, limit }) => {
          return queryFn((ref) => {
            return orderBy
              .reduce((prev, curr) => prev.orderBy(curr.fieldPath, curr.directionStr || 'asc'), ref)
              .limit(limit);
          }).pipe(
            map((results) => {
              return { results, pageId, pageSize: limit };
            })
          );
        })
      );
    });
  }
}
