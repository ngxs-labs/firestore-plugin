import { Injectable } from '@angular/core';
import { defer, Observable, Subject } from 'rxjs';
import { filter, map, startWith, switchMap, tap, take } from 'rxjs/operators';
import { Actions, getActionTypeFromInstance, ofActionDispatched } from '@ngxs/store';
import { GetNextPage, GetLastPage } from '../../../src/lib/actions';
import { AngularFirestore, QueryFn, FieldPath } from '@angular/fire/compat/firestore';
import { FirestorePage } from '../../../src/lib/internal-types';
import { attachAction } from '../../../src/lib/attach-action';
import { NgxsFirestoreState } from '../../../src/lib/ngxs-firestore.state';

type OrderBy = { fieldPath: string | FieldPath; directionStr?: 'desc' | 'asc' };

@Injectable({ providedIn: 'root' })
export class NgxsFirestorePageIdService {
  constructor(private firestore: AngularFirestore) {}

  createId() {
    return this.firestore.createId();
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
        return actionCompletedHandlerSubject.asObservable().pipe(take(1));
      });

      attachAction(NgxsFirestoreState, GetLastPage, (_stateContext, action: any) => {
        const pageId = action.payload;
        const actionCompletedHandlerSubject = this.actionCompletedHandlerSubjects[pageId];
        return actionCompletedHandlerSubject.asObservable().pipe(take(1));
      });
      this.attached = true;
    }
  }

  create<T>(
    queryFn: (pageFn: QueryFn<any>) => Observable<T>,
    size: number,
    orderBy: OrderBy[]
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
            return orderBy
              .reduce((prev: any, curr) => {
                return prev.orderBy(curr.fieldPath, curr.directionStr || 'asc');
              }, ref)
              .limit(limit);
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
