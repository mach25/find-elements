export type HTMLElements = Element | HTMLElement | HTMLInputElement | NodeListOf<Element> | NodeListOf<HTMLElement> | NodeListOf<HTMLInputElement>;
export interface SelectorFindFunction<T extends HTMLElements = HTMLElements> {
    (selector: string): T | null;
}
export declare const byId: (id: string) => HTMLElement | null;
export declare const bySelector: (selector: string) => NodeListOf<Element> | null;
/**
 * Wraps a lookup that returns a NodeList so it yields only the first match, letting a
 * multi-match lookup be used wherever a single element is wanted:
 * `findElements('.data-row', getFirst(bySelector))`.
 */
export declare const getFirst: <T extends Element>(findFnc: SelectorFindFunction<NodeListOf<T>>) => SelectorFindFunction<T>;
export declare function findElements<T extends HTMLElements = HTMLElement>(selector: string, findFnc?: SelectorFindFunction<T>, timeout?: number): Promise<T>;
