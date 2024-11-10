type HTMLElements = Element | HTMLElement | HTMLInputElement | NodeListOf<Element> | NodeListOf<HTMLElement> | NodeListOf<HTMLInputElement>;
interface SelectorFindFunction {
    (selector: string): HTMLElements | null;
}
export declare const byId: (id: string) => HTMLElements | null;
export declare const bySelector: (selector: string) => HTMLElements;
export declare const getFirst: (items: NodeListOf<HTMLElement | HTMLInputElement | Element>) => HTMLElement | HTMLInputElement | Element | null;
export declare function findElements(selector: string, findFnc?: SelectorFindFunction, timeout?: number): Promise<Element | HTMLElement | NodeListOf<HTMLElement> | NodeListOf<HTMLInputElement> | NodeListOf<Element>>;
export {};
