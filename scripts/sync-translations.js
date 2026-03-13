#!/usr/bin/env node
/**
 * Sync translation keys across locales.
 * - Flattens JSON to dot-notation (nested objects only, skips arrays)
 * - Uses en/translation.json as source of truth
 * - Reports missing keys per locale
 * - Optionally adds missing keys with English value as placeholder
 *
 * Usage: node scripts/sync-translations.js [--fix]
 */

const fs = require('fs');
const path = require('path');

const LOCALES_DIR = path.join(__dirname, '../src/locales');
const SOURCE_LOCALE = 'en';
const OTHER_LOCALES = ['es', 'fr', 'de', 'it', 'pt', 'ca', 'zh', 'ja'];

/**
 * Recursively flatten object to dot-notation keys.
 * Skips arrays (only handles nested objects).
 */
function flattenObject(obj, prefix = '') {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, fullKey));
    } else {
      result[fullKey] = value;
    }
  }
  return result;
}

/**
 * Unflatten dot-notation keys back to nested object.
 */
function unflattenObject(flat) {
  const result = {};
  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split('.');
    let current = result;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!(part in current)) current[part] = {};
      current = current[part];
    }
    current[parts[parts.length - 1]] = value;
  }
  return result;
}

function loadTranslation(locale) {
  const filePath = path.join(LOCALES_DIR, locale, 'translation.json');
  const content = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(content);
}

function saveTranslation(locale, obj) {
  const filePath = path.join(LOCALES_DIR, locale, 'translation.json');
  fs.writeFileSync(filePath, JSON.stringify(obj, null, 2) + '\n', 'utf8');
}

function deepMerge(target, source) {
  for (const [key, value] of Object.entries(source)) {
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      if (!(key in target)) target[key] = {};
      deepMerge(target[key], value);
    } else {
      target[key] = value;
    }
  }
}

function setNestedValue(obj, keyPath, value) {
  const parts = keyPath.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!(part in current)) current[part] = {};
    current = current[part];
  }
  current[parts[parts.length - 1]] = value;
}

function main() {
  const fix = process.argv.includes('--fix');

  const enRaw = loadTranslation(SOURCE_LOCALE);
  const enFlat = flattenObject(enRaw);

  const enKeys = Object.keys(enFlat).sort();
  console.log(`\nSource (${SOURCE_LOCALE}): ${enKeys.length} keys\n`);

  const report = {};
  let totalMissing = 0;

  for (const locale of OTHER_LOCALES) {
    const raw = loadTranslation(locale);
    const flat = flattenObject(raw);
    const missing = enKeys.filter((k) => !(k in flat));
    report[locale] = missing;
    totalMissing += missing.length;

    if (missing.length > 0) {
      console.log(`${locale}: ${missing.length} missing keys`);
      missing.forEach((k) => console.log(`  - ${k}`));
      console.log('');
    } else {
      console.log(`${locale}: OK (no missing keys)\n`);
    }
  }

  if (totalMissing === 0) {
    console.log('All locales are in sync.\n');
    return;
  }

  if (fix) {
    console.log('--- Adding missing keys with English placeholders ---\n');
    for (const locale of OTHER_LOCALES) {
      const missing = report[locale];
      if (missing.length === 0) continue;

      const raw = loadTranslation(locale);
      for (const key of missing) {
        const enValue = enFlat[key];
        setNestedValue(raw, key, enValue);
      }
      saveTranslation(locale, raw);
      console.log(`Updated ${locale}: added ${missing.length} keys`);
    }
    console.log('\nDone. Please translate the new keys in each locale.\n');
  } else {
    console.log('Run with --fix to add missing keys with English placeholders.\n');
  }
}

main();
