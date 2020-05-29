import { NgxsFirestore } from './ngxs-firestore.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { QueryFn } from '@angular/fire/firestore';
import { map, take } from 'rxjs/operators';

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
            temp = query(ref);
            return temp;
        };
    }

    change(lastVisible) {
        this.lastVisible = lastVisible;
    }
}

export abstract class NgxsFirestorePagination<T> extends NgxsFirestore<T> {
    protected abstract limit = 5;
    protected abstract orderBy: string;
    protected abstract orderByDirection: any;
    protected abstract format: (data: T) => T;
    private behaviorSubject: BehaviorSubject<T[]> = new BehaviorSubject([]);
    private queryPagination: QueryPagination;

    collection$(query?: QueryFn): Observable<T[]> {
        this.queryPagination = new QueryPagination(query, this.orderBy, this.limit, this.orderByDirection);
        this.fetch();
        return this.behaviorSubject.asObservable();
    }

    fetch(complete?: () => void, error?: () => void) {
        this.updateCollection$(this.snapshotChanges(), complete, error);
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

    private updateCollection$(collection: Observable<T[]>, complete?: () => void, error?: () => void) {
        collection.pipe(take(1)).subscribe((documents) => this.behaviorSubject.next(documents), error, complete);
    }
}
