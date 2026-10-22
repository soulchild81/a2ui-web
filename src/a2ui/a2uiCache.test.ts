import {beforeEach, describe, expect, it} from 'vitest';
import {
  createCacheKey,
  findCacheEntry,
  loadCacheEntries,
  markCacheHit,
  normalizeQuery,
  putCacheEntry,
  saveCacheEntries,
} from './a2uiCache';

describe('a2uiCache', () => {
  beforeEach(() => window.localStorage.clear());

  const timings = {
    clientToAgentMs: 10,
    agentGenerationMs: 20,
    sseTransferMs: 5,
    clientRenderMs: 3,
    totalMs: 38,
  };

  it('normalizes whitespace and case for duplicate query detection', () => {
    expect(normalizeQuery('  Spring   BOOT 추천  ')).toBe('spring boot 추천');
    expect(createCacheKey('같은 질문', 'llm', 'api', 'cadenza'))
      .not.toBe(createCacheKey('같은 질문', 'llm', 'api', 'basic'));
  });

  it('stores HTML and messages and retrieves the same query', () => {
    const entries = putCacheEntry([], {
      query: '상품 추천',
      mode: 'mock',
      llmProvider: null,
      catalogProfile: 'cadenza',
      timings,
      generationContext: {
        user_query: '상품 추천',
        llm_request_content: 'mock request',
        llm_response_content: 'mock response',
        provider: 'Mock Generator',
        sdk_generation_ms: 0.1,
        llm_response_ms: 1.2,
      },
      messages: [],
      renderedHtml: '<section>추천 결과</section>',
    });
    saveCacheEntries(entries);

    const restored = findCacheEntry(
      loadCacheEntries(),
      '  상품   추천 ',
      'mock',
      null,
      'cadenza',
    );
    expect(restored?.renderedHtml).toContain('추천 결과');
    expect(restored?.messages).toEqual([]);
    expect(restored?.generationContext?.user_query).toBe('상품 추천');
  });

  it('moves a cache hit to the front and increments its hit count', () => {
    const entries = putCacheEntry([], {
      query: '상품 추천',
      mode: 'mock',
      llmProvider: null,
      catalogProfile: 'cadenza',
      timings,
      messages: [],
      renderedHtml: '<section />',
    });

    const updated = markCacheHit(entries, entries[0].key);
    expect(updated[0].hitCount).toBe(1);
  });
});
