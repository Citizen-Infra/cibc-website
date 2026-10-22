// Exercise the installed shared token contract, not an independent local copy.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const css = readFileSync(new URL(import.meta.resolve('@citizen-infra/design-system/tokens.css')), 'utf8');
const source = css.replace(/\/\*[\s\S]*?\*\//g, '');

function declarations(block) {
  const entries = [...block.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)]
    .map(([, name, value]) => [name, value.trim()]);
  assert.equal(new Set(entries.map(([name]) => name)).size, entries.length,
    'No duplicate declarations within a token block');
  return Object.fromEntries(entries);
}

const light = declarations(source.match(/:root,\s*\[data-cibc-theme="light"\]\s*\{([^}]+)\}/)[1]);
const dark = declarations(source.match(/\[data-cibc-theme="dark"\]\s*\{([^}]+)\}/)[1]);

function luminance(hex) {
  assert.match(hex, /^#[0-9a-f]{6}$/i, 'Contrast inputs must be opaque sRGB hex');
  const linear = [1, 3, 5].map((index) => {
    const value = Number.parseInt(hex.slice(index, index + 2), 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}

function contrast(a, b) {
  const [low, high] = [luminance(a), luminance(b)].sort((x, y) => x - y);
  return (high + 0.05) / (low + 0.05);
}

const textPairs = [];
for (const foreground of ['text', 'text-secondary', 'text-muted', 'link', 'link-hover']) {
  for (const background of ['page', 'surface', 'surface-subtle', 'surface-raised']) {
    textPairs.push([`color-${foreground}`, `color-${background}`]);
  }
}
for (const family of ['action', 'accent']) {
  for (const state of ['', '-hover', '-active']) {
    textPairs.push([`color-on-${family}`, `color-${family}${state}`]);
  }
}
textPairs.push(['color-on-selected', 'color-selected']);
textPairs.push(['color-on-disabled', 'color-disabled']);
for (const status of ['success', 'warning', 'danger', 'info']) {
  textPairs.push([`color-${status}`, `color-${status}-surface`]);
}
for (const level of ['empty', 'low', 'mid', 'high']) {
  textPairs.push([`data-on-${level}`, `data-${level}`]);
}
for (const field of ['strong', 'warm', 'fresh']) {
  textPairs.push([`color-on-surface-${field}`, `color-surface-${field}`]);
}
textPairs.push(['color-link-inverse', 'color-surface-strong']);
textPairs.push(['color-link-inverse-hover', 'color-surface-strong']);

const boundaryPairs = [];
for (const foreground of ['focus', 'control-border', 'action']) {
  for (const background of ['page', 'surface', 'surface-subtle', 'surface-raised']) {
    boundaryPairs.push([`color-${foreground}`, `color-${background}`]);
  }
}
for (const status of ['success', 'warning', 'danger', 'info']) {
  boundaryPairs.push([`color-${status}-border`, `color-${status}-surface`]);
}
boundaryPairs.push(['color-focus-inverse', 'color-surface-strong']);
for (const field of ['warm', 'fresh']) {
  boundaryPairs.push(['color-focus-on-vivid', `color-surface-${field}`]);
}

test('light and dark expose the same namespaced theme contract', () => {
  assert.deepEqual(Object.keys(light).sort(), Object.keys(dark).sort());
  for (const name of [...source.matchAll(/(--[\w-]+)\s*:/g)].map((match) => match[1])) {
    assert.ok(name.startsWith('--cibc-'), `${name} must be namespaced`);
  }
});

for (const [mode, tokens] of Object.entries({ light, dark })) {
  test(`${mode}: ${textPairs.length} defined text pairs meet 4.5:1`, () => {
    for (const [foreground, background] of textPairs) {
      const ratio = contrast(tokens[`--cibc-${foreground}`], tokens[`--cibc-${background}`]);
      assert.ok(ratio >= 4.5,
        `${foreground} on ${background}: ${ratio.toFixed(2)}:1, needs 4.5:1`);
    }
  });
  test(`${mode}: ${boundaryPairs.length} focus/control pairs meet 3:1`, () => {
    for (const [foreground, background] of boundaryPairs) {
      const ratio = contrast(tokens[`--cibc-${foreground}`], tokens[`--cibc-${background}`]);
      assert.ok(ratio >= 3,
        `${foreground} against ${background}: ${ratio.toFixed(2)}:1, needs 3:1`);
    }
  });
}

test('tokens neither fetch fonts nor style application components', () => {
  assert.doesNotMatch(source, /@import|@font-face|url\s*\(/);
  assert.doesNotMatch(source, /(?:^|\})\s*(?:body|button|a|input|h[1-6])\b/m);
  assert.match(source, /--cibc-font-sans:\s*"Public Sans"/);
  const reduced = source.match(/@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]+$/)[0];
  for (const name of ['fast', 'base', 'slow']) {
    assert.match(reduced, new RegExp(`--cibc-duration-${name}:\\s*0ms`));
  }
});
