import {FormEvent, useEffect, useMemo, useRef, useState} from 'react';
import {A2uiSurface, type ReactCatalogComponent} from '@a2ui/react/v0_9';
import DOMPurify from 'dompurify';
import {
  MessageProcessor,
  basicCatalog,
  type ActionPayload,
  type ProcessableMessage,
  type SurfaceModel,
} from '@a2ui/web_core/v0_9';
import {
  postAction,
  streamA2ui,
  type GenerationContext,
} from './api/a2uiClient';
import {
  type A2uiCacheEntry,
  type CatalogProfile,
  type GenerationMode,
  type LlmProvider,
  findCacheEntry,
  loadCacheEntries,
  markCacheHit,
  putCacheEntry,
  saveCacheEntries,
} from './a2ui/a2uiCache';
import {cadenzaBasicCatalog} from './a2ui/cadenzaBasicCatalog';
import {buildCatalogReferenceTrace} from './a2ui/catalogTrace';

type RunState = 'idle' | 'streaming' | 'completed' | 'error';

const INITIAL_QUERY = '10만 원 이하 무선 이어폰을 추천해줘';

function roundMilliseconds(value: number): number {
  return Math.round(Math.max(0, value) * 100) / 100;
}

function formatDuration(milliseconds: number): string {
  return milliseconds >= 1_000
    ? `${(milliseconds / 1_000).toFixed(2)} s`
    : `${milliseconds.toFixed(2)} ms`;
}

export function App() {
  const [query, setQuery] = useState(INITIAL_QUERY);
  const [mode, setMode] = useState<GenerationMode>('mock');
  const [llmProvider, setLlmProvider] = useState<LlmProvider>('codex_cli');
  const [catalogProfile, setCatalogProfile] = useState<CatalogProfile>('cadenza');
  const [runState, setRunState] = useState<RunState>('idle');
  const [statusMessage, setStatusMessage] = useState('요청을 입력하고 UI 생성을 실행하세요.');
  const [surfaces, setSurfaces] = useState<SurfaceModel<ReactCatalogComponent>[]>([]);
  const [messageLog, setMessageLog] = useState<ProcessableMessage[]>([]);
  const [generationContext, setGenerationContext] = useState<GenerationContext | null>(null);
  const [queryTransferMs, setQueryTransferMs] = useState<number | null>(null);
  const [clientCatalogRenderMs, setClientCatalogRenderMs] = useState<number | null>(null);
  const [cacheEntries, setCacheEntries] = useState<A2uiCacheEntry[]>(loadCacheEntries);
  const [timingEntry, setTimingEntry] = useState<A2uiCacheEntry | null>(null);
  const [cachedHtmlPreview, setCachedHtmlPreview] = useState<string | null>(null);
  const surfaceStageRef = useRef<HTMLDivElement>(null);

  const processors = useMemo(() => {
    const createProcessor = (catalog: typeof cadenzaBasicCatalog) => {
      const instance = new MessageProcessor<ReactCatalogComponent>(
        [catalog],
        async (action: ActionPayload) => {
          setStatusMessage(`액션 처리 중: ${action.name}`);
          const messages = await postAction(action);
          instance.processMessages(messages);
          setMessageLog((current) => [...current, ...messages]);
          setStatusMessage(`액션 처리 완료: ${action.name}`);
        },
      );
      return instance;
    };

    return {
      cadenza: createProcessor(cadenzaBasicCatalog),
      basic: createProcessor(basicCatalog as unknown as typeof cadenzaBasicCatalog),
    };
  }, []);
  const processor = processors[catalogProfile];

  useEffect(() => () => {
    processors.cadenza.dispose();
    processors.basic.dispose();
  }, [processors]);

  const capabilities = useMemo(
    () => processor.getRendererCapabilities({versions: ['v0.9']}),
    [processor],
  );
  const catalogReferenceTrace = useMemo(
    () => buildCatalogReferenceTrace(
      messageLog,
      catalogProfile === 'cadenza'
        ? cadenzaBasicCatalog
        : basicCatalog as unknown as typeof cadenzaBasicCatalog,
      catalogProfile,
    ),
    [catalogProfile, messageLog],
  );

  function deleteProcessorSurfaces(
    target: MessageProcessor<ReactCatalogComponent>,
  ) {
    target.getSurfaces().forEach((surface) => {
      target.processMessages({
        version: 'v0.9',
        deleteSurface: {surfaceId: surface.id},
      });
    });
  }

  function clearCurrentSurface() {
    deleteProcessorSurfaces(processor);
    setSurfaces([]);
    setMessageLog([]);
    setGenerationContext(null);
    setQueryTransferMs(null);
    setClientCatalogRenderMs(null);
    setCachedHtmlPreview(null);
  }

  function selectCatalogProfile(profile: CatalogProfile) {
    if (profile === catalogProfile) return;
    clearCurrentSurface();
    setCatalogProfile(profile);
    setRunState('idle');
    setStatusMessage(`${profile === 'cadenza' ? 'Cadenza' : 'Basic'} 카탈로그를 선택했습니다.`);
  }

  function restoreFromCache(entry: A2uiCacheEntry) {
    clearCurrentSurface();
    const targetProcessor = processors[entry.catalogProfile];
    if (targetProcessor !== processor) deleteProcessorSurfaces(targetProcessor);
    const sanitizedHtml = DOMPurify.sanitize(entry.renderedHtml, {USE_PROFILES: {html: true}});
    setCachedHtmlPreview(sanitizedHtml);
    targetProcessor.processMessages(entry.messages);
    setSurfaces(Array.from(targetProcessor.getSurfaces().values()));
    setMessageLog(entry.messages);
    setGenerationContext(entry.generationContext ?? null);
    setQueryTransferMs(entry.timings.clientToAgentMs);
    setClientCatalogRenderMs(entry.timings.clientRenderMs);

    setCacheEntries((current) => saveCacheEntries(markCacheHit(current, entry.key)));
    setQuery(entry.query);
    setMode(entry.mode);
    setCatalogProfile(entry.catalogProfile);
    if (entry.llmProvider) setLlmProvider(entry.llmProvider);
    setRunState('completed');
    setStatusMessage(`캐시 사용 완료 · Agent 호출 생략 · ${entry.hitCount + 1}회 재사용`);

    requestAnimationFrame(() => setCachedHtmlPreview(null));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery || runState === 'streaming') return;

    const selectedLlmProvider = mode === 'llm' ? llmProvider : null;
    const cachedEntry = findCacheEntry(
      cacheEntries,
      trimmedQuery,
      mode,
      selectedLlmProvider,
      catalogProfile,
    );
    if (cachedEntry) {
      restoreFromCache(cachedEntry);
      return;
    }

    clearCurrentSurface();
    setRunState('streaming');
    setStatusMessage('에이전트가 카탈로그를 기준으로 A2UI를 생성하고 있습니다.');
    const generatedMessages: ProcessableMessage[] = [];
    let completedSuccessfully = false;
    const requestStartedAt = performance.now();
    let responseConnectedAt = requestStartedAt;
    let firstA2uiMessageAt: number | null = null;
    let streamCompletedAt: number | null = null;
    let agentGenerationMs = 0;
    let receivedGenerationContext: GenerationContext | null = null;

    try {
      await streamA2ui(
        {
          query: trimmedQuery,
          mode,
          llmProvider: selectedLlmProvider,
          catalogProfile,
          rendererCapabilities: capabilities,
        },
        (streamEvent) => {
          if (streamEvent.event === 'generation_context') {
            receivedGenerationContext = streamEvent.data;
            setGenerationContext(streamEvent.data);
          } else if (streamEvent.event === 'timing') {
            agentGenerationMs = streamEvent.data.agent_generation_ms;
          } else if (streamEvent.event === 'a2ui') {
            firstA2uiMessageAt ??= performance.now();
            processor.processMessages(streamEvent.data);
            generatedMessages.push(streamEvent.data);
            setMessageLog((current) => [...current, streamEvent.data]);
            setSurfaces(Array.from(processor.getSurfaces().values()));
          } else if (streamEvent.event === 'done') {
            streamCompletedAt = performance.now();
            completedSuccessfully = true;
            setRunState('completed');
            setStatusMessage('A2UI 메시지 검증과 렌더링이 완료되었습니다.');
          } else {
            setRunState('error');
            setStatusMessage(`${streamEvent.data.code}: ${streamEvent.data.message}`);
          }
        },
        () => {
          responseConnectedAt = performance.now();
          setQueryTransferMs(roundMilliseconds(responseConnectedAt - requestStartedAt));
        },
      );

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const renderedHtml = surfaceStageRef.current?.innerHTML ?? '';
          if (!completedSuccessfully || !renderedHtml || !generatedMessages.length) return;
          const renderCompletedAt = performance.now();
          const firstMessageAt = firstA2uiMessageAt ?? responseConnectedAt;
          const completedAt = streamCompletedAt ?? renderCompletedAt;
          const clientRenderMs = roundMilliseconds(renderCompletedAt - completedAt);
          setClientCatalogRenderMs(clientRenderMs);

          setCacheEntries((current) => saveCacheEntries(putCacheEntry(current, {
            query: trimmedQuery,
            mode,
            llmProvider: selectedLlmProvider,
            catalogProfile,
            timings: {
              clientToAgentMs: roundMilliseconds(responseConnectedAt - requestStartedAt),
              agentGenerationMs: roundMilliseconds(agentGenerationMs),
              sseTransferMs: roundMilliseconds(completedAt - firstMessageAt),
              clientRenderMs,
              totalMs: roundMilliseconds(renderCompletedAt - requestStartedAt),
            },
            generationContext: receivedGenerationContext ?? undefined,
            messages: generatedMessages,
            renderedHtml,
          })));
        });
      });
    } catch (error) {
      setRunState('error');
      setStatusMessage(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    }
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <div>
          <span className="eyebrow">A2UI v0.9 · React Renderer + FastAPI Agent</span>
          <h1>A2UI UI Test</h1>
        </div>
        <div className="flow-chip" aria-label="처리 흐름">
          Query <span>→</span> Agent <span>→</span> A2UI JSON <span>→</span> Renderer
        </div>
      </header>

      <section className="workspace">
        <div className="control-panel">
          <form onSubmit={submit}>
            <label htmlFor="query">요청</label>
            <textarea
              id="query"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              rows={5}
              maxLength={2000}
            />

            <fieldset>
              <legend>생성 모드</legend>
              <label className="radio-option">
                <input
                  type="radio"
                  name="mode"
                  value="mock"
                  checked={mode === 'mock'}
                  onChange={() => setMode('mock')}
                />
                Mock — API 키 없이 즉시 테스트
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="mode"
                  value="llm"
                  checked={mode === 'llm'}
                  onChange={() => setMode('llm')}
                />
                LLM — Gemini API 또는 로컬 Codex 사용
              </label>
            </fieldset>

            {mode === 'llm' ? (
              <fieldset>
                <legend>LLM Provider</legend>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="llm-provider"
                    value="api"
                    checked={llmProvider === 'api'}
                    onChange={() => setLlmProvider('api')}
                  />
                  Gemini API — 환경변수의 API 키와 모델 사용
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="llm-provider"
                    value="codex_cli"
                    checked={llmProvider === 'codex_cli'}
                    onChange={() => setLlmProvider('codex_cli')}
                  />
                  Local Codex — 현재 로그인된 Codex CLI 사용
                </label>
              </fieldset>
            ) : null}

            <button className="generate-button" disabled={runState === 'streaming'}>
              {runState === 'streaming' ? '생성 중…' : 'A2UI 생성'}
            </button>
          </form>

          <div className={`status status-${runState}`} role="status">
            <span className="status-dot" />
            {statusMessage}
          </div>

          <details className="message-log">
            <summary>수신한 A2UI JSON ({messageLog.length})</summary>
            <pre>{JSON.stringify(messageLog, null, 2)}</pre>
          </details>

          <section className="query-history" aria-labelledby="query-history-title">
            <div className="query-history-header">
              <h2 id="query-history-title">요청 기록</h2>
              <span>{cacheEntries.length}개 캐시</span>
            </div>
            {cacheEntries.length ? (
              <ol>
                {cacheEntries.map((entry) => (
                  <li key={entry.key}>
                    <div className="query-history-item">
                      <button
                        type="button"
                        className="query-history-restore"
                        onClick={() => restoreFromCache(entry)}
                      >
                        <span className="query-history-query">{entry.query}</span>
                        <span className="query-history-meta">
                          {entry.mode === 'mock'
                            ? 'MOCK'
                            : entry.llmProvider === 'api' ? 'GEMINI' : 'CODEX'}
                          {' · '}{entry.catalogProfile.toUpperCase()}
                          {' · '}재사용 {entry.hitCount}회
                        </span>
                      </button>
                      <button
                        type="button"
                        className="query-history-time"
                        aria-label={`${entry.query} 처리 시간 보기`}
                        onClick={() => setTimingEntry(entry)}
                      >
                        Time
                      </button>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p>완료된 요청이 이곳에 저장됩니다.</p>
            )}
          </section>
        </div>

        <div className="preview-panel">
          <div className="preview-header">
            <div>
              <span>CLIENT RENDERER</span>
              <h2>Response</h2>
            </div>
            <div className="catalog-toggle" role="group" aria-label="렌더링 카탈로그 선택">
              <button
                type="button"
                className={catalogProfile === 'cadenza' ? 'is-active' : undefined}
                aria-pressed={catalogProfile === 'cadenza'}
                onClick={() => selectCatalogProfile('cadenza')}
              >
                Cadenza
              </button>
              <button
                type="button"
                className={catalogProfile === 'basic' ? 'is-active' : undefined}
                aria-pressed={catalogProfile === 'basic'}
                onClick={() => selectCatalogProfile('basic')}
              >
                Basic
              </button>
            </div>
          </div>

          <div
            id="archive"
            ref={surfaceStageRef}
            className={`surface-stage ${catalogProfile === 'cadenza' ? 'cadenza-a2ui' : 'basic-a2ui'}`}
          >
            {cachedHtmlPreview ? (
              <div
                className="cached-html-preview"
                aria-label="캐시된 렌더링 결과"
                dangerouslySetInnerHTML={{__html: cachedHtmlPreview}}
              />
            ) : surfaces.length ? (
              surfaces.map((surface) => <A2uiSurface key={surface.id} surface={surface} />)
            ) : (
              <div className="empty-state">
                <div className="empty-icon">UI</div>
                <strong>아직 생성된 Surface가 없습니다.</strong>
                <span>A2UI 메시지가 도착하면 이 영역에 안전하게 렌더링됩니다.</span>
              </div>
            )}
          </div>

          {generationContext ? (
            <section className="generation-inspector" aria-labelledby="generation-inspector-title">
              <div className="generation-inspector-header">
                <div>
                  <span>GENERATION TRACE</span>
                  <h3 id="generation-inspector-title">LLM 요청 구성 내용</h3>
                </div>
                <strong>{generationContext.provider}</strong>
              </div>
              <ol className="generation-inspector-list">
                <li>
                  <div className="generation-step-title">
                    <h4>유저 쿼리</h4>
                    <span>{formatDuration(queryTransferMs ?? 0)}</span>
                  </div>
                  <p>Client에서 Agent로 요청이 전달되어 응답 연결이 수립된 시간입니다.</p>
                  <pre>{generationContext.user_query}</pre>
                </li>
                <li>
                  <div className="generation-step-title">
                    <h4>A2UI SDK에서 만들어 실제 LLM으로 전달된 내용</h4>
                    <span>{formatDuration(generationContext.sdk_generation_ms)}</span>
                  </div>
                  <p>Catalog 지침과 유저 쿼리를 결합하여 만든 실제 요청 본문입니다.</p>
                  <pre>{generationContext.llm_request_content}</pre>
                </li>
                <li>
                  <div className="generation-step-title">
                    <h4>LLM의 응답</h4>
                    <span>{formatDuration(generationContext.llm_response_ms)}</span>
                  </div>
                  <p>
                    {generationContext.provider === 'Mock Generator'
                      ? 'Mock 모드에서 직접 생성한 A2UI 응답입니다.'
                      : 'LLM이 반환한 파싱 전 원문 응답입니다.'}
                  </p>
                  <pre>{generationContext.llm_response_content}</pre>
                </li>
                <li>
                  <div className="generation-step-title">
                    <h4>클라이언트가 카탈로그를 참조한 내역 및 형태</h4>
                    <span>{formatDuration(clientCatalogRenderMs ?? 0)}</span>
                  </div>
                  <p>
                    수신한 A2UI 컴포넌트를 선택된 Catalog에서 조회하고 React Renderer에
                    매핑한 결과입니다.
                  </p>
                  <pre>{JSON.stringify(catalogReferenceTrace, null, 2)}</pre>
                </li>
              </ol>
            </section>
          ) : null}
        </div>
      </section>

      {timingEntry ? (
        <div className="timing-modal-backdrop" onClick={() => setTimingEntry(null)}>
          <section
            className="timing-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="timing-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="timing-modal-header">
              <div>
                <span>REQUEST TIMELINE</span>
                <h2 id="timing-modal-title">구간별 처리 시간</h2>
              </div>
              <button
                type="button"
                className="timing-modal-close"
                aria-label="시간 팝업 닫기"
                onClick={() => setTimingEntry(null)}
              >
                ×
              </button>
            </div>
            <p className="timing-modal-query">{timingEntry.query}</p>
            <dl className="timing-list">
              <div>
                <dt>Client → Agent 연결</dt>
                <dd>{formatDuration(timingEntry.timings.clientToAgentMs)}</dd>
              </div>
              <div>
                <dt>Agent 생성 · 검증</dt>
                <dd>{formatDuration(timingEntry.timings.agentGenerationMs)}</dd>
              </div>
              <div>
                <dt>Agent → Client SSE 수신</dt>
                <dd>{formatDuration(timingEntry.timings.sseTransferMs)}</dd>
              </div>
              <div>
                <dt>Client UI 렌더링</dt>
                <dd>{formatDuration(timingEntry.timings.clientRenderMs)}</dd>
              </div>
              <div className="timing-total">
                <dt>전체 소요시간</dt>
                <dd>{formatDuration(timingEntry.timings.totalMs)}</dd>
              </div>
            </dl>
          </section>
        </div>
      ) : null}
    </main>
  );
}

