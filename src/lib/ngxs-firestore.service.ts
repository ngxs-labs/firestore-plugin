import { QueryFn, QueryDocumentSnapshot } from '@angular/fire/firestore';
import { Observable, from, throwError, of } from 'rxjs';
import { Inject, Injectable } from '@angular/core';
import { map, take, tap, finalize, mapTo, timeoutWith } from 'rxjs/operators';
import { NgxsFirestoreAdapter } from './ngxs-firestore.adapter';
import firebase from 'firebase/app';
import 'firebase/firestore';

/**
 * Changes the behavior of a set() call to only replace the values specified
 * in its data argument. Fields omitted from the set() call remain
 * untouched.
 */
interface SetOptions {
  merge: boolean;
}

@Injectable()
export abstract class NgxsFirestore<T> {
  constructor(@Inject(NgxsFirestoreAdapter) protected adapter: NgxsFirestoreAdapter) {}

  protected abstract path: string;
  protected idField: string = 'id';
  protected converter: firebase.firestore.FirestoreDataConverter<T> = {
    toFirestore: (value) => {
      return value;
    },
    fromFirestore: (snapshot, options) => {
      return { ...(<T>snapshot.data(options)) };
    }
  };

  private activePagedQuery: { lastDoc?: QueryDocumentSnapshot<T>; page?: string; queryFn?: string } = null;

  public page$(queryFn?: QueryFn): Observable<T[]> {
    if (!!this.activePagedQuery && this.activePagedQuery.queryFn !== queryFn + '') {
      return throwError('NgxsFirestore page$ error. Yon can have only one paging query per service instance.');
    }

    if (!this.activePagedQuery) {
      this.activePagedQuery = {
        queryFn: queryFn + ''
      };
    }

    return this.adapter.firestore
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
        map((items) => items.map((item) => this.getDataWithId(item.payload.doc))),
        finalize(() => (this.activePagedQuery = null))
      );
  }
  public pageOnce$(queryFn?: QueryFn): Observable<T[]> {
    return this.page$(queryFn).pipe(take(1));
  }

  public createId() {
    return this.adapter.firestore.createId();
  }

  public doc$(id: string): Observable<T> {
    return this.adapter.firestore
      .doc<T>(this.docRef(id))
      .snapshotChanges()
      .pipe(
        map((docSnapshot) => {
          if (docSnapshot.payload.exists) {
            return this.getDataWithId(docSnapshot.payload);
          } else {
            return undefined;
          }
        })
      );
  }

  public docOnce$(id: string): Observable<T> {
    return this.doc$(id).pipe(take(1));
  }

  public collection$(queryFn: QueryFn = (ref) => ref): Observable<T[]> {
    return this.adapter.firestore
      .collection<T>(this.path, (ref) => {
        return queryFn(ref.withConverter(this.converter));
      })
      .snapshotChanges()
      .pipe(
        map((docSnapshots) =>
          docSnapshots.map((docSnapshot) => {
            return this.getDataWithId(docSnapshot.payload.doc);
          })
        )
      );
  }

  public collectionOnce$(queryFn?: QueryFn): Observable<T[]> {
    return this.collection$(queryFn).pipe(take(1));
  }

  public update$(id: string, value: Partial<T>, setOptions?: SetOptions) {
    return this.docSet(id, value, setOptions);
  }

  public delete$(id: string) {
    return from(this.doc(id).delete()).pipe();
  }

  public create$(value: Partial<T>): Observable<string> {
    return this.upsert$(value);
  }

  public upsert$(value: Partial<T>, setOptions?: SetOptions): Observable<string> {
    let id;
    let newValue;

    if (Object.keys(value).includes(this.idField) && !!value[this.idField]) {
      id = value[this.idField];
      newValue = Object.assign({}, value);
    } else {
      id = this.createId();
      newValue = Object.assign({}, value, { [this.idField]: id });
    }

    return this.docSet(id, newValue, setOptions);
  }

  private getDataWithId<TData>(doc: QueryDocumentSnapshot<TData>) {
    const data = doc.data();
    const id = (data && data[this.idField]) || doc.id;
    return { ...data, [this.idField]: id };
  }

  private doc(id: string) {
    return this.adapter.firestore.doc(this.docRef(id));
  }

  private docSet(id: string, value: any, setOptions?: SetOptions) {
    setOptions = setOptions || { merge: true };

    if (this.isOffline()) {
      this.doc(id).set(value, setOptions);
      return of(id);
    }

    if (this.adapter.options && this.adapter.options.timeoutWriteOperations) {
      return from(this.doc(id).set(value, setOptions)).pipe(
        timeoutWith(this.adapter.options.timeoutWriteOperations, of(id)),
        mapTo(id)
      );
    } else {
      return from(this.doc(id).set(value, setOptions)).pipe(mapTo(id));
    }
  }

  private docRef(id: string) {
    return this.adapter.firestore.doc(`${this.path}/${id}`).ref.withConverter(this.converter);
  }

  private isOffline() {
    return navigator.onLine !== undefined && !navigator.onLine;
  }
}
