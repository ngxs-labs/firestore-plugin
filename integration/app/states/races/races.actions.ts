import { Race } from './../../models/race';

namespace RacesActionsPayloads {
    export type Update = Partial<Race>;
    export type Upsert = Partial<Race>;
    export type Create = Partial<Race>;
}

export namespace RacesActions {
    export class GetAllOnce {
        public static readonly type = '[Races] GetAllOnce';
    }
    export class GetOnce {
        public static readonly type = '[Races] GetOnce';
        constructor(public payload: string) {}
    }
    export class Get {
        public static readonly type = '[Races] Get';
        constructor(public payload: string) {}
    }
    export class GetAll {
        public static readonly type = '[Races] GetAll';
    }

    export class NextPage {
        public static readonly type = '[Races] NextPage';
    }

    export class Create {
        public static readonly type = '[Races] Create';
        constructor(public payload: RacesActionsPayloads.Create) {}
    }
    export class Upsert {
        public static readonly type = '[Races] Upsert';
        constructor(public payload: RacesActionsPayloads.Upsert) {}
    }
    export class Update {
        public static readonly type = '[Races] Update';
        constructor(public payload: RacesActionsPayloads.Update) {}
    }
    export class Delete {
        public static readonly type = '[Races] Delete';
        constructor(public payload: string) {}
    }
}
