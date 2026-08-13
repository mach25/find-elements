import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { byId, bySelector, findElements, getFirst } from '../src/index.js';

/** Appends an element to the body and returns it. */
const append = (tag: string, attrs: Record<string, string> = {}): HTMLElement => {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    el.setAttribute(key, value);
  }
  document.body.appendChild(el);
  return el;
};

beforeEach(() => {
  document.body.innerHTML = '';
  vi.spyOn(console, 'info').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('byId', () => {
  it('returns the element with the given id', () => {
    const el = append('div', { id: 'widget' });
    expect(byId('widget')).toBe(el);
  });

  it('returns null when no element has the id', () => {
    expect(byId('missing')).toBeNull();
  });
});

describe('bySelector', () => {
  it('returns every match for the selector', () => {
    const first = append('p', { class: 'row' });
    const second = append('p', { class: 'row' });
    append('p', { class: 'other' });

    const found = bySelector('.row');
    expect(found).not.toBeNull();
    expect(Array.from(found!)).toEqual([first, second]);
  });

  it('returns null when nothing matches', () => {
    expect(bySelector('.nothing')).toBeNull();
  });
});

describe('getFirst', () => {
  it('returns the first item', () => {
    const first = append('li', { class: 'item' });
    append('li', { class: 'item' });

    expect(getFirst(document.querySelectorAll('.item'))).toBe(first);
  });

  it('returns null for an empty list', () => {
    expect(getFirst(document.querySelectorAll('.item'))).toBeNull();
  });

  it('returns null for a nullish list', () => {
    expect(getFirst(null as unknown as NodeListOf<Element>)).toBeNull();
  });
});

describe('findElements', () => {
  it('resolves with an element that is already present', async () => {
    const el = append('div', { id: 'ready' });
    await expect(findElements('ready')).resolves.toBe(el);
  });

  it('defaults to looking the selector up by id', async () => {
    const el = append('div', { id: 'by-default' });
    append('div', { class: 'by-default' });

    await expect(findElements('by-default')).resolves.toBe(el);
  });

  it('waits for an element that appears later', async () => {
    const start = Date.now();
    const pending = findElements('late', byId, 2000);
    setTimeout(() => append('div', { id: 'late' }), 30);

    const found = await pending;
    expect(found).toBe(document.getElementById('late'));
    expect(found).not.toBeNull();
    expect(Date.now() - start).toBeGreaterThanOrEqual(30);
  });

  it('rejects once the timeout elapses', async () => {
    await expect(findElements('never', byId, 50)).rejects.toThrow(/^never not found in \d+ milliseconds$/);
  });

  it('rejects with an Error', async () => {
    await expect(findElements('never', byId, 50)).rejects.toBeInstanceOf(Error);
  });

  it('accepts a custom find function and passes the selector to it', async () => {
    const el = append('div', { 'data-role': 'custom' });
    const findFnc = vi.fn((selector: string) => document.querySelector(`[data-role="${selector}"]`));

    await expect(findElements('custom', findFnc)).resolves.toBe(el);
    expect(findFnc).toHaveBeenCalledWith('custom');
  });

  it('polls a custom find function until it returns a match', async () => {
    const findFnc = vi.fn<(selector: string) => Element | null>().mockReturnValueOnce(null).mockReturnValueOnce(null);
    const el = append('div', { id: 'polled' });
    findFnc.mockReturnValue(el);

    await expect(findElements('polled', findFnc)).resolves.toBe(el);
    expect(findFnc.mock.calls.length).toBeGreaterThan(1);
  });

  it('logs how long the lookup took', async () => {
    append('div', { id: 'logged' });
    await findElements('logged');

    expect(console.info).toHaveBeenCalledWith(expect.stringMatching(/^logged found in \d+ milliseconds$/));
  });

  it('does not log when the lookup times out', async () => {
    await expect(findElements('never', byId, 50)).rejects.toThrow();
    expect(console.info).not.toHaveBeenCalled();
  });

  it('waits for a CSS selector when the find function returns null on a miss', async () => {
    const start = Date.now();
    const pending = findElements('.row', (s) => getFirst(document.querySelectorAll(s)), 2000);
    setTimeout(() => append('p', { class: 'row' }), 30);

    const found = await pending;
    expect(found).toBe(document.querySelector('.row'));
    expect(found).not.toBeNull();
    expect(Date.now() - start).toBeGreaterThanOrEqual(30);
  });
});

// Regression: querySelectorAll returns an empty NodeList on a miss, and an empty NodeList
// is still an object, so it is truthy. findElements treats any truthy return as a hit, so
// bySelector used to short-circuit the polling entirely — never waiting, never timing out.
// bySelector now returns null for an empty result, which keeps these paths honest.
describe('findElements with bySelector', () => {
  it('rejects when nothing ever matches the selector', async () => {
    await expect(findElements('.absent', bySelector, 50)).rejects.toThrow(/^\.absent not found in \d+ milliseconds$/);
  });

  it('waits for elements that appear later', async () => {
    const start = Date.now();
    const pending = findElements('.late-row', bySelector, 2000);
    setTimeout(() => append('p', { class: 'late-row' }), 30);

    await expect(pending).resolves.toHaveLength(1);
    expect(Date.now() - start).toBeGreaterThanOrEqual(30);
  });
});
