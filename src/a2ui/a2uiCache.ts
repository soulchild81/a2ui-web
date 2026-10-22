import type {ProcessableMessage} from '@a2ui/web_core/v0_9';
import type {GenerationContext} from '../api/a2uiClient';

const CACHE_STORAGE_KEY = 'a2ui-lab:render-cache:v5';
const MAX_CACHE_ENTRIES = 20;

export type GenerationMode = 'mock' | 'llm';
export type LlmProvider = 'api' | 'codex_cli';
export type CatalogProfile = 'cadenza' | 'basic';

export type GenerationTimings = {
  clientToAgentMs: number;
  agentGenerationMs: number;
  sseTransferMs: number;
  clientRenderMs: number;
  totalMs: number;
};

export type A2uiCacheEntry = {
  key: string;
  query: string;
  mode: GenerationMode;
  llmProvider: LlmProvider | null;
  catalogProfile: CatalogProfile;
  timings: GenerationTimings;
  generationContext?: GenerationContext;
  messages: ProcessableMessage[];
  renderedHtml: string;
  createdAt: string;
  lastUsedAt: string;
  hitCount: number;
};

export function normalizeQuery(query: string): string {
  return query.trim().replace(/\s+/g, ' ').toLocaleLowerCase('ko-KR');
}

export function createCacheKey(
  query: string,
  mode: GenerationMode,
  llmProvider: LlmProvider | null = null,
  catalogProfile: CatalogProfile = 'cadenza',
): string {
  return `${catalogProfile}:${mode}:${llmProvider ?? 'none'}:${normalizeQuery(query)}`;
}

export function loadCacheEntries(storage: Storage = window.localStorage): A2uiCacheEntry[] {
  try {
    const value = storage.getItem(CACHE_STORAGE_KEY);
    if (!value) return [];

    const entries = JSON.parse(value) as unknown;
    if (!Array.isArray(entries)) return [];

    return entries
      .filter(isCacheEntry)
      .map((entry) => ({
        ...entry,
        generationContext: isGenerationContext(entry.generationContext)
          ? entry.generationContext
          : undefined,
      }))
      .slice(0, MAX_CACHE_ENTRIES);
  } catch {
    return [];
  }
}

export function saveCacheEntries(
  entries: A2uiCacheEntry[],
  storage: Storage = window.localStorage,
): A2uiCacheEntry[] {
  const limitedEntries = entries.slice(0, MAX_CACHE_ENTRIES);
  while (limitedEntries.length) {
    try {
      storage.setItem(CACHE_STORAGE_KEY, JSON.stringify(limitedEntries));
      return limitedEntries;
    } catch {
      limitedEntries.pop();
    }
  }
  return [];
}

export function findCacheEntry(
  entries: A2uiCacheEntry[],
  query: string,
  mode: GenerationMode,
  llmProvider: LlmProvider | null,
  catalogProfile: CatalogProfile,
): A2uiCacheEntry | undefined {
  const key = createCacheKey(query, mode, llmProvider, catalogProfile);
  return entries.find((entry) => entry.key === key);
}

export function putCacheEntry(
  entries: A2uiCacheEntry[],
  input: Pick<
    A2uiCacheEntry,
    | 'query'
    | 'mode'
    | 'llmProvider'
    | 'catalogProfile'
    | 'timings'
    | 'generationContext'
    | 'messages'
    | 'renderedHtml'
  >,
): A2uiCacheEntry[] {
  const now = new Date().toISOString();
  const key = createCacheKey(
    input.query,
    input.mode,
    input.llmProvider,
    input.catalogProfile,
  );
  const existing = entries.find((entry) => entry.key === key);
  const nextEntry: A2uiCacheEntry = {
    ...input,
    key,
    createdAt: existing?.createdAt ?? now,
    lastUsedAt: now,
    hitCount: existing?.hitCount ?? 0,
  };

  return [nextEntry, ...entries.filter((entry) => entry.key !== key)]
    .slice(0, MAX_CACHE_ENTRIES);
}

export function markCacheHit(
  entries: A2uiCacheEntry[],
  key: string,
): A2uiCacheEntry[] {
  const matched = entries.find((entry) => entry.key === key);
  if (!matched) return entries;

  const updated: A2uiCacheEntry = {
    ...matched,
    lastUsedAt: new Date().toISOString(),
    hitCount: matched.hitCount + 1,
  };
  return [updated, ...entries.filter((entry) => entry.key !== key)];
}

function isCacheEntry(value: unknown): value is A2uiCacheEntry {
  if (!value || typeof value !== 'object') return false;
  const entry = value as Partial<A2uiCacheEntry>;
  return typeof entry.key === 'string'
    && typeof entry.query === 'string'
    && (entry.mode === 'mock' || entry.mode === 'llm')
    && (entry.llmProvider === null
      || entry.llmProvider === 'api'
      || entry.llmProvider === 'codex_cli')
    && (entry.catalogProfile === 'cadenza' || entry.catalogProfile === 'basic')
    && isGenerationTimings(entry.timings)
    && Array.isArray(entry.messages)
    && typeof entry.renderedHtml === 'string'
    && typeof entry.createdAt === 'string'
    && typeof entry.lastUsedAt === 'string'
    && typeof entry.hitCount === 'number';
}

function isGenerationTimings(value: unknown): value is GenerationTimings {
  if (!value || typeof value !== 'object') return false;
  const timings = value as Partial<GenerationTimings>;
  return typeof timings.clientToAgentMs === 'number'
    && typeof timings.agentGenerationMs === 'number'
    && typeof timings.sseTransferMs === 'number'
    && typeof timings.clientRenderMs === 'number'
    && typeof timings.totalMs === 'number';
}

function isGenerationContext(value: unknown): value is GenerationContext {
  if (!value || typeof value !== 'object') return false;
  const context = value as Partial<GenerationContext>;
  return typeof context.user_query === 'string'
    && typeof context.llm_request_content === 'string'
    && typeof context.llm_response_content === 'string'
    && typeof context.provider === 'string'
    && typeof context.sdk_generation_ms === 'number'
    && typeof context.llm_response_ms === 'number';
}
