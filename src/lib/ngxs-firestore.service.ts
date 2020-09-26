import { AngularFirestore, QueryFn, QueryDocumentSnapshot } from '@angular/fire/firestore';
import { Observable, from, throwError } from 'rxjs';
import { Inject, Injectable } from '@angular/core';
import { map, take, tap, finalize, mapTo } from 'rxjs/operators';
import { Store } from '@ngxs/store';

@Injectable()
export abstract class NgxsFirestore<T> {
  protected abstract path: string;
  protected idField: string;
  protected mapToDb: (value: T) => any;
  protected mapFromDb: (value: any) => T;
  private activePagedQuery: { lastDoc?: QueryDocumentSnapshot<T>; page?: string; queryFn?: string } = null;

  constructor(@Inject(AngularFirestore) protected firestore: AngularFirestore, @Inject(Store) protected store: Store) {}

  public page$(queryFn?: QueryFn): Observable<T[]> {
    if (!!this.activePagedQuery && this.activePagedQuery.queryFn !== queryFn + '') {
      return throwError('NgxsFirestore page$ error. Yon can have only one paging query per service instance.');
    }

    if (!this.activePagedQuery) {
      this.activePagedQuery = {
        queryFn: queryFn + ''
      };
    }

    return this.firestore
      .collection<T>(this.path, (ref) =>
        queryFn(ref).startAfter((this.activePagedQuery && this.activePagedQuery.lastDoc) || null)
      )
      .snapshotChanges()
      .pipe(
        tap((items) => {
          const start = items.length;
          this.activePagedQuery = {
            ...this.activePagedQuery,
            lastDoc: items.length > 0 && items[items.length - 1].payload.doc,
            page: `${start} - ${start + 10}`
          };
        }),
        map((items) => items.map((item) => item.payload.doc.data())),
        finalize(() => (this.activePagedQuery = null))
      );
  }

  public pageOnce$(queryFn?: QueryFn): Observable<T[]> {
    return this.page$(queryFn).pipe(take(1));
  }

  public createId() {
    return this.firestore.createId();
  }

  public doc$(id: string): Observable<T> {
    return this.firestore
      .doc<T>(`${this.path}/${id}`)
      .snapshotChanges()
      .pipe(
        map((docSnapshot) => {
          let result = docSnapshot.payload.data();
          if (this.idField) {
            result = { ...result, [this.idField]: docSnapshot.payload.id };
          }
          return result;
        }),
        map((item) => {
          if (this.mapFromDb) {
            return this.mapFromDb(item);
          } else {
            return item;
          }
        })
      );
  }

  public docOnce$(id: string): Observable<T> {
    return this.doc$(id).pipe(take(1));
  }

  public collection$(queryFn?: QueryFn): Observable<T[]> {
    return this.firestore
      .collection<T>(this.path, queryFn)
      .snapshotChanges()
      .pipe(
        map((docSnapshots) =>
          docSnapshots
            .map((docSnapshot) => {
              let result = docSnapshot.payload.doc.data();
              if (this.idField) {
                result = { result, [this.idField]: docSnapshot.payload.doc.id } as any;
              }
              return result;
            })
            .map((item) => {
              if (this.mapFromDb) {
                return this.mapFromDb(item);
              } else {
                return item;
              }
            })
        )
      );
  }

  public collectionOnce$(queryFn?: QueryFn): Observable<T[]> {
    return this.collection$(queryFn).pipe(take(1));
  }

  public update$(id: string, value: Partial<T>) {
    return from(this.firestore.doc(`${this.path}/${id}`).set(value, { merge: true })).pipe();
  }

  public delete$(id: string) {
    return from(this.firestore.doc(`${this.path}/${id}`).delete()).pipe();
  }

  public create$(value: Partial<T>): Observable<string> {
    let id;
    let newValue;

    if (Object.keys(value).includes('id') && !!value['id']) {
      id = value['id'];
      newValue = Object.assign({}, value);
    } else {
      id = this.createId();
      newValue = Object.assign({}, value, { id });
    }

    return from(this.firestore.doc(`${this.path}/${id}`).set(newValue, { merge: true })).pipe(mapTo(id));
  }

  public upsert$(value: Partial<T>): Observable<string> {
    let id;
    let newValue;

    if (Object.keys(value).includes('id') && !!value['id']) {
      id = value['id'];
      newValue = Object.assign({}, value);
    } else {
      id = this.createId();
      newValue = Object.assign({}, value, { id });
    }

    return from(this.firestore.doc(`${this.path}/${id}`).set(newValue, { merge: true })).pipe(mapTo(id));
  }
}
