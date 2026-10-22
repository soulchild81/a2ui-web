import {describe, expect, it} from 'vitest';
import {basicCatalog} from '@a2ui/web_core/v0_9';
import {
  COMPOSER_ALLOWED_A2UI_COMPONENTS,
  COMPOSER_RENDERED_COMPONENTS,
  cadenzaBasicCatalog,
} from './cadenzaBasicCatalog';
import {
  CADENZA_CUSTOM_CATALOG_DOCUMENT,
  CADENZA_CUSTOM_CATALOG_ID,
  CADENZA_CUSTOM_COMPONENT_NAMES,
  CADENZA_CUSTOM_DATA_COMPS,
} from './cadenzaCustomCatalog';

describe('cadenzaBasicCatalog', () => {
  it('extends the official Basic Catalog with the Cadenza custom contract', () => {
    expect(cadenzaBasicCatalog.id).toBe(CADENZA_CUSTOM_CATALOG_ID);
    expect(cadenzaBasicCatalog.protocolVersion).toBe(basicCatalog.protocolVersion);
    expect(cadenzaBasicCatalog.components.size).toBe(COMPOSER_ALLOWED_A2UI_COMPONENTS.length);
    expect(new Set(cadenzaBasicCatalog.components.keys())).toEqual(new Set([
      ...basicCatalog.components.keys(),
      ...CADENZA_CUSTOM_COMPONENT_NAMES,
    ]));
    expect(cadenzaBasicCatalog.components.size).toBe(65);
  });

  it.each(COMPOSER_ALLOWED_A2UI_COMPONENTS)('registers a React renderer for %s', (name) => {
    const implementation = cadenzaBasicCatalog.components.get(name);

    expect(implementation).toBeDefined();
    expect(implementation).toHaveProperty('view');
  });

  it('covers all 64 Composer data-comp contracts', () => {
    expect(new Set(COMPOSER_RENDERED_COMPONENTS).size).toBe(64);
    expect(new Set(COMPOSER_RENDERED_COMPONENTS)).toEqual(new Set([
      'basic-title', 'basic-ellipsis-text', 'card', 'base-button', 'base-flex',
      'base-modal-layout', 'basic-info-list', 'checkbox', 'date-range-picker',
      'divider', 'group-tag', 'icon', 'input', 'radio', 'slider', 'tab-list',
      'textarea', ...CADENZA_CUSTOM_DATA_COMPS,
    ]));
  });

  it('publishes JSON Schema for every custom component', () => {
    expect(Object.keys(CADENZA_CUSTOM_CATALOG_DOCUMENT.components)).toEqual(
      CADENZA_CUSTOM_COMPONENT_NAMES,
    );
  });
});
