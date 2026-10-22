import {describe, expect, it} from 'vitest';
import type {ProcessableMessage} from '@a2ui/web_core/v0_9';
import {buildCatalogReferenceTrace} from './catalogTrace';
import {cadenzaBasicCatalog} from './cadenzaBasicCatalog';

describe('buildCatalogReferenceTrace', () => {
  it('records how received components resolve through the selected catalog', () => {
    const messages = [{
      version: 'v0.9',
      updateComponents: {
        surfaceId: 'surface-1',
        components: [
          {id: 'title', component: 'Text', text: '제목', variant: 'h2'},
          {id: 'unknown', component: 'UnknownWidget'},
        ],
      },
    }] as unknown as ProcessableMessage[];

    const trace = buildCatalogReferenceTrace(messages, cadenzaBasicCatalog, 'cadenza');

    expect(trace.catalogProfile).toBe('cadenza');
    expect(trace.receivedMessageCount).toBe(1);
    expect(trace.componentResolution[0]).toMatchObject({
      componentId: 'title',
      requestedType: 'Text',
      catalogRegistered: true,
      rendererForm: 'basic-title 또는 basic-ellipsis-text',
      propertyShape: ['text', 'variant'],
    });
    expect(trace.componentResolution[1].catalogRegistered).toBe(false);
  });
});
