
namespace RacesActionsPayloads {
  export interface Update { }
  export interface Create { }
}

export namespace RacesActions {
  export class GetAllOnce { public static readonly type = '[Races] GetAllOnce'; }
  export class GetOnce { public static readonly type = '[Races] GetOnce'; constructor(public payload: string) { } }
  export class GetAll { public static readonly type = '[Races] GetAll'; }
  export class GetActive { public static readonly type = '[Races] GetActive'; }
  export class Update { public static readonly type = '[Races] Update'; constructor(public payload: RacesActionsPayloads.Update) { } }
  export class Create { public static readonly type = '[Races] Create'; constructor(public payload: RacesActionsPayloads.Create) { } }
  export class Delete { public static readonly type = '[Races] Delete'; constructor(public payload: string) { } }
}
