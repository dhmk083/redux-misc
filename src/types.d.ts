export type Action<P = unknown, T extends string = string> = {
  type: T;
  payload: P;
};

export type Reducer<T, A extends Action = Action> = (state: T, action: A) => T;

export type PayloadCreator<P = void, P2 = undefined> = (payload: P) => P2;

export type ActionCreator<T extends string, P = void, P2 = undefined> = (
  payload: P
) => Action<P2, T>;
