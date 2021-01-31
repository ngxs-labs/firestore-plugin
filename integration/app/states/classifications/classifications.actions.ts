export namespace ClassificationsActions {
  export class Get {
    public static readonly type = '[Classifications] Get';
    constructor(public payload: string) {}
  }

  export class GetAll {
    public static readonly type = '[Classifications] GetAll';
    constructor(public raceId: string) {}
  }
}
