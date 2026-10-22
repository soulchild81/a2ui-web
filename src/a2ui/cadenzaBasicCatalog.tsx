import {useId, useState, type ReactNode} from 'react';
import {createComponentImplementation, type ReactCatalogComponent} from '@a2ui/react/v0_9';
import {
  AudioPlayerApi,
  basicCatalog,
  ButtonApi,
  Catalog,
  CardApi,
  CheckBoxApi,
  ChoicePickerApi,
  ColumnApi,
  DateTimeInputApi,
  DividerApi,
  IconApi,
  ImageApi,
  ListApi,
  ModalApi,
  RowApi,
  SliderApi,
  TabsApi,
  TextApi,
  TextFieldApi,
  VideoApi,
} from '@a2ui/web_core/v0_9';
import {
  CADENZA_CUSTOM_CATALOG_ID,
  CADENZA_CUSTOM_COMPONENT_NAMES,
  CADENZA_CUSTOM_DATA_COMPS,
  CADENZA_CUSTOM_IMPLEMENTATIONS,
  CADENZA_CUSTOM_RENDERER_FOR_COMPONENT,
} from './cadenzaCustomCatalog';

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
  buildChild: (id: string, basePath?: string) => ReactNode,
) {
  return typeof child === 'string'
    ? buildChild(child)
    : buildChild(child.id, child.basePath);
}

const materialIconOverrides: Record<string, string> = {
  favoriteOff: 'favorite_border',
  play: 'play_arrow',
  rewind: 'fast_rewind',
  starOff: 'star_border',
};

function toMaterialIconName(name: string): string {
  return materialIconOverrides[name]
    ?? name.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function splitDateTime(value: string): {date: string; time: string} {
  if (!value) return {date: '', time: ''};
  const [date = '', rawTime = ''] = value.split('T');
  return {
    date: value.includes('T') || value.includes('-') ? date : '',
    time: value.includes('T') ? rawTime.slice(0, 5) : value.includes(':') ? value.slice(0, 5) : '',
  };
}

function resolvedText(value: unknown): string {
  return typeof value === 'string' || typeof value === 'number' ? String(value) : '';
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

const CadenzaImage = createComponentImplementation(ImageApi, ({props}) => (
  <figure
    className={`sds-card sds-card--bordered sds-card--hug sds-a2ui-image sds-a2ui-image--${props.variant ?? 'mediumFeature'}`}
    data-comp="card"
    data-sds-remove="subtree"
  >
    <img
      src={props.url}
      alt={props.description ?? props.accessibility?.label ?? ''}
      style={{objectFit: props.fit === 'scaleDown' ? 'scale-down' : props.fit}}
    />
  </figure>
));

const CadenzaIcon = createComponentImplementation(IconApi, ({props}) => {
  const icon = props.name;
  if (typeof icon === 'object' && icon !== null && 'svgPath' in icon) {
    return (
      <svg
        className="sds-icon sds-icon--md sds-a2ui-icon-svg"
        data-comp="icon"
        data-sds-remove="subtree"
        viewBox="0 0 24 24"
        role="img"
        aria-label={props.accessibility?.label}
      >
        <path d={icon.svgPath} />
      </svg>
    );
  }

  return (
    <span
      className="sds-icon sds-icon--md material-symbols-rounded"
      data-comp="icon"
      data-sds-remove="subtree"
      role="img"
      aria-label={props.accessibility?.label}
    >
      {typeof icon === 'string' ? toMaterialIconName(icon) : ''}
    </span>
  );
});

const CadenzaVideo = createComponentImplementation(VideoApi, ({props}) => (
  <div className="sds-card sds-card--bordered sds-card--hug sds-a2ui-media" data-comp="card">
    <video controls src={props.url} aria-label={props.accessibility?.label} />
  </div>
));

const CadenzaAudioPlayer = createComponentImplementation(AudioPlayerApi, ({props}) => (
  <div className="sds-card sds-card--bordered sds-card--hug sds-a2ui-media" data-comp="card">
    {props.description ? <div className="sds-ellipsis-text">{props.description}</div> : null}
    <audio controls src={props.url} aria-label={props.accessibility?.label} />
  </div>
));

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

const CadenzaList = createComponentImplementation(ListApi, ({props, buildChild}) => (
  <div
    className={`sds-info-list sds-info-list--${props.direction ?? 'vertical'} sds-a2ui-list`}
    data-comp="basic-info-list"
    data-sds-remove="subtree"
    style={{alignItems: alignItems[props.align ?? 'stretch']}}
    aria-label={props.accessibility?.label}
  >
    {props.children.map((child) => (
      <div className="sds-info-list-row" key={typeof child === 'string' ? child : `${child.basePath}:${child.id}`}>
        {renderChild(child, buildChild)}
      </div>
    ))}
  </div>
));

const CadenzaTabs = createComponentImplementation(TabsApi, ({props, buildChild}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const activeIndex = Math.min(selectedIndex, Math.max(props.tabs.length - 1, 0));
  const activeTab = props.tabs[activeIndex];

  return (
    <section className="sds-tab-list sds-tab-list--no-operation" data-comp="tab-list">
      <div className="sds-tab-header" role="tablist" aria-label={props.accessibility?.label}>
        {props.tabs.map((tab, index) => (
          <div className={`sds-tab-item ${index === activeIndex ? 'sds-is-active' : ''}`} key={`${index}:${tab.child}`}>
            <button
              className="sds-tab-item-btn"
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              onClick={() => setSelectedIndex(index)}
            >
              {resolvedText(tab.title)}
            </button>
          </div>
        ))}
      </div>
      <div className="sds-tab-content" role="tabpanel">
        {activeTab ? buildChild(activeTab.child) : null}
      </div>
    </section>
  );
});

const CadenzaModal = createComponentImplementation(ModalApi, ({props, buildChild}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="sds-a2ui-modal-trigger" onClick={() => setOpen(true)}>
      {buildChild(props.trigger)}
      {open ? (
        <div
          className="sds-modal-portal"
          data-comp="base-modal-layout"
          role="presentation"
          onClick={(event) => {
            event.stopPropagation();
            setOpen(false);
          }}
        >
          <div className="sds-modal-scrim" />
          <section
            className="sds-modal sds-modal--md"
            role="dialog"
            aria-modal="true"
            aria-label={props.accessibility?.label}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sds-modal-body">{buildChild(props.content)}</div>
            <div className="sds-modal-footer">
              <button type="button" className="sds-btn sds-btn--secondary" onClick={() => setOpen(false)}>
                닫기
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
});

const CadenzaDivider = createComponentImplementation(DividerApi, ({props}) => (
  <div
    className={`sds-divider sds-divider--${props.axis ?? 'horizontal'}`}
    data-comp="divider"
    data-sds-remove="subtree"
    role="separator"
    aria-orientation={props.axis ?? 'horizontal'}
    aria-label={props.accessibility?.label}
  />
));

const CadenzaTextField = createComponentImplementation(TextFieldApi, ({props}) => {
  const inputId = useId();
  const inputType = props.variant === 'number'
    ? 'number'
    : props.variant === 'obscured'
      ? 'password'
      : 'text';
  const failedCheck = props.checks?.find((check) => !check.condition);
  const commonProps = {
    id: inputId,
    value: props.value ?? '',
    className: 'sds-input-el',
    'aria-invalid': Boolean(failedCheck),
    'aria-label': props.accessibility?.label,
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      props.setValue?.(event.target.value);
    },
  };

  return (
    <label className={`sds-form-item ${failedCheck ? 'sds-is-error' : ''}`} htmlFor={inputId}>
      <span className="sds-form-item-label">{props.label}</span>
      <div
        className={`sds-input ${props.variant === 'longText' ? 'sds-input--textarea' : 'sds-input--text'}`}
        data-comp={props.variant === 'longText' ? 'textarea' : 'input'}
      >
        {props.variant === 'longText'
          ? <textarea {...commonProps} />
          : <input {...commonProps} type={inputType} pattern={props.validationRegexp} />}
      </div>
      {failedCheck ? <span className="sds-form-item-help">{failedCheck.message}</span> : null}
    </label>
  );
});

const CadenzaCheckBox = createComponentImplementation(CheckBoxApi, ({props}) => {
  const failedCheck = props.checks?.find((check) => !check.condition);
  return (
    <label
      className={`sds-checkbox sds-checkbox--single ${props.value ? 'sds-is-checked' : ''} ${failedCheck ? 'sds-is-error' : ''}`}
      data-comp="checkbox"
    >
      <span className="sds-checkbox-control">
        <input
          className="sds-checkbox-native-input"
          type="checkbox"
          checked={Boolean(props.value)}
          aria-invalid={Boolean(failedCheck)}
          onChange={(event) => props.setValue?.(event.target.checked)}
        />
        <span className="sds-checkbox-box" aria-hidden="true" />
      </span>
      <span className="sds-checkbox-label">{props.label}</span>
    </label>
  );
});

const CadenzaChoicePicker = createComponentImplementation(ChoicePickerApi, ({props}) => {
  const [filter, setFilter] = useState('');
  const groupName = useId();
  const selected = props.value ?? [];
  const multiple = props.variant === 'multipleSelection';
  const chips = props.displayStyle === 'chips';
  const options = props.options.filter((option) => (
    !props.filterable || String(option.label).toLowerCase().includes(filter.toLowerCase())
  ));
  const toggle = (value: string) => {
    if (multiple) {
      props.setValue?.(
        selected.includes(value)
          ? selected.filter((selectedValue) => selectedValue !== value)
          : [...selected, value],
      );
      return;
    }
    props.setValue?.([value]);
  };

  return (
    <fieldset className="sds-choice-picker">
      {props.label ? <legend className="sds-form-item-label">{props.label}</legend> : null}
      {props.filterable ? (
        <div className="sds-input sds-input--text" data-comp="input">
          <input
            className="sds-input-el"
            type="search"
            value={filter}
            placeholder="옵션 검색"
            onChange={(event) => setFilter(event.target.value)}
          />
        </div>
      ) : null}
      <div
        className={chips
          ? 'sds-group-tag'
          : `sds-${multiple ? 'checkbox' : 'radio'}-group sds-${multiple ? 'checkbox' : 'radio'}-group--vertical`}
        data-comp={chips ? 'group-tag' : multiple ? 'checkbox' : 'radio'}
      >
        {options.map((option) => {
          const checked = selected.includes(option.value);
          if (chips) {
            return (
              <button
                type="button"
                className={`sds-status-tag sds-status-tag--md ${checked ? 'sds-status-tag--green' : 'sds-status-tag--gray'}`}
                aria-pressed={checked}
                key={option.value}
                onClick={() => toggle(option.value)}
              >
                <span className="sds-status-tag-text">{resolvedText(option.label)}</span>
              </button>
            );
          }
          return (
            <label className={`sds-${multiple ? 'checkbox' : 'radio'}-item ${checked ? 'sds-is-checked' : ''}`} key={option.value}>
              <input
                className={`sds-${multiple ? 'checkbox' : 'radio'}-native-input`}
                type={multiple ? 'checkbox' : 'radio'}
                name={multiple ? undefined : groupName}
                checked={checked}
                onChange={() => toggle(option.value)}
              />
              <span className={`sds-${multiple ? 'checkbox' : 'radio'}-label`}>
                {resolvedText(option.label)}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
});

const CadenzaSlider = createComponentImplementation(SliderApi, ({props}) => (
  <label className="sds-slider-wrap" data-comp="slider">
    {props.label ? <span className="sds-form-item-label">{props.label}</span> : null}
    <div className="sds-slider-main">
      <input
        className="sds-slider-native-input"
        type="range"
        min={props.min ?? 0}
        max={props.max}
        value={props.value}
        onChange={(event) => props.setValue?.(Number(event.target.value))}
      />
      <output className="sds-slider-value">{props.value}</output>
    </div>
  </label>
));

const CadenzaDateTimeInput = createComponentImplementation(DateTimeInputApi, ({props}) => {
  const {date, time} = splitDateTime(props.value);
  const enableDate = props.enableDate ?? false;
  const enableTime = props.enableTime ?? false;
  const min = splitDateTime(props.min ?? '');
  const max = splitDateTime(props.max ?? '');
  const updateDate = (nextDate: string) => {
    props.setValue?.(enableTime ? `${nextDate}T${time || '00:00'}:00` : nextDate);
  };
  const updateTime = (nextTime: string) => {
    props.setValue?.(enableDate ? `${date || new Date().toISOString().slice(0, 10)}T${nextTime}:00` : nextTime);
  };

  return (
    <label className="sds-date-range-picker sds-date-range-picker--range" data-comp="date-range-picker">
      {props.label ? <span className="sds-form-item-label">{props.label}</span> : null}
      <span className="sds-date-range-picker-inputs">
        {enableDate ? (
          <input
            className="sds-date-range-picker-input"
            type="date"
            value={date}
            min={min.date || undefined}
            max={max.date || undefined}
            onChange={(event) => updateDate(event.target.value)}
          />
        ) : null}
        {enableTime ? (
          <input
            className="sds-date-range-picker-input"
            type="time"
            value={time}
            min={min.time || undefined}
            max={max.time || undefined}
            onChange={(event) => updateTime(event.target.value)}
          />
        ) : null}
      </span>
    </label>
  );
});

const cadenzaImplementations = new Map<string, ReactCatalogComponent>([
  [TextApi.name, CadenzaText],
  [ImageApi.name, CadenzaImage],
  [IconApi.name, CadenzaIcon],
  [VideoApi.name, CadenzaVideo],
  [AudioPlayerApi.name, CadenzaAudioPlayer],
  [RowApi.name, CadenzaRow],
  [ColumnApi.name, CadenzaColumn],
  [ListApi.name, CadenzaList],
  [CardApi.name, CadenzaCard],
  [TabsApi.name, CadenzaTabs],
  [ModalApi.name, CadenzaModal],
  [DividerApi.name, CadenzaDivider],
  [ButtonApi.name, CadenzaButton],
  [TextFieldApi.name, CadenzaTextField],
  [CheckBoxApi.name, CadenzaCheckBox],
  [ChoicePickerApi.name, CadenzaChoicePicker],
  [SliderApi.name, CadenzaSlider],
  [DateTimeInputApi.name, CadenzaDateTimeInput],
]);

const components = Array.from(cadenzaImplementations.values());
const allComponents = [...components, ...CADENZA_CUSTOM_IMPLEMENTATIONS.values()];

/**
 * A2UI Basic Catalog v0.9 plus the Cadenza custom component contract.
 * Every renderer emits markup published by docs/design-system/composer/index.html.
 */
export const cadenzaBasicCatalog = new Catalog<ReactCatalogComponent>(
  CADENZA_CUSTOM_CATALOG_ID,
  basicCatalog.protocolVersion,
  allComponents,
  Array.from(basicCatalog.functions.values()),
  basicCatalog.themeSchema,
  basicCatalog.instructions,
);

export const COMPOSER_ALLOWED_A2UI_COMPONENTS = Object.freeze([
  TextApi.name,
  ImageApi.name,
  IconApi.name,
  VideoApi.name,
  AudioPlayerApi.name,
  RowApi.name,
  ColumnApi.name,
  ListApi.name,
  CardApi.name,
  TabsApi.name,
  ModalApi.name,
  DividerApi.name,
  ButtonApi.name,
  TextFieldApi.name,
  CheckBoxApi.name,
  ChoicePickerApi.name,
  SliderApi.name,
  DateTimeInputApi.name,
  ...CADENZA_CUSTOM_COMPONENT_NAMES,
]);

export const COMPOSER_RENDERED_COMPONENTS = Object.freeze([
  'basic-title',
  'basic-ellipsis-text',
  'card',
  'base-button',
  'base-flex',
  'base-modal-layout',
  'basic-info-list',
  'checkbox',
  'date-range-picker',
  'divider',
  'group-tag',
  'icon',
  'input',
  'radio',
  'slider',
  'tab-list',
  'textarea',
  ...CADENZA_CUSTOM_DATA_COMPS,
]);

export const COMPOSER_RENDERER_FOR_COMPONENT = Object.freeze({
  Text: 'basic-title 또는 basic-ellipsis-text',
  Image: 'card(media image)',
  Icon: 'icon',
  Video: 'card(media video)',
  AudioPlayer: 'card(media audio)',
  Row: 'base-flex(horizontal)',
  Column: 'base-flex(vertical)',
  List: 'basic-info-list',
  Card: 'card',
  Tabs: 'tab-list',
  Modal: 'base-modal-layout',
  Divider: 'divider',
  Button: 'base-button',
  TextField: 'input 또는 textarea',
  CheckBox: 'checkbox',
  ChoicePicker: 'checkbox, radio 또는 group-tag',
  Slider: 'slider',
  DateTimeInput: 'date-range-picker',
  ...CADENZA_CUSTOM_RENDERER_FOR_COMPONENT,
} as const);
