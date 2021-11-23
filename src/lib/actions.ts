import { ActionType } from '@ngxs/store';

export class DisconnectAll {
  static readonly type = '[NgxsFirestore] DisconnectAll';
}

export class Disconnect {
  static readonly type = '[NgxsFirestore] Disconnect';
  constructor(public payload: any) {}
}

export class GetNextPage {
  static readonly type = 'GetNextPage';
  constructor(public payload: ActionType) {}
}
