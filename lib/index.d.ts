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
export declare function findElements<T extends HTMLElements = HTMLElement>(selector: string, findFnc?: SelectorFindFunction<T>, timeout?: number): Promise<T>;
