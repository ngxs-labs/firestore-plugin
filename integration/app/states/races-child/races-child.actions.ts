// import { Race } from '../../models/race';

// namespace RacesChildActionsPayloads {
  
//}

export namespace RacesChildActions {
  export class GetAllOnce { public static readonly type = '[RacesChild] GetAllOnce'; }
  export class GetOnce { public static readonly type = '[RacesChild] GetOnce'; constructor(public payload: string) { } }
  export class GetAll { public static readonly type = '[RacesChild] GetAll'; }
  // export class Update { public static readonly type = '[RacesChild] Update'; constructor(public payload: RacesChildActionsPayloads.Update) { } }
  // export class Create { public static readonly type = '[RacesChild] Create'; constructor(public payload: RacesChildActionsPayloads.Create) { } }
  export class Delete { public static readonly type = '[RacesChild] Delete'; constructor(public payload: string) { } }
}
