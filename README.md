# A2UI Web Renderer

FastAPI Agent가 스트리밍한 A2UI v0.9 메시지를 처리하고, 선택된 Catalog의 React 컴포넌트로 실제 UI를 렌더링하는 클라이언트 애플리케이션입니다.

## 주요 기능

- `@a2ui/web_core` MessageProcessor 기반 A2UI 메시지 처리
- `@a2ui/react` 기반 Surface 렌더링
- Custom Catalog와 A2UI Basic Catalog 전환
- Mock, Gemini API, Local Codex Provider 선택
- SSE 기반 실시간 UI 생성
- 버튼 액션의 Agent 재전송과 Data Model 갱신
- 동일 요청의 HTML 및 A2UI 메시지 브라우저 캐시
- 요청 기록과 구간별 처리 시간 팝업
- LLM 요청·응답 및 Client Catalog 매핑 Generation Trace
- 저장된 HTML 복원 전 DOMPurify 정화

## 처리 흐름

```text
사용자 Query
    ↓
React Client
    ↓ POST /api/v1/a2ui/stream
FastAPI Agent
    ↓ SSE
generation_context → timing → A2UI messages → done
    ↓
MessageProcessor
    ↓
선택된 Catalog에서 컴포넌트 조회
    ↓
A2uiSurface → React DOM
```

## 기술 스택

- React 19
- TypeScript 5.9
- Vite 7
- `@a2ui/react` 0.14.0
- `@a2ui/web_core` 0.14.0
- DOMPurify
- Vitest, Testing Library

## 실행 방법

### 1. 요구사항

- Node.js 18 이상
- npm
- `http://127.0.0.1:8000`에서 실행 중인 A2UI Agent

### 2. 설치

```bash
npm install
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://127.0.0.1:5173`을 엽니다. Vite는 `/api` 요청을 `http://127.0.0.1:8000`으로 프록시합니다.

## 생성 옵션

### 생성 모드

| 모드 | 설명 |
|---|---|
| Mock | API 키 없이 고정 A2UI 메시지로 전체 렌더링 흐름 테스트 |
| LLM | Gemini API 또는 Local Codex로 A2UI 메시지 생성 |

### Catalog

| Catalog | 설명 |
|---|---|
| Custom | 표준 18개와 Composer 전용 47개를 합친 65개 A2UI 타입으로 64개 `data-comp` 계약을 렌더링 |
| Basic | A2UI 공식 Basic Catalog와 기본 React Renderer 사용 |

## Cadenza 컴포넌트 매핑

| A2UI 컴포넌트 | 렌더링 형태 |
|---|---|
| `Text` | `basic-title` 또는 `basic-ellipsis-text` |
| `Image` | `card` 기반 이미지 표면 |
| `Icon` | `icon` |
| `Video`, `AudioPlayer` | `card` 기반 미디어 표면 |
| `Row`, `Column` | `base-flex` |
| `List` | `basic-info-list` |
| `Card` | `card` |
| `Tabs` | `tab-list` |
| `Modal` | `base-modal-layout` |
| `Divider` | `divider` |
| `Button` | `base-button` |
| `TextField` | `input` 또는 `textarea` |
| `CheckBox` | `checkbox` |
| `ChoicePicker` | `checkbox`, `radio` 또는 `group-tag` |
| `Slider` | `slider` |
| `DateTimeInput` | `date-range-picker` |

클라이언트 Renderer에 등록되지 않은 컴포넌트는 실행 가능한 코드로 변환하지 않습니다.

### Custom A2UI Catalog

Cadenza 프로필은 공식 Basic Catalog를 그대로 포함하고 다음 Composer 전용 타입을 추가합니다.

| 역할 | Custom A2UI 타입 |
|---|---|
| 레이아웃 | `Layout`, `Content`, `ControlBar`, `CreateLayout`, `DashboardLayout`, `DetailLayout`, `Filter`, `Form`, `FormItem`, `FormLayout`, `ListLayout`, `Sider` |
| 오버레이 | `Drawer`, `Tooltip`, `ConfirmModal`, `Dropdown`, `Popover`, `SidePanel` |
| 데이터·시각화 | `AddTable`, `Table`, `Chart`, `MiniLineChart`, `ChartLegend`, `Tree`, `CodeView` |
| 입력·탐색 | `Uploader`, `InputNumber`, `ListBox`, `Pagination`, `Segmented`, `Select`, `Switch` |
| 상태·피드백 | `Accordion`, `Alert`, `CopyButton`, `FilterButton`, `Loader`, `NoData`, `Progress`, `Skeleton`, `Spinner`, `StatusHeader`, `StatusTag`, `Step`, `SideStep`, `StepIndicator`, `Toast` |

`cadenzaCustomCatalog.tsx`의 Catalog 문서는 각 타입의 필수 속성, 선택값, 자식 컴포넌트 참조와 Action을 JSON Schema로 정의합니다. `Catalog.fromJson()`이 이 문서를 런타임 스키마로 변환하고, 등록된 React Renderer만 실제 DOM을 생성합니다.

## Generation Trace

Response 하단에서 다음 처리 내용을 순서대로 확인할 수 있습니다.

1. 유저 쿼리와 Client → Agent 연결 시간
2. A2UI SDK가 Catalog와 쿼리를 결합해 실제 LLM으로 전달한 내용과 구성 시간
3. LLM의 파싱 전 원문 응답과 응답 대기 시간
4. 클라이언트가 Catalog를 참조한 내역과 Renderer 매핑 형태

네 번째 단계는 다음 정보를 제공합니다.

- Catalog 프로필, ID, 프로토콜 버전
- 등록된 컴포넌트 수와 수신 메시지 수
- Surface ID와 컴포넌트 ID
- LLM이 요청한 컴포넌트 타입
- Catalog 등록 여부
- 실제 Renderer 형태
- 컴포넌트 속성 구조

## 요청 기록과 캐시

- 정상 렌더링된 요청을 `localStorage`에 최대 20개 저장합니다.
- Catalog, 생성 모드, Provider, 정규화된 쿼리로 캐시 키를 만듭니다.
- 렌더링 HTML, 검증된 A2UI 메시지, Generation Trace와 처리 시간을 함께 저장합니다.
- 같은 요청은 Agent를 다시 호출하지 않고 HTML을 먼저 표시한 뒤 메시지를 재생합니다.
- 캐시된 HTML은 DOMPurify로 정화한 후 화면에 표시합니다.

## 프로젝트 구조

```text
src/
├── a2ui/
│   ├── a2uiCache.ts             # 요청 및 HTML 캐시
│   ├── cadenzaBasicCatalog.tsx  # 표준 18개 Cadenza Renderer
│   ├── cadenzaCustomCatalog.tsx # Custom 47개 JSON Schema와 Renderer
│   ├── catalogTrace.ts          # Catalog 참조 내역 분석
│   └── cadenza-basic.css        # Cadenza 스타일
├── api/
│   └── a2uiClient.ts            # Agent API와 SSE 처리
├── App.tsx                      # 화면 및 렌더링 흐름
├── main.tsx
└── styles.css
```

## 검증 및 빌드

```bash
npm run typecheck
npm run test
npm run build
```

## 보안 원칙

- Agent가 생성한 임의 HTML과 JavaScript를 실행하지 않습니다.
- 사전에 등록된 Catalog 컴포넌트만 React Renderer로 변환합니다.
- 캐시된 HTML은 DOMPurify로 정화합니다.
- API 키는 브라우저에 저장하거나 전달하지 않습니다.

