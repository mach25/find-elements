# @mach25/find-elements

[![npm](https://img.shields.io/npm/v/@mach25/find-elements.svg)](https://www.npmjs.com/package/@mach25/find-elements)
[![license](https://img.shields.io/npm/l/@mach25/find-elements.svg)](./LICENSE)

Find elements on a web page that may not exist yet.

Elements injected by a third-party script, a slow-loading widget or a framework that renders after your code runs are not in the DOM when you go looking for them. `findElements` returns a promise that polls for the element on every animation frame and resolves as soon as it appears, or rejects once a timeout elapses.

## Install

```sh
npm install @mach25/find-elements
```

## Usage

```js
import { findElements } from '@mach25/find-elements';

const banner = await findElements('cookie-banner');
banner.classList.add('ready');
```

By default it looks the element up by `id`. Pass a different selector function as the second argument:

```js
import { findElements, bySelector, getFirst } from '@mach25/find-elements';

// All matches for a CSS selector, once at least one exists
const rows = await findElements('.data-row', bySelector);

// Just the first match
const firstRow = await findElements('.data-row', (s) => getFirst(document.querySelectorAll(s)));
```

Failures reject, so handle them:

```js
import { byId, findElements } from '@mach25/find-elements';

try {
  const el = await findElements('late-widget', byId, 3000);
} catch (err) {
  // Error: late-widget not found in 3012 milliseconds
}
```

## API

### `findElements(selector, findFnc?, timeout?)`

| Parameter  | Type                                         | Default | Description                    |
| ---------- | -------------------------------------------- | ------- | ------------------------------ |
| `selector` | `string`                                     | —       | Passed through to `findFnc`.   |
| `findFnc`  | `(selector: string) => HTMLElements \| null` | `byId`  | How to look the element up.    |
| `timeout`  | `number`                                     | `10000` | Milliseconds before giving up. |

Returns a `Promise` that resolves with whatever `findFnc` returned. It calls `findFnc` once immediately; if that comes back falsy it re-checks on each `requestAnimationFrame` until something is found or `timeout` is exceeded, then rejects with an `Error`.

Because polling is driven by `requestAnimationFrame`, a backgrounded or hidden tab throttles the checks — the promise settles once the tab is visible again, and the reported elapsed time can overshoot `timeout` considerably.

Every successful find writes a line to `console.info`.

### Selector functions

The lookup is a parameter rather than a fixed strategy, so a call states what it is waiting for and how to find it — `findElements('.data-row', bySelector, 2000)` reads as a sentence. The two built-ins cover the common cases; supplying your own is a one-liner. Each returns `null` on a miss, which is what lets `findElements` keep polling.

| Function               | Looks up with               | Returns                                     |
| ---------------------- | --------------------------- | ------------------------------------------- |
| `byId(id)`             | `document.getElementById`   | The element, or `null`. The default.        |
| `bySelector(selector)` | `document.querySelectorAll` | The `NodeList`, or `null` when it is empty. |

`getFirst(items)` is the odd one out: it takes a `NodeList` rather than a string, so it cannot be passed to `findElements` directly. Compose it with a lookup to wait for the first match:

```js
findElements('.data-row', (s) => getFirst(document.querySelectorAll(s)));
```

### Writing your own

Any `(selector: string) => HTMLElements | null` works. The one rule is that a miss must be **falsy** — `findElements` treats any truthy return as a hit, and an empty `NodeList` is still an object, so returning one would resolve the promise instead of polling.

```js
const byDataRole = (role) => document.querySelector(`[data-role="${role}"]`);
const el = await findElements('submit', byDataRole);
```

## Requirements

Browser only — it uses `document` and `requestAnimationFrame`, so there is no Node or SSR support.

The package is ESM only (`"type": "module"`); `require()` will not work. TypeScript declarations are bundled.

## Development

```sh
npm run build   # compile src/ to lib/
```

## License

MIT
