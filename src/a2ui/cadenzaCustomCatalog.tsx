import type {ReactNode} from 'react';
import {createComponentImplementation, type ReactCatalogComponent} from '@a2ui/react/v0_9';
import {Catalog, type ComponentApi} from '@a2ui/web_core/v0_9';

export const CADENZA_CUSTOM_CATALOG_ID =
  'https://okestro.dev/a2ui/catalogs/cadenza-composer-v0.9.json';

type ComponentKind =
  | 'accordion'
  | 'chart'
  | 'code'
  | 'container'
  | 'copy'
  | 'data'
  | 'empty'
  | 'feedback'
  | 'message'
  | 'navigation'
  | 'number'
  | 'overlay'
  | 'pagination'
  | 'select'
  | 'segmented'
  | 'step'
  | 'tag'
  | 'toggle'
  | 'tree'
  | 'uploader';

type CadenzaComponentSpec = {
  name: string;
  dataComp: string;
  kind: ComponentKind;
  description: string;
};

export const CADENZA_CUSTOM_COMPONENT_SPECS = Object.freeze([
  {name: 'Accordion', dataComp: 'accordion', kind: 'accordion', description: '접고 펼칠 수 있는 콘텐츠 묶음'},
  {name: 'AddTable', dataComp: 'add-table', kind: 'data', description: '행 추가 기능을 표현하는 데이터 표'},
  {name: 'Alert', dataComp: 'alert', kind: 'message', description: '상태 또는 주의 메시지'},
  {name: 'Drawer', dataComp: 'base-drawer', kind: 'overlay', description: '트리거로 여는 서랍형 패널'},
  {name: 'Layout', dataComp: 'base-layout', kind: 'container', description: '일반 페이지 레이아웃'},
  {name: 'Table', dataComp: 'base-table', kind: 'data', description: '열과 행으로 구성된 데이터 표'},
  {name: 'Tooltip', dataComp: 'base-tooltip', kind: 'overlay', description: '트리거에 연결된 도움말'},
  {name: 'ConfirmModal', dataComp: 'basic-confirm-modal', kind: 'overlay', description: '확인 작업을 위한 모달'},
  {name: 'FormItem', dataComp: 'basic-form-item', kind: 'container', description: '라벨과 입력 요소를 묶는 폼 항목'},
  {name: 'Tree', dataComp: 'basic-tree', kind: 'tree', description: '계층형 탐색 데이터'},
  {name: 'Uploader', dataComp: 'basic-uploader', kind: 'uploader', description: '파일 업로드 입력'},
  {name: 'Chart', dataComp: 'chart', kind: 'chart', description: '범주와 수치 계열을 표현하는 차트'},
  {name: 'ChartLegend', dataComp: 'chart-legend', kind: 'navigation', description: '차트 계열 범례'},
  {name: 'CodeView', dataComp: 'code-view', kind: 'code', description: '코드 또는 JSON 원문 표시'},
  {name: 'Content', dataComp: 'content', kind: 'container', description: '페이지의 주 콘텐츠 영역'},
  {name: 'ControlBar', dataComp: 'control-bar', kind: 'container', description: '조회 및 작업 컨트롤 모음'},
  {name: 'CopyButton', dataComp: 'copy-button', kind: 'copy', description: '값 복사 버튼'},
  {name: 'CreateLayout', dataComp: 'create-layout', kind: 'container', description: '생성 화면 레이아웃'},
  {name: 'DashboardLayout', dataComp: 'dashboard-layout', kind: 'container', description: '대시보드 레이아웃'},
  {name: 'DetailLayout', dataComp: 'detail-layout', kind: 'container', description: '상세 화면 레이아웃'},
  {name: 'Dropdown', dataComp: 'dropdown', kind: 'overlay', description: '트리거로 여는 드롭다운'},
  {name: 'Filter', dataComp: 'filter', kind: 'container', description: '검색 조건 영역'},
  {name: 'FilterButton', dataComp: 'filter-button', kind: 'message', description: '필터 실행 또는 상태 버튼'},
  {name: 'Form', dataComp: 'form', kind: 'container', description: '입력 항목 그룹'},
  {name: 'FormLayout', dataComp: 'form-layout', kind: 'container', description: '폼 페이지 레이아웃'},
  {name: 'InputNumber', dataComp: 'input-number', kind: 'number', description: '숫자 입력'},
  {name: 'ListLayout', dataComp: 'list-layout', kind: 'container', description: '목록 화면 레이아웃'},
  {name: 'ListBox', dataComp: 'listbox', kind: 'navigation', description: '선택 가능한 목록'},
  {name: 'Loader', dataComp: 'loader', kind: 'feedback', description: '영역 로딩 상태'},
  {name: 'MiniLineChart', dataComp: 'mini-line-chart', kind: 'chart', description: '간단한 추이 차트'},
  {name: 'NoData', dataComp: 'no-data', kind: 'empty', description: '조회 결과가 없는 상태'},
  {name: 'Pagination', dataComp: 'pagination', kind: 'pagination', description: '페이지 이동 컨트롤'},
  {name: 'Popover', dataComp: 'popover', kind: 'overlay', description: '트리거에 연결된 팝오버'},
  {name: 'Progress', dataComp: 'progress', kind: 'feedback', description: '진행률 표시'},
  {name: 'Segmented', dataComp: 'segmented', kind: 'segmented', description: '세그먼트 단일 선택'},
  {name: 'Select', dataComp: 'select', kind: 'select', description: '옵션 선택 입력'},
  {name: 'SidePanel', dataComp: 'side-panel', kind: 'overlay', description: '측면 상세 패널'},
  {name: 'SideStep', dataComp: 'side-step', kind: 'step', description: '측면 단계 표시'},
  {name: 'Sider', dataComp: 'sider', kind: 'container', description: '사이드 탐색 영역'},
  {name: 'Skeleton', dataComp: 'skeleton', kind: 'feedback', description: '콘텐츠 자리 표시자'},
  {name: 'Spinner', dataComp: 'spinner', kind: 'feedback', description: '작업 진행 스피너'},
  {name: 'StatusHeader', dataComp: 'status-header', kind: 'message', description: '상태 중심 헤더'},
  {name: 'StatusTag', dataComp: 'status-tag', kind: 'tag', description: '상태 태그'},
  {name: 'Step', dataComp: 'step', kind: 'step', description: '단계 진행 목록'},
  {name: 'StepIndicator', dataComp: 'step-indicator', kind: 'step', description: '간단한 단계 인디케이터'},
  {name: 'Switch', dataComp: 'switch', kind: 'toggle', description: '켜짐과 꺼짐 상태 입력'},
  {name: 'Toast', dataComp: 'toast', kind: 'message', description: '일시적 결과 알림'},
] satisfies CadenzaComponentSpec[]);

const commonTypes = 'https://a2ui.org/specification/v0_9/common_types.json#/$defs/';
const ref = (name: string) => ({$ref: `${commonTypes}${name}`});
const arrayOf = (items: Record<string, unknown>, minItems = 0) => ({
  type: 'array',
  items,
  ...(minItems ? {minItems} : {}),
});
const optionSchema = {
  type: 'object',
  properties: {
    label: {type: 'string'},
    value: {type: 'string'},
    description: {type: 'string'},
  },
  required: ['label', 'value'],
  additionalProperties: false,
};

function propertiesFor(kind: ComponentKind): {properties: Record<string, unknown>; required: string[]} {
  switch (kind) {
    case 'container':
      return {properties: {title: {type: 'string'}, description: {type: 'string'}, children: ref('ChildList'), variant: {type: 'string'}}, required: ['children']};
    case 'overlay':
      return {properties: {title: {type: 'string'}, trigger: ref('ComponentId'), content: ref('ComponentId'), placement: {type: 'string', enum: ['top', 'right', 'bottom', 'left', 'center']}}, required: ['trigger', 'content']};
    case 'message':
      return {properties: {title: {type: 'string'}, description: {type: 'string'}, tone: {type: 'string', enum: ['info', 'success', 'warning', 'error', 'neutral']}, action: ref('Action')}, required: ['title']};
    case 'data':
      return {properties: {title: {type: 'string'}, columns: arrayOf({type: 'string'}, 1), rows: arrayOf({type: 'object', additionalProperties: {type: ['string', 'number', 'boolean', 'null']}}), action: ref('Action')}, required: ['columns', 'rows']};
    case 'accordion':
      return {properties: {items: arrayOf({type: 'object', properties: {title: {type: 'string'}, content: ref('ComponentId'), open: {type: 'boolean'}}, required: ['title', 'content'], additionalProperties: false}, 1)}, required: ['items']};
    case 'tree':
      return {properties: {nodes: arrayOf({type: 'object', properties: {id: {type: 'string'}, label: {type: 'string'}, parentId: {type: 'string'}, status: {type: 'string'}}, required: ['id', 'label'], additionalProperties: false}, 1), selectedId: {type: 'string'}, action: ref('Action')}, required: ['nodes']};
    case 'uploader':
      return {properties: {label: {type: 'string'}, description: {type: 'string'}, accept: {type: 'string'}, multiple: {type: 'boolean'}, action: ref('Action')}, required: ['label']};
    case 'chart':
      return {properties: {title: {type: 'string'}, labels: arrayOf({type: 'string'}, 1), series: arrayOf({type: 'object', properties: {name: {type: 'string'}, values: arrayOf({type: 'number'}, 1)}, required: ['name', 'values'], additionalProperties: false}, 1)}, required: ['labels', 'series']};
    case 'navigation':
      return {properties: {label: {type: 'string'}, items: arrayOf(optionSchema, 1), selected: {type: 'string'}, action: ref('Action')}, required: ['items']};
    case 'code':
      return {properties: {code: {type: 'string'}, language: {type: 'string'}, title: {type: 'string'}}, required: ['code']};
    case 'copy':
      return {properties: {value: {type: 'string'}, label: {type: 'string'}}, required: ['value']};
    case 'empty':
      return {properties: {title: {type: 'string'}, description: {type: 'string'}, action: ref('Action')}, required: ['title']};
    case 'feedback':
      return {properties: {label: {type: 'string'}, value: {type: 'number', minimum: 0}, max: {type: 'number', exclusiveMinimum: 0}, variant: {type: 'string'}}, required: []};
    case 'pagination':
      return {properties: {page: {type: 'integer', minimum: 1}, totalPages: {type: 'integer', minimum: 1}, action: ref('Action')}, required: ['page', 'totalPages']};
    case 'select':
    case 'segmented':
      return {properties: {label: {type: 'string'}, options: arrayOf(optionSchema, 1), value: {type: 'string'}, action: ref('Action')}, required: ['options']};
    case 'number':
      return {properties: {label: {type: 'string'}, value: {type: 'number'}, min: {type: 'number'}, max: {type: 'number'}, step: {type: 'number', exclusiveMinimum: 0}, action: ref('Action')}, required: ['value']};
    case 'step':
      return {properties: {items: arrayOf({type: 'object', properties: {title: {type: 'string'}, description: {type: 'string'}, status: {type: 'string', enum: ['pending', 'active', 'complete', 'error']}}, required: ['title', 'status'], additionalProperties: false}, 1)}, required: ['items']};
    case 'tag':
      return {properties: {text: {type: 'string'}, tone: {type: 'string', enum: ['gray', 'green', 'blue', 'yellow', 'red']}}, required: ['text']};
    case 'toggle':
      return {properties: {label: {type: 'string'}, value: {type: 'boolean'}, action: ref('Action')}, required: ['value']};
  }
}

function componentSchema(spec: CadenzaComponentSpec) {
  const {properties, required} = propertiesFor(spec.kind);
  return {
    type: 'object',
    description: spec.description,
    allOf: [
      ref('ComponentCommon'),
      {
        type: 'object',
        properties: {component: {const: spec.name}, ...properties},
        required: ['component', ...required],
      },
    ],
    unevaluatedProperties: false,
  };
}

export const CADENZA_CUSTOM_CATALOG_DOCUMENT = Object.freeze({
  catalogId: CADENZA_CUSTOM_CATALOG_ID,
  protocolVersion: '0.9',
  title: 'Cadenza Composer Custom Components',
  description: 'Cadenza Composer 전용 A2UI 컴포넌트 JSON Schema',
  components: Object.fromEntries(
    CADENZA_CUSTOM_COMPONENT_SPECS.map((spec) => [spec.name, componentSchema(spec)]),
  ),
});

const customSchemaCatalog = Catalog.fromJson(CADENZA_CUSTOM_CATALOG_DOCUMENT);

type BuildChild = (id: string, basePath?: string) => ReactNode;
type ResolvedChild = string | {id: string; basePath?: string};
type CustomProps = Record<string, any>;

function renderChild(child: ResolvedChild, buildChild: BuildChild) {
  return typeof child === 'string' ? buildChild(child) : buildChild(child.id, child.basePath);
}

function runAction(action: unknown) {
  if (typeof action === 'function') void action();
}

function CadenzaCustomComponent({
  spec,
  props,
  buildChild,
}: {
  spec: CadenzaComponentSpec;
  props: CustomProps;
  buildChild: BuildChild;
}) {
  const baseClass = `sds-${spec.dataComp}`;
  const common = {className: `${baseClass} sds-a2ui-custom`, 'data-comp': spec.dataComp};

  switch (spec.kind) {
    case 'container':
      return (
        <section {...common} data-variant={props.variant}>
          {props.title ? <h3 className={`${baseClass}-title`}>{props.title}</h3> : null}
          {props.description ? <p className={`${baseClass}-description`}>{props.description}</p> : null}
          <div className={`${baseClass}-content`}>
            {(props.children ?? []).map((child: ResolvedChild, index: number) => (
              <div className={`${baseClass}-item`} key={typeof child === 'string' ? child : `${child.id}:${index}`}>
                {renderChild(child, buildChild)}
              </div>
            ))}
          </div>
        </section>
      );
    case 'overlay':
      return (
        <details {...common}>
          <summary className={`${baseClass}-trigger`}>{buildChild(props.trigger)}</summary>
          <section className={`${baseClass}-overlay sds-a2ui-overlay--${props.placement ?? 'bottom'}`}>
            {props.title ? <h3>{props.title}</h3> : null}
            {buildChild(props.content)}
          </section>
        </details>
      );
    case 'message':
      return (
        <section {...common} className={`${baseClass} ${baseClass}--${props.tone ?? 'neutral'} sds-a2ui-custom`} role={spec.dataComp === 'alert' ? 'alert' : 'status'}>
          <strong className={`${baseClass}-title`}>{props.title}</strong>
          {props.description ? <p className={`${baseClass}-description`}>{props.description}</p> : null}
          {props.action ? <button className="sds-btn sds-btn--secondary sds-btn--sm" type="button" onClick={() => runAction(props.action)}>확인</button> : null}
        </section>
      );
    case 'data':
      return (
        <section {...common}>
          {props.title ? <h3 className={`${baseClass}-title`}>{props.title}</h3> : null}
          <div className={`${baseClass}-scroll`}>
            <table className={`${baseClass}-table`}>
              <thead><tr>{props.columns.map((column: string) => <th key={column}>{column}</th>)}</tr></thead>
              <tbody>{props.rows.map((row: Record<string, unknown>, index: number) => (
                <tr key={index}>{props.columns.map((column: string) => <td key={column}>{String(row[column] ?? '')}</td>)}</tr>
              ))}</tbody>
            </table>
          </div>
        </section>
      );
    case 'accordion':
      return (
        <section {...common}>{props.items.map((item: CustomProps, index: number) => (
          <details className="sds-accordion-item" open={Boolean(item.open)} key={`${item.title}:${index}`}>
            <summary className="sds-accordion-header">{item.title}</summary>
            <div className="sds-accordion-content">{buildChild(item.content)}</div>
          </details>
        ))}</section>
      );
    case 'tree':
      return (
        <ul {...common} role="tree">{props.nodes.map((node: CustomProps) => (
          <li className={node.id === props.selectedId ? 'sds-is-selected' : ''} role="treeitem" key={node.id} data-parent-id={node.parentId} onClick={() => runAction(props.action)}>
            <span className="sds-basic-tree-item-label">{node.label}</span>
            {node.status ? <small>{node.status}</small> : null}
          </li>
        ))}</ul>
      );
    case 'uploader':
      return (
        <label {...common}>
          <strong>{props.label}</strong>
          {props.description ? <span>{props.description}</span> : null}
          <input type="file" accept={props.accept} multiple={Boolean(props.multiple)} onChange={() => runAction(props.action)} />
        </label>
      );
    case 'chart': {
      const values = props.series.flatMap((series: CustomProps) => series.values as number[]);
      const maximum = Math.max(...values, 1);
      return (
        <figure {...common}>
          {props.title ? <figcaption>{props.title}</figcaption> : null}
          <div className={`${baseClass}-plot`} aria-label={props.title ?? spec.description}>
            {props.series.map((series: CustomProps) => (
              <div className={`${baseClass}-series`} key={series.name}>
                <strong>{series.name}</strong>
                <div className={`${baseClass}-bars`}>{series.values.map((value: number, index: number) => (
                  <span className={`${baseClass}-bar`} key={`${series.name}:${index}`} style={{height: `${Math.max(8, value / maximum * 100)}%`}} title={`${props.labels[index]}: ${value}`} />
                ))}</div>
              </div>
            ))}
          </div>
        </figure>
      );
    }
    case 'navigation':
      return (
        <nav {...common} aria-label={props.label ?? spec.description}>
          {props.label ? <strong>{props.label}</strong> : null}
          <ul>{props.items.map((item: CustomProps) => (
            <li key={item.value}><button type="button" className={item.value === props.selected ? 'sds-is-selected' : ''} onClick={() => runAction(props.action)}>{item.label}</button></li>
          ))}</ul>
        </nav>
      );
    case 'code':
      return <section {...common}>{props.title ? <strong>{props.title}</strong> : null}<pre><code data-language={props.language}>{props.code}</code></pre></section>;
    case 'copy':
      return <button {...common} type="button" onClick={() => void navigator.clipboard?.writeText(props.value)}>{props.label ?? '복사'}</button>;
    case 'empty':
      return <section {...common}><strong>{props.title}</strong>{props.description ? <p>{props.description}</p> : null}{props.action ? <button type="button" onClick={() => runAction(props.action)}>다시 시도</button> : null}</section>;
    case 'feedback': {
      if (spec.dataComp === 'spinner') return <span {...common} role="status" aria-label={props.label ?? '로딩 중'}><span className="sds-spinner-icon" /></span>;
      if (spec.dataComp === 'skeleton') return <div {...common} aria-hidden="true"><span /><span /><span /></div>;
      const maximum = props.max ?? 100;
      return <div {...common} role="progressbar" aria-valuenow={props.value} aria-valuemax={maximum}><span>{props.label}</span><div className={`${baseClass}-track`}><span style={{width: `${Math.min(100, (props.value ?? 0) / maximum * 100)}%`}} /></div></div>;
    }
    case 'pagination':
      return <nav {...common} aria-label="페이지 이동"><button type="button" disabled={props.page <= 1} onClick={() => runAction(props.action)}>이전</button><span>{props.page} / {props.totalPages}</span><button type="button" disabled={props.page >= props.totalPages} onClick={() => runAction(props.action)}>다음</button></nav>;
    case 'select':
      return <label {...common}>{props.label ? <span>{props.label}</span> : null}<select value={props.value ?? ''} onChange={() => runAction(props.action)}>{props.options.map((option: CustomProps) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
    case 'segmented':
      return <fieldset {...common}>{props.label ? <legend>{props.label}</legend> : null}{props.options.map((option: CustomProps) => <button type="button" className={option.value === props.value ? 'sds-is-selected' : ''} key={option.value} onClick={() => runAction(props.action)}>{option.label}</button>)}</fieldset>;
    case 'number':
      return <label {...common}>{props.label ? <span>{props.label}</span> : null}<input type="number" value={props.value} min={props.min} max={props.max} step={props.step} onChange={() => runAction(props.action)} /></label>;
    case 'step':
      return <ol {...common}>{props.items.map((item: CustomProps, index: number) => <li className={`sds-is-${item.status}`} key={`${item.title}:${index}`}><span className={`${baseClass}-index`}>{index + 1}</span><div><strong>{item.title}</strong>{item.description ? <p>{item.description}</p> : null}</div></li>)}</ol>;
    case 'tag':
      return <span {...common} className={`${baseClass} ${baseClass}--${props.tone ?? 'gray'} sds-a2ui-custom`}>{props.text}</span>;
    case 'toggle':
      return <label {...common}><input className="sds-switch-native-input" type="checkbox" role="switch" checked={Boolean(props.value)} onChange={() => runAction(props.action)} /><span className="sds-switch-track"><span className="sds-switch-thumb" /></span>{props.label ? <span>{props.label}</span> : null}</label>;
  }
}

function createCustomImplementation(spec: CadenzaComponentSpec): ReactCatalogComponent {
  const api = customSchemaCatalog.components.get(spec.name) as ComponentApi;
  return createComponentImplementation(api, ({props, buildChild}) => (
    <CadenzaCustomComponent spec={spec} props={props as CustomProps} buildChild={buildChild} />
  ));
}

export const CADENZA_CUSTOM_IMPLEMENTATIONS = new Map<string, ReactCatalogComponent>(
  CADENZA_CUSTOM_COMPONENT_SPECS.map((spec) => [spec.name, createCustomImplementation(spec)]),
);

export const CADENZA_CUSTOM_COMPONENT_NAMES = Object.freeze(
  CADENZA_CUSTOM_COMPONENT_SPECS.map((spec) => spec.name),
);

export const CADENZA_CUSTOM_DATA_COMPS = Object.freeze(
  CADENZA_CUSTOM_COMPONENT_SPECS.map((spec) => spec.dataComp),
);

export const CADENZA_CUSTOM_RENDERER_FOR_COMPONENT = Object.freeze(
  Object.fromEntries(CADENZA_CUSTOM_COMPONENT_SPECS.map((spec) => [spec.name, spec.dataComp])),
);
