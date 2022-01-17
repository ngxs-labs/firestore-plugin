export class DisconnectAll {
  static readonly type = '[NgxsFirestore] DisconnectAll';
}

export class Disconnect {
  static readonly type = '[NgxsFirestore] Disconnect';
  constructor(public payload: any) {}
}

export class GetNextPage {
  static readonly type = 'GetNextPage';
  constructor(public payload: string) {}
}

export class GetLastPage {
  static readonly type = 'GetLastPage';
  constructor(public payload: string) {}
}
