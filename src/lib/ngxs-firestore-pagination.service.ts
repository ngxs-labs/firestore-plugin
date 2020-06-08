import { QueryFn } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { NgxsFirestore } from './ngxs-firestore.service';

class QueryPagination {
    private lastVisible: any = null;

    constructor(queryFn: QueryFn, private orderBy: string, private limit: number, private orderByDirection?: any) {
        this.setQuery(queryFn);
    }

    private _query: QueryFn;

    get query(): QueryFn {
        return this._query;
    }

    setQuery(query?: QueryFn) {
        this._query = (ref) => {
            let temp = ref.orderBy(this.orderBy, this.orderByDirection).limit(this.limit);
            if (this.lastVisible) {
                temp = temp.startAfter(this.lastVisible);
            }
            if (query) {
                temp = query(ref);
            }
            return temp;
        };
    }

    change(lastVisible) {
        this.lastVisible = lastVisible;
    }
}
type Readonly<T> = keyof T;
export interface PayloadFetch {
    complete: () => void;
    error: (err) => void;
}
export abstract class NgxsFirestorePagination<T> extends NgxsFirestore<T> {
    protected abstract limit: number;
    protected abstract orderBy: Readonly<T>;
    protected abstract orderByDirection: any;
    protected abstract format: (data: T) => T;
    private behaviorSubject: BehaviorSubject<T[]> = new BehaviorSubject([]);
    private queryPagination: QueryPagination;

    collection$(query?: QueryFn): Observable<T[]> {
        this.queryPagination = new QueryPagination(query, this.orderBy as string, this.limit, this.orderByDirection);
        this.fetch();
        return this.behaviorSubject.asObservable();
    }

    fetch(payload?: PayloadFetch) {
        this.updateCollection$(this.snapshotChanges(), payload);
    }

    private snapshotChanges() {
        return this.firestore
            .collection(this.path, this.queryPagination.query)
            .snapshotChanges()
            .pipe(
                map((arr) =>
                    arr.map((snap) => {
                        const data = snap.payload.doc.data() as T;
                        this.queryPagination.change(snap.payload.doc);
                        return this.format ? this.format(data) : data;
                    })
                )
            );
    }

    private updateCollection$(
        collection: Observable<T[]>,
        payload: PayloadFetch = {
            error: (err) => {},
            complete: () => {}
        }
    ) {
        collection
            .pipe(take(1))
            .subscribe((documents) => this.behaviorSubject.next(documents), payload.error, payload.complete);
    }
}
