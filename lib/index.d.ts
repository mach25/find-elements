export type HTMLElements = Element | HTMLElement | HTMLInputElement | NodeListOf<Element> | NodeListOf<HTMLElement> | NodeListOf<HTMLInputElement>;
export interface SelectorFindFunction<T extends HTMLElements = HTMLElements> {
    (selector: string): T | null;
}
export declare const byId: (id: string) => HTMLElement | null;
export declare const bySelector: (selector: string) => NodeListOf<Element> | null;
export declare const getFirst: (items: NodeListOf<HTMLElement | HTMLInputElement | Element>) => HTMLElement | HTMLInputElement | Element | null;
export declare function findElements<T extends HTMLElements = HTMLElement>(selector: string, findFnc?: SelectorFindFunction<T>, timeout?: number): Promise<T>;
