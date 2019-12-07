import { AngularFirestore, QueryFn } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { Inject } from '@angular/core';
import { tap, map, scan } from 'rxjs/operators';
import { Store } from '@ngxs/store';
import { NgxsFirestoreActions } from './../states/ngxs-firestore.actions';

export abstract class FirestoreService<T> {

  protected abstract path: string;

  constructor(
    @Inject(AngularFirestore) protected firestore: AngularFirestore,
    @Inject(Store) protected store: Store,
  ) { }


  public createId() {
    return this.firestore.createId();
  }

  public doc$(id: string): Observable<T> {
    return this.firestore.doc<T>(`${this.path}/${id}`).snapshotChanges().pipe(
      tap(_ => {
        this.store.dispatch(new NgxsFirestoreActions.IncrementCount({ prop: 'reads' }));
      }),
      map(_ => _.payload.data())
    );
  }

  public collection$(queryFn?: QueryFn): Observable<T[]> {
    return this.firestore.collection<T>(this.path, queryFn).snapshotChanges().pipe(
      scan((acc, items) => {
        if (items.length > 0) {
          const itemsAdded = items.filter(item => item.type === 'added').length;
          const itemsModified = items.filter(item => item.type === 'modified').length;

          const accAdded = acc.filter(item => item.type === 'added').length;
          // const accModified = acc.filter(item => item.type === 'modified').length;

          const reads = (itemsAdded - accAdded > 0 ? itemsAdded - accAdded : 0) + itemsModified;
          this.store.dispatch(new NgxsFirestoreActions.IncrementCount({ prop: 'reads', quantity: reads }));
        }

        return items;
      }, []),
      map(items => items.map(item => item.payload.doc.data()))
    );
  }

  public update$(id: string, value: Partial<T>) {
    return from(this.firestore.doc(`${this.path}/${id}`).update(value)).pipe(
      tap(_ => {
        this.store.dispatch(new NgxsFirestoreActions.IncrementCount({ prop: 'updates' }));
      })
    );
  }

  public delete$(id: string) {
    return from(this.firestore.doc(`${this.path}/${id}`).delete()).pipe(
      tap(_ => {
        this.store.dispatch(new NgxsFirestoreActions.IncrementCount({ prop: 'deletes' }));
      })
    );
  }

  public create$(id: string, value: Partial<T>) {
    return from(this.firestore.doc(`${this.path}/${id}`).set(value)).pipe(
      tap(_ => {
        this.store.dispatch(new NgxsFirestoreActions.IncrementCount({ prop: 'creates' }));
      })
    );
  }

}
