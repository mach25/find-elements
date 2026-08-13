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

export const byId = (id: string): HTMLElement | null => document.getElementById(id);
export const bySelector = (selector: string): NodeListOf<Element> | null => {
  const found = document.querySelectorAll(selector);
  return found.length === 0 ? null : found;
};

/**
 * Longest gap between two frames that still counts as real waiting. Anything longer means
 * frames stopped running rather than that time passed while looking for the element.
 */
const MAX_FRAME_GAP = 100;

export type Logger = (message: string) => void;

let logger: Logger | null = null;

/**
 * Routes the "found in N milliseconds" line somewhere. A library has no business writing to
 * the console uninvited, so nothing is logged until this is called:
 * `setLogger(console.info)`. Pass null to turn it off again.
 */
export const setLogger = (log: Logger | null): void => {
  logger = log;
};

const log = (selector: string, start: number) => {
  logger?.(`${selector} found in ${Date.now() - start} milliseconds`);
};

export function findElements<T extends HTMLElements = HTMLElement>(
  selector: string,
  findFnc: SelectorFindFunction<T> = byId as SelectorFindFunction<T>,
  timeout = 10000
): Promise<T> {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const result = findFnc(selector);
    if (result) {
      log(selector, start);
      resolve(result);
    } else {
      let animationFrameId: number;
      let lastFrame = start;
      let waited = 0;
      const query = () => {
        const result = findFnc(selector);
        if (result) {
          cancelAnimationFrame(animationFrameId);
          log(selector, start);
          resolve(result);
          return;
        }
        // Only spend the timeout on time the page was actually being rendered. A gap longer
        // than a frame or two means frames were not running at all — a hidden tab, a
        // minimised window, a blocked main thread — and that is not time the element had a
        // chance to appear in, so it must not count against the budget.
        const now = Date.now();
        waited += Math.min(now - lastFrame, MAX_FRAME_GAP);
        lastFrame = now;
        if (waited > timeout) {
          cancelAnimationFrame(animationFrameId);
          reject(new Error(`${selector} not found in ${waited} milliseconds`));
        } else {
          animationFrameId = requestAnimationFrame(query);
        }
      };
      animationFrameId = requestAnimationFrame(query);
    }
  });
}
