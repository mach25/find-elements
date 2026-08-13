/**
 * What a lookup may return. Subtypes are covered by these three: HTMLInputElement is an
 * Element, NodeListOf<HTMLElement> is assignable to NodeListOf<Element>, and the array case
 * carries the wrappers in ./select.js that yield several elements at once.
 */
export type HTMLElements = Element | NodeListOf<Element> | readonly Element[];
export interface SelectorFindFunction<T extends HTMLElements = HTMLElements> {
    (selector: string): T | null;
}
export * from './select.js';
export declare const byId: (id: string) => HTMLElement | null;
export declare const bySelector: (selector: string) => NodeListOf<Element> | null;
export type Logger = (message: string) => void;
/**
 * Routes the "found in N milliseconds" line somewhere. A library has no business writing to
 * the console uninvited, so nothing is logged until this is called:
 * `setLogger(console.info)`. Pass null to turn it off again.
 */
export declare const setLogger: (log: Logger | null) => void;
export declare function findElements<T extends HTMLElements = HTMLElement>(selector: string, findFnc?: SelectorFindFunction<T>, timeout?: number): Promise<T>;
