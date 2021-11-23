import { Injectable } from '@angular/core';
import { defer, Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { Actions, ActionType, getActionTypeFromInstance, ofActionDispatched, Store } from '@ngxs/store';
import { NgxsFirestorePage } from './ngxs-firestore-page.state';
import { QueryFn } from '@angular/fire/firestore';

export class GetNextPage {
  static readonly type = 'GetNextPage';
  constructor(public payload: ActionType) {}
}

export class SavePage {
  static readonly type = 'SavePage';
  constructor(public payload: string, public size: number) {}
}

@Injectable({ providedIn: 'root' })
export abstract class NgxsFirestorePageService {
  constructor(private actions$: Actions, private store: Store) {}

  create(fn: (queryFn: QueryFn) => Observable<any>, size: number) {
    return defer(() => {
      return this.actions$.pipe(
        ofActionDispatched(GetNextPage),
        map(({ payload }) => {
          const id = getActionTypeFromInstance(payload);
          const value = (this.store.selectSnapshot(NgxsFirestorePage(id))?.size || 0) + size;
          debugger;
          this.store.dispatch(new SavePage(id, value));
          return value;
        }),
        switchMap((value) => {
          debugger;
          return fn((ref) => ref.limit(value));
        }),
        tap((value) => {
          debugger;
        })
      );
    });
  }
}
