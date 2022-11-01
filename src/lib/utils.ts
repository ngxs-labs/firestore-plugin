import { Query, DocumentData } from '@angular/fire/firestore';

export type QueryFn<T = DocumentData> = (ref: Query<T>) => Query<T>;
