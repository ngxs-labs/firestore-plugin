import { Injectable } from '@angular/core';
import { defer, Observable, Subject } from 'rxjs';
import { filter, map, startWith, switchMap, tap, take } from 'rxjs/operators';
import { Actions, getActionTypeFromInstance, ofActionDispatched } from '@ngxs/store';
import { GetNextPage, GetLastPage } from './actions';
import { FieldPath, Firestore, limit as limitFn, orderBy as orderByFn, query } from '@angular/fire/firestore';
import { createId } from './ngxs-firestore.service';
import { QueryFn } from './utils';
import { FirestorePage } from './internal-types';
import { attachAction } from './attach-action';
import { NgxsFirestoreState } from './ngxs-firestore.state';

@Injectable({ providedIn: 'root' })
export class NgxsFirestorePageIdService {
  constructor(private firestore: Firestore) {}

  createId() {
    return createId(this.firestore);
  }
}

@Injectable({ providedIn: 'root' })
export class NgxsFirestorePageService {
  constructor(private actions$: Actions, private pageId: NgxsFirestorePageIdService) {
    this.handlePageActions();
  }

  private actionCompletedHandlerSubjects: { [key: string]: Subject<unknown> } = {};
  private attached = false;

  private handlePageActions() {
    if (!this.attached) {
      attachAction(NgxsFirestoreState, GetNextPage, (_stateContext, action: any) => {
        const pageId = action.payload;
        const actionCompletedHandlerSubject = this.actionCompletedHandlerSubjects[pageId];
        return actionCompletedHandlerSubject?.asObservable().pipe(take(1));
      });

      attachAction(NgxsFirestoreState, GetLastPage, (_stateContext, action: any) => {
        const pageId = action.payload;
        const actionCompletedHandlerSubject = this.actionCompletedHandlerSubjects[pageId];
        return actionCompletedHandlerSubject?.asObservable().pipe(take(1));
      });
      this.attached = true;
    }
  }

  create<T>(
    queryFn: (pageFn: QueryFn<any>) => Observable<T>,
    size: number,
    orderBy: { fieldPath: string | FieldPath; directionStr?: 'desc' | 'asc' }[]
  ): Observable<{ results: T; pageId: string }> {
    return defer(() => {
      const pages: FirestorePage[] = [];

      return this.actions$.pipe(
        ofActionDispatched(GetNextPage, GetLastPage),
        startWith('INIT' as 'INIT'),
        map((action: 'INIT' | GetNextPage | GetLastPage) => {
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
          if (!this.actionCompletedHandlerSubjects[pageId]) {
            this.actionCompletedHandlerSubjects[pageId] = new Subject();
          }

          return queryFn((ref) => {
            return orderBy.reduce(
              (prev, curr) => query(prev, orderByFn(curr.fieldPath, curr.directionStr || 'asc'), limitFn(limit)),
              ref
            );
          }).pipe(
            tap(() => {
              this.actionCompletedHandlerSubjects[pageId].next(true);
            }),
            map((results) => {
              return { results, pageId, pageSize: limit };
            })
          );
        })
      );
    });
  }
}
