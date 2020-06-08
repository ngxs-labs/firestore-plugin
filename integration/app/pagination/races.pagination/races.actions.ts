import { PayloadFetch } from '@ngxs-labs/firestore-plugin';

export namespace RacesByPageActions {
    export class Get {
        public static readonly type = '[Races] Get By Page';
    }

    export class Fetch {
        public static readonly type = '[Races] Fetch';
        constructor(public payload?: PayloadFetch) {}
    }
}
