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
