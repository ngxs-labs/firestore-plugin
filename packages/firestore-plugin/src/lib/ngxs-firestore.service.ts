import {
  collection,
  collectionSnapshots,
  collectionGroup,
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
  SetOptions,
  Firestore,
  DocumentData
} from '@angular/fire/firestore';
import { Observable, from, of } from 'rxjs';
import { Inject, Injectable } from '@angular/core';
import { map, mapTo, timeoutWith } from 'rxjs/operators';
import { NgxsFirestoreAdapter } from './ngxs-firestore.adapter';
import { QueryFn } from './utils';

interface GetOptions {
  source: 'default' | 'server' | 'cache';
}

export function createId(firestore: Firestore) {
  // https://github.com/angular/angularfire/discussions/2900#discussioncomment-1343797
  return doc(collection(firestore, '_')).id;
}

@Injectable()
export abstract class NgxsFirestore<T> {
  constructor(@Inject(NgxsFirestoreAdapter) protected adapter: NgxsFirestoreAdapter) {}

  protected abstract path: string;
  protected idField = 'id';
  protected metadataField: string | false = false;
  protected timeoutWriteOperations: number | false = false;
  protected optimisticUpdates: boolean = false;
  protected converter: FirestoreDataConverter<T> = {
    toFirestore: (value) => {
      return value as DocumentData;
    },
    fromFirestore: (snapshot, options) => {
      return { ...(<T>snapshot.data(options)) };
    }
  };

  public createId() {
    return createId(this.adapter.firestore);
  }

  public doc$(id: string): Observable<T | undefined> {
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

  public docOnce$(id: string, { source }: GetOptions = { source: 'default' }): Observable<T | undefined> {
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
    return collectionSnapshots<T>(queryFn(this.collectionRef())).pipe(
      map((queryDocumentSnapshots) =>
        queryDocumentSnapshots.map((queryDocumentSnapshot) => this.getDataWithId(queryDocumentSnapshot))
      )
    );
  }

  public collectionGroup$(queryFn: QueryFn<T> = (ref) => ref): Observable<T[]> {
    const collectionGroupQuery = queryFn(collectionGroup(this.adapter.firestore, this.path) as any);
    return from(getDocs(collectionGroupQuery)).pipe(
      map((querySnapshot) => {
        const docSnapshots = querySnapshot.docs;
        const items = docSnapshots.map((docSnapshot) => {
          return this.getDataWithId(docSnapshot) as T;
        });
        return items;
      })
    );
  }

  public collectionOnce$(
    queryFn: QueryFn<T> = (ref) => ref,
    { source }: GetOptions = { source: 'default' }
  ): Observable<T[]> {
    const getDocsFn = source === 'cache' ? getDocsFromCache : source === 'server' ? getDocsFromServer : getDocs;
    return from(getDocsFn(queryFn(collection(this.adapter.firestore, this.path).withConverter(this.converter)))).pipe(
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

    if (Object.keys(value).includes(this.idField) && !!(<any>value)[this.idField]) {
      id = (<any>value)[this.idField];
      newValue = Object.assign({}, value);
    } else {
      id = this.createId();
      newValue = Object.assign({}, value, { [this.idField]: id });
    }

    return this.docSet(id, newValue, setOptions);
  }

  private getDataWithId<TData>(doc: QueryDocumentSnapshot<TData>) {
    const data = doc.data();
    const id = (data && (<any>data)[this.idField]) || doc.id;
    if (this.metadataField) {
      return { ...data, [this.idField]: id, [this.metadataField]: doc.metadata };
    } else {
      return { ...data, [this.idField]: id };
    }
  }

  private docSet(id: string, value: any, setOptions: SetOptions = { merge: true }) {
    if (this.metadataField) {
      delete value[this.metadataField];
    }

    const optimisticUpdates = this.adapter.options?.optimisticUpdates || this.optimisticUpdates;
    if (this.isOffline() || optimisticUpdates) {
      setDoc(this.docRef(id), value, {});
      return of(id);
    }

    const timeoutWriteOperations = this.adapter.options?.timeoutWriteOperations || this.timeoutWriteOperations;
    if (timeoutWriteOperations) {
      return from(setDoc(this.docRef(id), value, setOptions)).pipe(
        timeoutWith(timeoutWriteOperations, of(id)),
        mapTo(id)
      );
    } else {
      return from(setDoc(this.docRef(id), value, setOptions)).pipe(mapTo(id));
    }
  }

  private docRef(id: string) {
    return doc(this.adapter.firestore, `${this.path}/${id}`).withConverter(this.converter);
  }

  private collectionRef() {
    return collection(this.adapter.firestore, `${this.path}`).withConverter(this.converter);
  }

  private isOffline() {
    return navigator.onLine !== undefined && !navigator.onLine;
  }
}
