import {describe, expect, it} from 'vitest';
import {basicCatalog} from '@a2ui/web_core/v0_9';
import {
  COMPOSER_ALLOWED_A2UI_COMPONENTS,
  COMPOSER_RENDERED_COMPONENTS,
  cadenzaBasicCatalog,
} from './cadenzaBasicCatalog';

describe('cadenzaBasicCatalog', () => {
  it('keeps the official Basic Catalog protocol contract', () => {
    expect(cadenzaBasicCatalog.id).toBe(basicCatalog.id);
    expect(cadenzaBasicCatalog.protocolVersion).toBe(basicCatalog.protocolVersion);
    expect(cadenzaBasicCatalog.components.size).toBe(COMPOSER_ALLOWED_A2UI_COMPONENTS.length);
    expect(Array.from(cadenzaBasicCatalog.components.keys()).sort()).toEqual(
      [...COMPOSER_ALLOWED_A2UI_COMPONENTS].sort(),
    );
  });

  it.each(COMPOSER_ALLOWED_A2UI_COMPONENTS)('registers a React renderer for %s', (name) => {
    const implementation = cadenzaBasicCatalog.components.get(name);

    expect(implementation).toBeDefined();
    expect(implementation).toHaveProperty('view');
  });

  it('documents only composer component stems emitted by the renderers', () => {
    expect(COMPOSER_RENDERED_COMPONENTS).toEqual([
      'basic-title',
      'basic-ellipsis-text',
      'card',
      'base-button',
      'base-flex',
    ]);
  });
});
