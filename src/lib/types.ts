export interface Connected<T> {
  action: T;
}
export interface Emitted<T, U> {
  action: T;
  payload: U;
}
export interface Disconnected<T> {
  action: T;
}

export interface Errored<T> {
  action: T;
  error: any;
}

export interface Page<T> {
  results: T[];
  pageId: string;
  pageSize: number;
}
