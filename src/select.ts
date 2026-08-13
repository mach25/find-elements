import type { SelectorFindFunction } from './index.js';

/**
 * Wrappers that narrow a lookup returning a NodeList down to the element or elements you
 * actually want, so a multi-match lookup can be used wherever findElements expects one:
 * `findElements('.data-row', getFirst(bySelector))`.
 *
 * Every wrapper returns null rather than an empty result, because findElements treats any
 * truthy return as a hit and both an empty NodeList and an empty array are truthy. Returning
 * null is what keeps it polling until the elements are really there.
 */

/** The first match, or null while the lookup finds nothing. */
export const getFirst =
  <T extends Element>(findFnc: SelectorFindFunction<NodeListOf<T>>): SelectorFindFunction<T> =>
  (selector) => {
    const found = findFnc(selector);
    return found === null || found.length === 0 ? null : found[0];
  };

/** The last match, or null while the lookup finds nothing. */
export const getLast =
  <T extends Element>(findFnc: SelectorFindFunction<NodeListOf<T>>): SelectorFindFunction<T> =>
  (selector) => {
    const found = findFnc(selector);
    return found === null || found.length === 0 ? null : found[found.length - 1];
  };

/**
 * The match at `index`, or null until that many elements exist. A negative index counts back
 * from the end, so `getAt(bySelector, -2)` waits for the second to last match.
 */
export const getAt =
  <T extends Element>(findFnc: SelectorFindFunction<NodeListOf<T>>, index: number): SelectorFindFunction<T> =>
  (selector) => {
    const found = findFnc(selector);
    if (found === null) {
      return null;
    }
    const at = index < 0 ? found.length + index : index;
    return at < 0 || at >= found.length ? null : found[at];
  };

/**
 * The first `count` matches, or null until at least that many exist. Waiting for all of them
 * is the point: yielding fewer would resolve the promise before the rest had rendered.
 * `count` must be at least 1.
 */
export const take =
  <T extends Element>(findFnc: SelectorFindFunction<NodeListOf<T>>, count: number): SelectorFindFunction<T[]> =>
  (selector) => {
    const found = findFnc(selector);
    if (found === null || count < 1 || found.length < count) {
      return null;
    }
    return Array.from(found).slice(0, count);
  };

/** The last `count` matches, or null until at least that many exist. */
export const takeLast =
  <T extends Element>(findFnc: SelectorFindFunction<NodeListOf<T>>, count: number): SelectorFindFunction<T[]> =>
  (selector) => {
    const found = findFnc(selector);
    if (found === null || count < 1 || found.length < count) {
      return null;
    }
    return Array.from(found).slice(found.length - count);
  };

/** Every match satisfying `predicate`, or null until at least one does. */
export const filter =
  <T extends Element>(
    findFnc: SelectorFindFunction<NodeListOf<T>>,
    predicate: (element: T, index: number) => boolean
  ): SelectorFindFunction<T[]> =>
  (selector) => {
    const found = findFnc(selector);
    if (found === null) {
      return null;
    }
    const matches = Array.from(found).filter(predicate);
    return matches.length === 0 ? null : matches;
  };
