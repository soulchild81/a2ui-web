import {render, waitFor} from '@testing-library/react';
import {A2uiSurface, type ReactCatalogComponent} from '@a2ui/react/v0_9';
import {MessageProcessor, type ProcessableMessage} from '@a2ui/web_core/v0_9';
import {afterEach, describe, expect, it} from 'vitest';
import {cadenzaBasicCatalog} from './cadenzaBasicCatalog';
import {
  CADENZA_CUSTOM_COMPONENT_SPECS,
  CADENZA_CUSTOM_DATA_COMPS,
} from './cadenzaCustomCatalog';

const surfaceId = 'cadenza-custom-showcase';

function sampleProperties(kind: string): Record<string, unknown> {
  switch (kind) {
    case 'container': return {title: '영역', children: ['shared-text']};
    case 'overlay': return {title: '오버레이', trigger: 'shared-trigger', content: 'shared-content'};
    case 'message': return {title: '상태 메시지', description: '처리 결과입니다.', tone: 'info'};
    case 'data': return {columns: ['name', 'status'], rows: [{name: 'A2UI', status: 'ready'}]};
    case 'accordion': return {items: [{title: '상세', content: 'shared-content', open: true}]};
    case 'tree': return {nodes: [{id: 'root-node', label: '루트'}]};
    case 'uploader': return {label: '파일 선택', accept: '.json'};
    case 'chart': return {title: '사용량', labels: ['1월', '2월'], series: [{name: '요청', values: [3, 7]}]};
    case 'navigation': return {items: [{label: '첫 항목', value: 'first'}], selected: 'first'};
    case 'code': return {code: '{"status":"ok"}', language: 'json'};
    case 'copy': return {value: 'copy-value', label: '복사'};
    case 'empty': return {title: '데이터 없음', description: '표시할 결과가 없습니다.'};
    case 'feedback': return {label: '처리 중', value: 45, max: 100};
    case 'pagination': return {page: 1, totalPages: 3};
    case 'select':
    case 'segmented': return {label: '선택', options: [{label: '옵션', value: 'option'}], value: 'option'};
    case 'number': return {label: '수량', value: 1, min: 0, max: 10};
    case 'step': return {items: [{title: '요청', status: 'complete'}, {title: '응답', status: 'active'}]};
    case 'tag': return {text: '정상', tone: 'green'};
    case 'toggle': return {label: '활성화', value: true};
    default: throw new Error(`Unsupported test component kind: ${kind}`);
  }
}

describe('Cadenza custom catalog integration', () => {
  const processors: MessageProcessor<ReactCatalogComponent>[] = [];

  afterEach(() => {
    processors.splice(0).forEach((processor) => processor.dispose());
  });

  it('renders all 47 custom component contracts with Composer data-comp markup', async () => {
    const customComponents = CADENZA_CUSTOM_COMPONENT_SPECS.map((spec, index) => ({
      id: `custom-${index}`,
      component: spec.name,
      ...sampleProperties(spec.kind),
    }));
    const messages: ProcessableMessage[] = [
      {
        version: 'v0.9',
        createSurface: {
          surfaceId,
          catalogId: cadenzaBasicCatalog.id,
          sendDataModel: true,
        },
      },
      {
        version: 'v0.9',
        updateComponents: {
          surfaceId,
          components: [
            {
              id: 'root',
              component: 'Column',
              children: customComponents.map((component) => component.id),
            },
            {id: 'shared-text', component: 'Text', text: '공통 콘텐츠'},
            {id: 'shared-trigger', component: 'Text', text: '열기'},
            {id: 'shared-content', component: 'Text', text: '오버레이 콘텐츠'},
            ...customComponents,
          ],
        },
      },
    ];
    const processor = new MessageProcessor<ReactCatalogComponent>(
      [cadenzaBasicCatalog],
      async () => {},
    );
    processors.push(processor);
    processor.processMessages(messages);
    const surface = processor.getSurfaces().get(surfaceId);

    expect(surface).toBeDefined();
    const {container} = render(<A2uiSurface surface={surface!} />);

    await waitFor(() => {
      expect(container.querySelectorAll('.sds-a2ui-custom')).toHaveLength(47);
    });
    CADENZA_CUSTOM_DATA_COMPS.forEach((dataComp) => {
      expect(container.querySelector(`[data-comp="${dataComp}"]`)).toBeInTheDocument();
    });
  });
});
