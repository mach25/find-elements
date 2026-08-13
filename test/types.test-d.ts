import { expectTypeOf } from 'vitest';
import { byId, bySelector, findElements, type SelectorFindFunction } from '../src/index.js';

// These assertions are checked by `npm run typecheck`, not at runtime. They exist because the
// return type is the whole point of findElements being generic: without it every caller has to
// cast, including the common case of handing the element to a framework's mount call.

// The default lookup resolves to a single element.
expectTypeOf(findElements('app-root')).resolves.toEqualTypeOf<HTMLElement>();
expectTypeOf(findElements('app-root', byId)).resolves.toEqualTypeOf<HTMLElement>();
expectTypeOf(findElements('app-root', byId, 3000)).resolves.toEqualTypeOf<HTMLElement>();

// bySelector widens to the NodeList it actually returns.
expectTypeOf(findElements('.row', bySelector)).resolves.toEqualTypeOf<NodeListOf<Element>>();

// A custom lookup flows its own element type through.
const byDataRole = (role: string) => document.querySelector<HTMLInputElement>(`[data-role="${role}"]`);
expectTypeOf(findElements('submit', byDataRole)).resolves.toEqualTypeOf<HTMLInputElement>();

// The exported interface types a custom lookup without repeating the signature.
const byName: SelectorFindFunction<NodeListOf<HTMLInputElement>> = (name) => {
  const found = document.getElementsByName(name) as NodeListOf<HTMLInputElement>;
  return found.length === 0 ? null : found;
};
expectTypeOf(findElements('email', byName)).resolves.toEqualTypeOf<NodeListOf<HTMLInputElement>>();

// The motivating case: no cast needed to hand the result to a mount call.
declare function createRoot(el: Element | DocumentFragment): void;
createRoot(await findElements('app-root'));
