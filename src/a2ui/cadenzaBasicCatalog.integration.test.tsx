import {render, waitFor} from '@testing-library/react';
import {A2uiSurface, type ReactCatalogComponent} from '@a2ui/react/v0_9';
import {MessageProcessor, type ProcessableMessage} from '@a2ui/web_core/v0_9';
import {afterEach, describe, expect, it} from 'vitest';
import {cadenzaBasicCatalog} from './cadenzaBasicCatalog';

const surfaceId = 'cadenza-component-showcase';

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
          children: [
            'heading', 'image', 'icon', 'video', 'audio', 'row', 'list', 'card',
            'tabs', 'modal', 'divider', 'button', 'text-field', 'checkbox',
            'choice-picker', 'slider', 'date-time',
          ],
        },
        {id: 'heading', component: 'Text', text: '전체 컴포넌트', variant: 'h2'},
        {
          id: 'image',
          component: 'Image',
          url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg"/%3E',
          description: '샘플 이미지',
        },
        {id: 'icon', component: 'Icon', name: 'info'},
        {id: 'video', component: 'Video', url: 'https://example.com/sample.mp4'},
        {
          id: 'audio',
          component: 'AudioPlayer',
          url: 'https://example.com/sample.mp3',
          description: '샘플 오디오',
        },
        {id: 'row', component: 'Row', children: ['row-text']},
        {id: 'row-text', component: 'Text', text: '행 콘텐츠'},
        {id: 'list', component: 'List', children: ['list-text']},
        {id: 'list-text', component: 'Text', text: '목록 콘텐츠'},
        {id: 'card', component: 'Card', child: 'card-text'},
        {id: 'card-text', component: 'Text', text: '카드 콘텐츠'},
        {id: 'tabs', component: 'Tabs', tabs: [{title: '첫 번째', child: 'tab-text'}]},
        {id: 'tab-text', component: 'Text', text: '탭 콘텐츠'},
        {id: 'modal', component: 'Modal', trigger: 'modal-trigger', content: 'modal-content'},
        {id: 'modal-trigger', component: 'Text', text: '모달 열기'},
        {id: 'modal-content', component: 'Text', text: '모달 콘텐츠'},
        {id: 'divider', component: 'Divider', axis: 'horizontal'},
        {
          id: 'button',
          component: 'Button',
          child: 'button-label',
          action: {event: {name: 'test_action'}},
        },
        {id: 'button-label', component: 'Text', text: '버튼'},
        {id: 'text-field', component: 'TextField', label: '이름', value: 'A2UI'},
        {id: 'checkbox', component: 'CheckBox', label: '동의', value: true},
        {
          id: 'choice-picker',
          component: 'ChoicePicker',
          label: '선택',
          options: [{label: '옵션', value: 'option'}],
          value: ['option'],
        },
        {id: 'slider', component: 'Slider', label: '범위', min: 0, max: 10, value: 5},
        {
          id: 'date-time',
          component: 'DateTimeInput',
          label: '일시',
          value: '2026-10-22T15:00:00',
          enableDate: true,
          enableTime: true,
        },
      ],
    },
  },
];

describe('cadenzaBasicCatalog integration', () => {
  const processors: MessageProcessor<ReactCatalogComponent>[] = [];

  afterEach(() => {
    processors.splice(0).forEach((processor) => processor.dispose());
  });

  it('renders every A2UI v0.9 Basic Catalog component with Cadenza markup', async () => {
    const processor = new MessageProcessor<ReactCatalogComponent>([cadenzaBasicCatalog], async () => {});
    processors.push(processor);
    processor.processMessages(messages);
    const surface = processor.getSurfaces().get(surfaceId);

    expect(surface).toBeDefined();
    const {container} = render(<A2uiSurface surface={surface!} />);

    await waitFor(() => {
      expect(container.querySelectorAll('[data-comp]').length).toBeGreaterThanOrEqual(18);
    });
    expect(container.querySelector('[data-comp="tab-list"]')).toBeInTheDocument();
    expect(container.querySelector('[data-comp="input"]')).toBeInTheDocument();
    expect(container.querySelector('[data-comp="checkbox"]')).toBeInTheDocument();
    expect(container.querySelector('[data-comp="slider"]')).toBeInTheDocument();
    expect(container.querySelector('[data-comp="date-range-picker"]')).toBeInTheDocument();
  });
});
