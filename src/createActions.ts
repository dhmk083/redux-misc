import { id, objectMap } from "@dhmk/utils";
import { PayloadCreator, ActionCreator } from "./types";
import { join } from "./utils";

type Constraint<T> = {
  [P in keyof T]: T[P] extends PayloadCreator
    ? T[P]
    : T[P] extends object
    ? Constraint<T[P]>
    : never;
};

type Return<T> = {
  [P in keyof T]: T[P] extends (...a: infer A) => infer R
    ? ActionCreator<string, A extends [] ? void : A[0], R>
    : T[P] extends object
    ? Return<T[P]>
    : never;
};

export function createAction<T extends string = string>(type: T) {
  const action = () => ({ type, payload: undefined });
  action.type = type;
  action.payload = <P, OP = P>(postProcess: (arg: P) => OP = id as any) => {
    const action = (payload: P) => ({
      type,
      payload: postProcess(payload) ?? payload,
    });
    action.type = type;
    return action;
  };
  return action;
}

export function createActions<T extends Constraint<T>, P extends string>(
  x: T,
  prefix?: P
): Return<T> {
  return objectMap(x, (v: any, k) =>
    typeof v === "function"
      ? createAction(join(prefix, k)).payload(v)
      : createActions(v, join(prefix, k))
  ) as any;
}

// test

const actions = {
  addBook: createAction("addBook"),
  removeBook: createAction("removeBook").payload<string>(),
};

console.log(actions.addBook());
console.log(actions.removeBook(""));

const betterActions = createActions(
  {
    addBook: () => {},
    removeBook: {
      nested(id: string) {},
    },
    editBook: (id: number) => id,
  },
  "books"
);

console.log(betterActions.addBook());
console.log(betterActions.removeBook.nested(""));
