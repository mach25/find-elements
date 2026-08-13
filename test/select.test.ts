import { beforeEach, describe, expect, it, vi } from 'vitest';
import { bySelector, filter, findElements, getAt, getFirst, getLast, take, takeLast } from '../src/index.js';

/** Appends `count` list items and returns them. */
const appendItems = (count: number): HTMLElement[] =>
  Array.from({ length: count }, (_, i) => {
    const el = document.createElement('li');
    el.className = 'item';
    el.dataset.index = String(i);
    document.body.appendChild(el);
    return el;
  });

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('getFirst', () => {
  it('yields the first match of the wrapped lookup', () => {
    const [first] = appendItems(3);
    expect(getFirst(bySelector)('.item')).toBe(first);
  });

  it('returns null when the wrapped lookup finds nothing', () => {
    expect(getFirst(bySelector)('.item')).toBeNull();
  });

  it('passes the selector through to the wrapped lookup', () => {
    const findFnc = vi.fn(bySelector);
    getFirst(findFnc)('.item');

    expect(findFnc).toHaveBeenCalledWith('.item');
  });
});

describe('getLast', () => {
  it('yields the last match', () => {
    const items = appendItems(3);
    expect(getLast(bySelector)('.item')).toBe(items[2]);
  });

  it('yields the only match when there is one', () => {
    const [only] = appendItems(1);
    expect(getLast(bySelector)('.item')).toBe(only);
  });

  it('returns null when nothing matches', () => {
    expect(getLast(bySelector)('.item')).toBeNull();
  });
});

describe('getAt', () => {
  it('yields the match at the index', () => {
    const items = appendItems(4);
    expect(getAt(bySelector, 2)('.item')).toBe(items[2]);
  });

  it('counts back from the end for a negative index', () => {
    const items = appendItems(4);
    expect(getAt(bySelector, -1)('.item')).toBe(items[3]);
    expect(getAt(bySelector, -2)('.item')).toBe(items[2]);
  });

  it('returns null until the index exists', () => {
    appendItems(2);
    expect(getAt(bySelector, 5)('.item')).toBeNull();
  });

  it('returns null when a negative index reaches past the start', () => {
    appendItems(2);
    expect(getAt(bySelector, -3)('.item')).toBeNull();
  });

  it('returns null when nothing matches', () => {
    expect(getAt(bySelector, 0)('.item')).toBeNull();
  });
});

describe('take', () => {
  it('yields the first count matches', () => {
    const items = appendItems(5);
    expect(take(bySelector, 3)('.item')).toEqual([items[0], items[1], items[2]]);
  });

  it('yields all of them when count matches the total exactly', () => {
    const items = appendItems(3);
    expect(take(bySelector, 3)('.item')).toEqual(items);
  });

  // Yielding fewer would resolve findElements before the rest had rendered, which is the
  // whole thing this library exists to avoid.
  it('returns null until at least count elements exist', () => {
    appendItems(2);
    expect(take(bySelector, 3)('.item')).toBeNull();
  });

  it('returns null rather than an empty array for a count below one', () => {
    appendItems(3);
    expect(take(bySelector, 0)('.item')).toBeNull();
    expect(take(bySelector, -1)('.item')).toBeNull();
  });

  it('returns null when nothing matches', () => {
    expect(take(bySelector, 1)('.item')).toBeNull();
  });
});

describe('takeLast', () => {
  it('yields the last count matches', () => {
    const items = appendItems(5);
    expect(takeLast(bySelector, 2)('.item')).toEqual([items[3], items[4]]);
  });

  it('returns null until at least count elements exist', () => {
    appendItems(2);
    expect(takeLast(bySelector, 3)('.item')).toBeNull();
  });

  it('returns null when nothing matches', () => {
    expect(takeLast(bySelector, 1)('.item')).toBeNull();
  });
});

describe('filter', () => {
  it('yields every match satisfying the predicate', () => {
    const items = appendItems(4);
    const even = filter(bySelector, (el) => Number((el as HTMLElement).dataset.index) % 2 === 0);

    expect(even('.item')).toEqual([items[0], items[2]]);
  });

  it('passes the index to the predicate', () => {
    appendItems(3);
    const predicate = vi.fn((_element: Element, _index: number) => true);
    filter(bySelector, predicate)('.item');

    expect(predicate.mock.calls.map(([, index]) => index)).toEqual([0, 1, 2]);
  });

  it('returns null rather than an empty array when nothing satisfies it', () => {
    appendItems(3);
    expect(filter(bySelector, () => false)('.item')).toBeNull();
  });

  it('returns null when nothing matches', () => {
    expect(filter(bySelector, () => true)('.item')).toBeNull();
  });
});

// An empty array is truthy just like an empty NodeList, so a wrapper that returned one would
// resolve findElements immediately instead of waiting — the bug bySelector used to have.
describe('waiting through findElements', () => {
  it('waits until take has enough elements', async () => {
    appendItems(1);
    const pending = findElements('.item', take(bySelector, 3), 2000);
    setTimeout(() => appendItems(2), 30);

    await expect(pending).resolves.toHaveLength(3);
  });

  it('rejects rather than resolving early when the count is never reached', async () => {
    appendItems(2);
    await expect(findElements('.item', take(bySelector, 3), 50)).rejects.toThrow(/not found in \d+ milliseconds$/);
  });

  it('rejects rather than resolving early when the predicate never matches', async () => {
    appendItems(3);
    await expect(
      findElements(
        '.item',
        filter(bySelector, () => false),
        50
      )
    ).rejects.toThrow(/not found in \d+ milliseconds$/);
  });

  it('waits for the element at a given index', async () => {
    appendItems(1);
    const pending = findElements('.item', getAt(bySelector, 2), 2000);
    setTimeout(() => appendItems(2), 30);

    const found = await pending;
    expect(found).toBe(document.querySelectorAll('.item')[2]);
  });
});
