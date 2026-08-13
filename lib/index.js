export * from './select.js';
export const byId = (id) => document.getElementById(id);
export const bySelector = (selector) => {
    const found = document.querySelectorAll(selector);
    return found.length === 0 ? null : found;
};
/**
 * Longest gap between two frames that still counts as real waiting. Anything longer means
 * frames stopped running rather than that time passed while looking for the element.
 */
const MAX_FRAME_GAP = 100;
const log = (selector, start) => {
    console.info(`${selector} found in ${Date.now() - start} milliseconds`);
};
export function findElements(selector, findFnc = byId, timeout = 10000) {
    const start = Date.now();
    return new Promise((resolve, reject) => {
        const result = findFnc(selector);
        if (result) {
            log(selector, start);
            resolve(result);
        }
        else {
            let animationFrameId;
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
                }
                else {
                    animationFrameId = requestAnimationFrame(query);
                }
            };
            animationFrameId = requestAnimationFrame(query);
        }
    });
}
//# sourceMappingURL=index.js.map