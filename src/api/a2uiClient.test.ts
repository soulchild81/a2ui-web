import {describe, expect, it} from 'vitest';
import {consumeSse, type StreamEvent} from './a2uiClient';

describe('consumeSse', () => {
  it('분할된 청크에서도 A2UI 이벤트를 복원한다', async () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode('event: a2ui\ndata: {"version":"v0.9",'));
        controller.enqueue(
          encoder.encode('"createSurface":{"surfaceId":"main","catalogId":"basic"}}\n\n'),
        );
        controller.enqueue(
          encoder.encode('event: timing\ndata: {"agent_generation_ms":12.5}\n\n'),
        );
        controller.enqueue(
          encoder.encode('event: generation_context\ndata: {"user_query":"추천 UI","llm_request_content":"prompt","llm_response_content":"response","provider":"Mock Generator","sdk_generation_ms":0.1,"llm_response_ms":1.2}\n\n'),
        );
        controller.enqueue(encoder.encode('event: done\ndata: {"status":"completed"}\n\n'));
        controller.close();
      },
    });
    const events: StreamEvent[] = [];

    await consumeSse(stream, (event) => events.push(event));

    expect(events).toHaveLength(4);
    expect(events[0].event).toBe('a2ui');
    expect(events[1]).toEqual({event: 'timing', data: {agent_generation_ms: 12.5}});
    expect(events[2].event).toBe('generation_context');
    expect(events[3]).toEqual({event: 'done', data: {status: 'completed'}});
  });
});

