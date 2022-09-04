import { Inject, Injectable } from '@angular/core';
import {
  collection,
  CollectionReference,
  collectionSnapshots,
  deleteDoc,
  doc,
  docSnapshots,
  FirestoreDataConverter,
  getDoc,
  getDocFromCache,
  getDocFromServer,
  getDocs,
  getDocsFromCache,
  getDocsFromServer,
  QueryDocumentSnapshot,
  setDoc,
  SetOptions
} from '@angular/fire/firestore';
import type { Firestore } from '@angular/fire/firestore/firebase';
import { from, Observable, of } from 'rxjs';
import { map, mapTo, timeoutWith } from 'rxjs/operators';
import { QueryFn } from './ngxs-firestore-page.service';
import { NgxsFirestoreAdapter } from './ngxs-firestore.adapter';

interface GetOptions {
  source: 'default' | 'server' | 'cache';
}

export function createId(firestore: Firestore) {
  // https://github.com/angular/angularfire/discussions/2900#discussioncomment-1343797
  return doc(collection(firestore, '_')).id;
}

/**
 * Changes the behavior of a set() call to only replace the values specified
 * in its data argument. Fields omitted from the set() call remain
 * untouched.
 */

@Injectable()
export abstract class NgxsFirestore<T> {
  constructor(@Inject(NgxsFirestoreAdapter) protected adapter: NgxsFirestoreAdapter) {}

  protected abstract path: string;
  protected idField: string = 'id';
  protected converter: FirestoreDataConverter<T> = {
    toFirestore: (value) => {
      return value;
    },
    fromFirestore: (snapshot, options) => {
      return { ...(<T>snapshot.data(options)) };
    }
  };

  public createId() {
    return createId(this.adapter.firestore);
  }

  public doc$(id: string): Observable<T> {
    return docSnapshots(this.docRef(id)).pipe(
      map((docSnapshot) => {
        if (docSnapshot.exists()) {
          return this.getDataWithId(docSnapshot);
        } else {
          return undefined;
        }
      })
    );
  }

  public docOnce$(id: string, { source }: GetOptions = { source: 'default' }): Observable<T> {
    const getDocFn = source === 'cache' ? getDocFromCache : source === 'server' ? getDocFromServer : getDoc;
    return from(getDocFn(this.docRef(id))).pipe(
      map((docSnapshot) => {
        if (docSnapshot.exists()) {
          return this.getDataWithId(docSnapshot);
        } else {
          return undefined;
        }
      })
    );
  }

  public collection$(queryFn: QueryFn<T> = (ref) => ref): Observable<T[]> {
    return collectionSnapshots<T>(
      queryFn(collection(this.adapter.firestore, this.path) as CollectionReference<T>)
    ).pipe(map((docSnapshots) => docSnapshots.map((snapshot) => this.getDataWithId(snapshot))));
  }

  public collectionOnce$(
    queryFn: QueryFn<T> = (ref) => ref,
    { source }: GetOptions = { source: 'default' }
  ): Observable<T[]> {
    const getDocsFn = source === 'cache' ? getDocsFromCache : source === 'server' ? getDocsFromServer : getDocs;
    return from(getDocsFn(queryFn(collection(this.adapter.firestore, this.path) as CollectionReference<T>))).pipe(
      map((querySnapshot) => {
        const docSnapshots = querySnapshot.docs;
        const items = docSnapshots.map((docSnapshot) => {
          return this.getDataWithId(docSnapshot);
        });
        return items;
      })
    );
  }

  public update$(id: string, value: Partial<T>, setOptions: SetOptions = { merge: true }): Observable<string> {
    return this.docSet(id, value, setOptions);
  }

  public delete$(id: string): Observable<void> {
    return from(deleteDoc(this.docRef(id)));
  }

  public create$(value: Partial<T>): Observable<string> {
    return this.upsert$(value);
  }

  public upsert$(value: Partial<T>, setOptions: SetOptions = { merge: true }): Observable<string> {
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

  private docSet(id: string, value: any, setOptions?: SetOptions) {
    if (this.isOffline()) {
      setDoc(this.docRef(id), value, {});
      return of(id);
    }

    if (this.adapter.options && this.adapter.options.timeoutWriteOperations) {
      return from(setDoc(this.docRef(id), value, setOptions)).pipe(
        timeoutWith(this.adapter.options.timeoutWriteOperations, of(id)),
        mapTo(id)
      );
    } else {
      return from(setDoc(this.docRef(id), value, setOptions)).pipe(mapTo(id));
    }
  }

  private docRef(id: string) {
    return doc(this.adapter.firestore, `${this.path}/${id}`).withConverter(this.converter);
  }

  private isOffline() {
    return navigator.onLine !== undefined && !navigator.onLine;
  }
}
