import {createComponentImplementation, type ReactCatalogComponent} from '@a2ui/react/v0_9';
import {
  basicCatalog,
  ButtonApi,
  Catalog,
  CardApi,
  ColumnApi,
  RowApi,
  TextApi,
} from '@a2ui/web_core/v0_9';

const justifyContent = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  spaceBetween: 'space-between',
  spaceAround: 'space-around',
  spaceEvenly: 'space-evenly',
  stretch: 'stretch',
} as const;

const alignItems = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
} as const;

function renderChild(
  child: string | {id: string; basePath: string},
  buildChild: (id: string, basePath?: string) => React.ReactNode,
) {
  return typeof child === 'string'
    ? buildChild(child)
    : buildChild(child.id, child.basePath);
}

const CadenzaText = createComponentImplementation(TextApi, ({props}) => {
  const accessibility = {
    'aria-label': props.accessibility?.label,
    'aria-description': props.accessibility?.description,
  };
  const heading = (level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5') => {
    const Heading = level;
    const titleLevel = level === 'h1' || level === 'h2' ? 'panel' : 'section';

    return (
      <div
        className={`sds-basic-title sds-basic-title--${titleLevel}`}
        data-comp="basic-title"
        data-sds-remove="subtree"
        {...accessibility}
      >
        <div className="sds-basic-title-group">
          <div className="sds-basic-title-row">
            <Heading className="sds-basic-title-heading">{props.text}</Heading>
          </div>
        </div>
      </div>
    );
  };

  switch (props.variant) {
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
      return heading(props.variant);
    case 'caption':
      return (
        <div
          className="sds-ellipsis-text sds-ellipsis-text--caption"
          data-comp="basic-ellipsis-text"
          data-sds-remove="subtree"
          {...accessibility}
        >
          {props.text}
        </div>
      );
    default:
      return (
        <div
          className="sds-ellipsis-text"
          data-comp="basic-ellipsis-text"
          data-sds-remove="subtree"
          {...accessibility}
        >
          {props.text}
        </div>
      );
  }
});

const CadenzaCard = createComponentImplementation(CardApi, ({props, buildChild}) => (
  <section
    className="sds-card sds-card--bordered sds-card--hug"
    data-comp="card"
    data-sds-remove="subtree"
    aria-label={props.accessibility?.label}
    aria-description={props.accessibility?.description}
  >
    <div className="sds-card-body">{buildChild(props.child)}</div>
  </section>
));

const CadenzaButton = createComponentImplementation(ButtonApi, ({props, buildChild}) => {
  const variant = props.variant === 'primary'
    ? 'primary'
    : props.variant === 'borderless'
      ? 'ghost'
      : 'secondary';
  const failedCheck = props.checks?.find((check) => !check.condition);

  return (
    <button
      type="button"
      className={`sds-btn sds-btn--${variant}`}
      data-comp="base-button"
      data-sds-remove="subtree"
      disabled={Boolean(failedCheck)}
      title={failedCheck?.message}
      aria-label={props.accessibility?.label}
      aria-description={props.accessibility?.description}
      onClick={() => void props.action()}
    >
      <span className="sds-btn-label" data-part="text">{buildChild(props.child)}</span>
    </button>
  );
});

const CadenzaRow = createComponentImplementation(RowApi, ({props, buildChild}) => (
  <div
    className="sds-base-flex sds-base-flex--horizontal"
    data-comp="base-flex"
    data-sds-remove="subtree"
    style={{
      justifyContent: justifyContent[props.justify ?? 'start'],
      alignItems: alignItems[props.align ?? 'stretch'],
    }}
    aria-label={props.accessibility?.label}
    aria-description={props.accessibility?.description}
  >
    {props.children.map((child) => renderChild(child, buildChild))}
  </div>
));

const CadenzaColumn = createComponentImplementation(ColumnApi, ({props, buildChild}) => (
  <div
    className="sds-base-flex sds-base-flex--vertical"
    data-comp="base-flex"
    data-sds-remove="subtree"
    style={{
      justifyContent: justifyContent[props.justify ?? 'start'],
      alignItems: alignItems[props.align ?? 'stretch'],
    }}
    aria-label={props.accessibility?.label}
    aria-description={props.accessibility?.description}
  >
    {props.children.map((child) => renderChild(child, buildChild))}
  </div>
));

const cadenzaImplementations = new Map<string, ReactCatalogComponent>([
  [TextApi.name, CadenzaText],
  [CardApi.name, CadenzaCard],
  [ButtonApi.name, CadenzaButton],
  [RowApi.name, CadenzaRow],
  [ColumnApi.name, CadenzaColumn],
]);

const components = Array.from(cadenzaImplementations.values());

/**
 * A pruned A2UI Basic Catalog v0.9 whose renderers only emit component markup
 * published by docs/design-system/composer/index.html.
 */
export const cadenzaBasicCatalog = new Catalog<ReactCatalogComponent>(
  basicCatalog.id,
  basicCatalog.protocolVersion,
  components,
  Array.from(basicCatalog.functions.values()),
  basicCatalog.themeSchema,
  basicCatalog.instructions,
);

export const COMPOSER_ALLOWED_A2UI_COMPONENTS = Object.freeze([
  TextApi.name,
  CardApi.name,
  ButtonApi.name,
  RowApi.name,
  ColumnApi.name,
]);

export const COMPOSER_RENDERED_COMPONENTS = Object.freeze([
  'basic-title',
  'basic-ellipsis-text',
  'card',
  'base-button',
  'base-flex',
]);

export const COMPOSER_RENDERER_FOR_COMPONENT = Object.freeze({
  Text: 'basic-title 또는 basic-ellipsis-text',
  Card: 'card',
  Button: 'base-button',
  Row: 'base-flex(horizontal)',
  Column: 'base-flex(vertical)',
} as const);
