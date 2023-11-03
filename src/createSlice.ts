import { objectMap } from "@dhmk/utils";
import { createActions } from "./createActions";
import { PayloadCreator, Reducer, Action, ActionCreator } from "./types";
import { join } from "./utils";

type ActionReducerPair<S = any, P = void, P2 = undefined> = {
  action: PayloadCreator<P, P2>;
  reducer: Reducer<S, Action<P2>>;
};

type ReducersConstraint<S> = {
  [P: string]: Reducer<S, Action<any>> | ActionReducerPair<S, any, any>;
};

type ExtraReducersConstraint<S> = {
  [P: string]: Reducer<S, Action<any>>;
};

type GetPayload<A> = A extends { payload: infer P }
  ? unknown extends P
    ? void
    : P
  : never;

type GetAC<Af> = Af extends (...args: infer A) => infer R
  ? ActionCreator<string, R, A extends [] ? void : A[0]>
  : never;

type SliceActions<T> = {
  [P in keyof T & string]: T[P] extends Reducer<any, infer A>
    ? ActionCreator<P, GetPayload<A>>
    : T[P] extends { action: infer A }
    ? GetAC<A>
    : never;
};

function createSlice<
  S,
  R extends ReducersConstraint<S>,
  E extends ExtraReducersConstraint<S>,
  P extends string
>(
  initialState: S,
  cases: R,
  extraReducers?: E,
  prefix?: P
): { actions: SliceActions<R>; reducer: Reducer<S> } {
  const actions = createActions(
    objectMap(cases, (v: any) => (v.action ? v.action : (x) => x)),
    prefix
  );

  const reducers = objectMap(
    cases,
    (v: any) => (v.reducer ? v.reducer : v),
    (k) => join(prefix, k)
  );

  const allReducers = { ...reducers, ...extraReducers };

  const reducer = (state, action) =>
    allReducers[action.type]?.(state, action) ?? initialState;

  return {
    actions,
    reducer,
  } as any;
}

export function actionReducerPair<S, P, P2>(
  action: PayloadCreator<P, P2>,
  reducer: Reducer<S, Action<P2>>
): ActionReducerPair<S, P, P2> {
  return {
    action,
    reducer,
  };
}

// test

const slice = createSlice(
  {
    books: 0,
    ok: true,
  },
  {
    addBook: (state, action: Action<number>) => state,
    removeBook: actionReducerPair(
      (a: number) => a,
      (state, action) => state
    ),
    editBook: (state, action) => state,
  },
  {
    externalAction: (state, action: Action<string>) => state,
  },
  "slice"
);

console.log(slice.actions.addBook(1));
console.log(slice.actions.removeBook(1));
console.log(slice.actions.editBook());

console.log(slice.reducer({ books: 123, ok: false }, slice.actions.addBook(1)));
