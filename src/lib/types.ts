export type Connected<T> = { action: T };
export type Emitted<T, U> = { action: T; payload: U };
export type Disconnected<T> = { action: T };
