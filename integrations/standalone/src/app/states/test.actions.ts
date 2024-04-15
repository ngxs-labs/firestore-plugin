export class GetAll {
  static readonly type = '[Test] GetAll';
}

export class Create {
  static readonly type = '[Test] Create';
  constructor(public payload: any) {}
}
