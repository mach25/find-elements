type HTMLElements = Element | HTMLElement | HTMLInputElement | NodeListOf<Element> | NodeListOf<HTMLElement> | NodeListOf<HTMLInputElement>;

interface SelectorFindFunction {
  (selector: string): HTMLElements | null;
}

export const byId = (id: string): HTMLElements | null => document.getElementById(id);
export const bySelector = (selector: string): HTMLElements => document.querySelectorAll(selector);
export const getFirst = (items: NodeListOf<HTMLElement | HTMLInputElement | Element>): HTMLElement | HTMLInputElement | Element | null => {
  if (!items || items.length === 0) {
    return null;
  }
  return items[0];
};

const log = (selector: string, start: number) => {
  console.info(`${selector} found in ${Date.now() - start} milliseconds`);
};

export function findElements(
  selector: string,
  findFnc: SelectorFindFunction = byId,
  timeout = 10000
): Promise<Element | HTMLElement | NodeListOf<HTMLElement> | NodeListOf<HTMLInputElement> | NodeListOf<Element>> {
  const start = Date.now();
  const isOverTimestamp = start + timeout;
  return new Promise((resolve, reject) => {
    const result = findFnc(selector);
    if (result) {
      log(selector, start);
      resolve(result);
    } else {
      let animationFrameId: number;
      const query = () => {
        const result = findFnc(selector);
        const elapsed = Date.now() - start;
        if (result) {
          cancelAnimationFrame(animationFrameId);
          log(selector, start);
          resolve(result);
        } else if (Date.now() > isOverTimestamp) {
          cancelAnimationFrame(animationFrameId);
          reject(new Error(`${selector} not found in ${elapsed} milliseconds`));
        } else {
          animationFrameId = requestAnimationFrame(query);
        }
      };
      animationFrameId = requestAnimationFrame(query);
    }
  });
}
