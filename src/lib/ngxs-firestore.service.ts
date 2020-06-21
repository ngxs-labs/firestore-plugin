import { AngularFirestore, QueryFn, QueryDocumentSnapshot } from '@angular/fire/firestore';
import { Observable, from, throwError } from 'rxjs';
import { Inject, Injectable } from '@angular/core';
import { map, take, tap, finalize } from 'rxjs/operators';

@Injectable()
export abstract class NgxsFirestore<T> {
    protected abstract path: string;
    private activePagedQuery: { lastDoc?: QueryDocumentSnapshot<T>; page?: string; queryFn?: string } = null;

    constructor(@Inject(AngularFirestore) protected firestore: AngularFirestore) {}

    public page$(queryFn?: QueryFn): Observable<T[]> {
        if (!!this.activePagedQuery && this.activePagedQuery.queryFn === queryFn + '') {
            return throwError('ERROR');
        }

        this.activePagedQuery = {
            queryFn: queryFn + ''
        };

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
