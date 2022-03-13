export const byId = (id) => document.getElementById(id);
export const bySelector = (selector) => document.querySelectorAll(selector);
export const getFirst = (items) => {
    if (!items || items.length === 0) {
        return null;
    }
    return items[0];
};
const log = (selector, start) => {
    console.info(`${selector} found in ${Date.now() - start} milliseconds`);
};
export function findElements(selector, findFnc = byId, timeout = 10000) {
    const start = Date.now();
    const isOverTimestamp = start + timeout;
    return new Promise((resolve, reject) => {
        const result = findFnc(selector);
        if (result) {
            log(selector, start);
            resolve(result);
        }
        else {
            let animationFrameId;
            const query = () => {
                const result = findFnc(selector);
                const elapsed = Date.now() - start;
                if (result) {
                    cancelAnimationFrame(animationFrameId);
                    log(selector, start);
                    resolve(result);
                }
                else if (Date.now() > isOverTimestamp) {
                    cancelAnimationFrame(animationFrameId);
                    reject(new Error(`${selector} not found in ${elapsed} milliseconds`));
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