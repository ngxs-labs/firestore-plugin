import { AngularFirestore, QueryFn } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { Inject, Injectable } from '@angular/core';
import { map, take } from 'rxjs/operators';

@Injectable()
export abstract class NgxsFirestore<T> {
  protected abstract path: string;

  constructor(@Inject(AngularFirestore) protected firestore: AngularFirestore) {}

  public createId() {
    return this.firestore.createId();
  }

  public doc$(id: string): Observable<T> {
    return this.firestore
      .doc<T>(`${this.path}/${id}`)
      .snapshotChanges()
      .pipe(map((_) => _.payload.data()));
  }

  public docOnce$(id: string): Observable<T> {
    return this.doc$(id).pipe(take(1));
  }

  public collection$(queryFn?: QueryFn): Observable<T[]> {
    return this.firestore
      .collection<T>(this.path, queryFn)
      .snapshotChanges()
      .pipe(map((items) => items.map((item) => item.payload.doc.data())));
  }

  public collectionOnce$(queryFn?: QueryFn): Observable<T[]> {
    return this.collection$(queryFn).pipe(take(1));
  }

  public update$(id: string, value: Partial<T>) {
    return from(this.firestore.doc(`${this.path}/${id}`).update(value)).pipe();
  }

  public delete$(id: string) {
    return from(this.firestore.doc(`${this.path}/${id}`).delete()).pipe();
  }

  public create$(id: string, value: Partial<T>) {
    return from(this.firestore.doc(`${this.path}/${id}`).set(value, { merge: true })).pipe();
  }

  public upsert$(value: Partial<T>) {
    let id;
    let newValue;

    if (Object.keys(value).includes('id') && !!value['id']) {
      id = value['id'];
      newValue = Object.assign({}, value);
    } else {
      id = this.createId();
      newValue = Object.assign({}, value, { id });
    }

    return from(this.firestore.doc(`${this.path}/${id}`).set(newValue, { merge: true })).pipe();
  }
}
