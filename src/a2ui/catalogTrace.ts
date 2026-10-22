import type {ProcessableMessage} from '@a2ui/web_core/v0_9';
import type {CatalogProfile} from './a2uiCache';
import {
  COMPOSER_RENDERER_FOR_COMPONENT,
  cadenzaBasicCatalog,
} from './cadenzaBasicCatalog';

type RendererCatalog = typeof cadenzaBasicCatalog;

type ComponentResolution = {
  surfaceId: string;
  componentId: string;
  requestedType: string;
  catalogRegistered: boolean;
  rendererForm: string;
  propertyShape: string[];
};

export type CatalogReferenceTrace = {
  catalogProfile: CatalogProfile;
  catalogId: string;
  protocolVersion: string;
  registeredComponentCount: number;
  receivedMessageCount: number;
  componentResolution: ComponentResolution[];
};

export function buildCatalogReferenceTrace(
  messages: ProcessableMessage[],
  catalog: RendererCatalog,
  profile: CatalogProfile,
): CatalogReferenceTrace {
  const componentResolution: ComponentResolution[] = [];

  messages.forEach((message) => {
    const update = (message as unknown as {
      updateComponents?: {surfaceId?: string; components?: unknown[]};
    }).updateComponents;
    if (!update || !Array.isArray(update.components)) return;

    update.components.forEach((value) => {
      if (!value || typeof value !== 'object') return;
      const component = value as Record<string, unknown>;
      const requestedType = getComponentType(component.component);
      const catalogRegistered = Boolean(requestedType)
        && catalog.components.has(requestedType);

      componentResolution.push({
        surfaceId: update.surfaceId ?? '',
        componentId: typeof component.id === 'string' ? component.id : '',
        requestedType,
        catalogRegistered,
        rendererForm: getRendererForm(requestedType, catalogRegistered, profile),
        propertyShape: Object.keys(component).filter(
          (property) => property !== 'id' && property !== 'component',
        ),
      });
    });
  });

  return {
    catalogProfile: profile,
    catalogId: catalog.id,
    protocolVersion: catalog.protocolVersion,
    registeredComponentCount: catalog.components.size,
    receivedMessageCount: messages.length,
    componentResolution,
  };
}

function getComponentType(component: unknown): string {
  if (typeof component === 'string') return component;
  if (!component || typeof component !== 'object' || Array.isArray(component)) return '';
  return Object.keys(component)[0] ?? '';
}

function getRendererForm(
  componentType: string,
  registered: boolean,
  profile: CatalogProfile,
): string {
  if (!registered) return '등록되지 않은 컴포넌트';
  if (profile === 'basic') return `@a2ui/react 기본 ${componentType} renderer`;
  return COMPOSER_RENDERER_FOR_COMPONENT[
    componentType as keyof typeof COMPOSER_RENDERER_FOR_COMPONENT
  ] ?? 'Cadenza renderer';
}
