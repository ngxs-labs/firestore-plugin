import {
  QueryFn,
  QueryDocumentSnapshot,
  Action,
  DocumentSnapshot,
  DocumentChangeAction,
  DocumentData,
  DocumentReference
} from '@angular/fire/compat/firestore';
import { Observable, from, of } from 'rxjs';
import { Inject, Injectable } from '@angular/core';
import { map, mapTo, timeoutWith } from 'rxjs/operators';
import { NgxsFirestoreAdapter } from './ngxs-firestore-compat.adapter';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

@Injectable()
export abstract class NgxsFirestore<T> {
  constructor(@Inject(NgxsFirestoreAdapter) protected adapter: NgxsFirestoreAdapter) {}

  protected abstract path: string;
  protected idField: string = 'id';
  protected metadataField: string | false = false;
  protected timeoutWriteOperations: number | false = false;
  protected optimisticUpdates: boolean = false;
  protected converter: firebase.firestore.FirestoreDataConverter<T> = {
    toFirestore: (value) => {
      return value as DocumentData;
    },
    fromFirestore: (snapshot, options) => {
      return { ...(<T>snapshot.data(options)) };
    }
  };

  public createId() {
    return this.adapter.firestore.createId();
  }

  public doc$(id: string): Observable<T | undefined> {
    return this.adapter.firestore
      .doc<T>(this.docRef(id) as any)
      .snapshotChanges()
      .pipe(
        map((docSnapshot: Action<DocumentSnapshot<T>>) => {
          if (docSnapshot.payload.exists) {
            return this.getDataWithId(docSnapshot.payload);
          } else {
            return undefined;
          }
        })
      );
  }

  public docOnce$(
    id: string,
    getOptions: firebase.firestore.GetOptions = { source: 'default' }
  ): Observable<T | undefined> {
    return this.adapter.firestore
      .doc<T>(this.docRef(id) as any)
      .get(getOptions)
      .pipe(
        map((docSnapshot) => {
          if (docSnapshot.exists) {
            return this.getDataWithId(docSnapshot);
          } else {
            return undefined;
          }
        })
      );
  }

  public collection$(queryFn: QueryFn = (ref) => ref): Observable<T[]> {
    return this.adapter.firestore
      .collection<T>(this.path, (ref) => {
        return queryFn(ref.withConverter(this.converter as any));
      })
      .snapshotChanges()
      .pipe(
        map((docSnapshots: DocumentChangeAction<T>[]) =>
          docSnapshots.map((docSnapshot) => {
            return this.getDataWithId(docSnapshot.payload.doc);
          })
        )
      );
  }

  public collectionOnce$(
    queryFn: QueryFn = (ref) => ref,
    getOptions: firebase.firestore.GetOptions = { source: 'default' }
  ): Observable<T[]> {
    return this.adapter.firestore
      .collection<T>(this.path, (ref) => {
        return queryFn(ref.withConverter(this.converter as any));
      })
      .get(getOptions)
      .pipe(
        map((querySnapshot) => {
          const docSnapshots = querySnapshot.docs;
          const items = docSnapshots.map((docSnapshot) => {
            return this.getDataWithId(docSnapshot);
          });
          return items;
        })
      );
  }

  public update$(id: string, value: Partial<T>, setOptions: firebase.firestore.SetOptions = { merge: true }) {
    return this.docSet(id, value, setOptions);
  }

  public delete$(id: string) {
    return from(this.doc(id).delete()).pipe();
  }

  public create$(value: Partial<T>): Observable<string> {
    return this.upsert$(value);
  }

  public upsert$(value: Partial<T>, setOptions: firebase.firestore.SetOptions = { merge: true }): Observable<string> {
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

  private getDataWithId<TData>(doc: firebase.firestore.QueryDocumentSnapshot<TData> | QueryDocumentSnapshot<TData>): T {
    const data = doc.data();
    const id = (data && (<any>data)[this.idField]) || doc.id;
    if (this.metadataField) {
      return ({ ...data, [this.idField]: id, [this.metadataField]: doc.metadata } as unknown) as T;
    } else {
      return ({ ...data, [this.idField]: id } as unknown) as T;
    }
  }

  private doc(id: string) {
    return this.adapter.firestore.doc(this.docRef(id) as DocumentReference);
  }

  private docSet(id: string, value: any, setOptions: firebase.firestore.SetOptions = { merge: true }) {
    if (this.metadataField) {
      delete value[this.metadataField];
    }

    const optimisticUpdates = this.adapter.options?.optimisticUpdates || this.optimisticUpdates;
    if (this.isOffline() || optimisticUpdates) {
      this.doc(id).set(value, setOptions);
      return of(id);
    }

    const timeoutWriteOperations = this.adapter.options?.timeoutWriteOperations || this.timeoutWriteOperations;
    if (timeoutWriteOperations) {
      return from(this.doc(id).set(value, setOptions)).pipe(timeoutWith(timeoutWriteOperations, of(id)), mapTo(id));
    } else {
      return from(this.doc(id).set(value, setOptions)).pipe(mapTo(id));
    }
  }

  private docRef(id: string) {
    return this.adapter.firestore.doc(`${this.path}/${id}`).ref.withConverter(this.converter as any);
  }

  private isOffline() {
    return navigator.onLine !== undefined && !navigator.onLine;
  }
}
