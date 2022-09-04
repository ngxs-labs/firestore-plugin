import { Injectable } from '@angular/core';
import {
  CollectionReference,
  DocumentData,
  FieldPath,
  Firestore,
  limit as limitFn,
  orderBy,
  Query,
  query
} from '@angular/fire/firestore';
import { Actions, getActionTypeFromInstance, ofActionDispatched } from '@ngxs/store';
import { defer, Observable } from 'rxjs';
import { filter, map, startWith, switchMap } from 'rxjs/operators';
import { GetLastPage, GetNextPage } from './actions';
import { createId } from './ngxs-firestore.service';

export type QueryFn<T = DocumentData> = (ref: CollectionReference<T>) => Query<T>;

export interface FirestorePage {
  limit: number;
  id: string;
}

@Injectable()
export class NgxsFirestorePageIdService {
  constructor(private firestore: Firestore) {}

  createId() {
    return createId(this.firestore);
  }
}

@Injectable({ providedIn: 'root' })
export class NgxsFirestorePageService {
  constructor(private actions$: Actions, private pageId: NgxsFirestorePageIdService) {}

  create<T>(
    queryFn: (pageFn: QueryFn<T>) => Observable<T[]>,
    size: number,
    orderByCfg: { fieldPath: string | FieldPath; directionStr?: 'desc' | 'asc' }[]
  ): Observable<{ results: T[]; pageId: string }> {
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
            return orderByCfg.reduce(
              (prev, curr) => query(prev, orderBy(curr.fieldPath, curr.directionStr || 'asc'), limitFn(limit)),
              ref
            );
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
