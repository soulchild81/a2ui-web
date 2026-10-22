import type {ActionPayload, ProcessableMessage} from '@a2ui/web_core/v0_9';

export type GenerationContext = {
  user_query: string;
  llm_request_content: string;
  llm_response_content: string;
  provider: string;
  sdk_generation_ms: number;
  llm_response_ms: number;
};

export type StreamEvent =
  | {event: 'a2ui'; data: ProcessableMessage}
  | {event: 'generation_context'; data: GenerationContext}
  | {event: 'timing'; data: {agent_generation_ms: number}}
  | {event: 'done'; data: {status: string}}
  | {event: 'error'; data: {code: string; message: string}};

type StreamRequest = {
  query: string;
  mode: 'mock' | 'llm';
  llmProvider: 'api' | 'codex_cli' | null;
  catalogProfile: 'cadenza' | 'basic';
  rendererCapabilities: unknown;
};

export async function streamA2ui(
  request: StreamRequest,
  onEvent: (event: StreamEvent) => void,
  onConnected?: () => void,
): Promise<void> {
  const response = await fetch('/api/v1/a2ui/stream', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      query: request.query,
      mode: request.mode,
      llm_provider: request.llmProvider,
      catalog_profile: request.catalogProfile,
      renderer_capabilities: request.rendererCapabilities,
    }),
  });

  if (!response.ok || !response.body) {
    throw new Error(`A2UI 스트림 연결에 실패했습니다. (${response.status})`);
  }

  onConnected?.();
  await consumeSse(response.body, onEvent);
}

export async function postAction(action: ActionPayload): Promise<ProcessableMessage[]> {
  const response = await fetch('/api/v1/a2ui/actions', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(action),
  });

  if (!response.ok) {
    throw new Error(`액션 처리에 실패했습니다. (${response.status})`);
  }

  const body = (await response.json()) as {messages: ProcessableMessage[]};
  return body.messages;
}

export async function consumeSse(
  stream: ReadableStream<Uint8Array>,
  onEvent: (event: StreamEvent) => void,
): Promise<void> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const {done, value} = await reader.read();
    buffer += decoder.decode(value, {stream: !done});
    const blocks = buffer.split('\n\n');
    buffer = blocks.pop() ?? '';

    for (const block of blocks) {
      const parsed = parseSseBlock(block);
      if (parsed) onEvent(parsed);
    }

    if (done) break;
  }

  if (buffer.trim()) {
    const parsed = parseSseBlock(buffer);
    if (parsed) onEvent(parsed);
  }
}

function parseSseBlock(block: string): StreamEvent | null {
  let event = 'message';
  const dataLines: string[] = [];

  for (const rawLine of block.split(/\r?\n/)) {
    if (rawLine.startsWith('event:')) event = rawLine.slice(6).trim();
    if (rawLine.startsWith('data:')) dataLines.push(rawLine.slice(5).trimStart());
  }

  if (
    !dataLines.length
    || !['a2ui', 'generation_context', 'timing', 'done', 'error'].includes(event)
  ) return null;
  return {event, data: JSON.parse(dataLines.join('\n'))} as StreamEvent;
}

