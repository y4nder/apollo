export type SSEEmit = (event: string, data: unknown) => Promise<void>;

export interface SSEHandle {
  emit: SSEEmit;
  close: () => Promise<void>;
  stream: ReadableStream<Uint8Array>;
}

export function createSSE(): SSEHandle {
  const encoder = new TextEncoder();
  const stream = new TransformStream<Uint8Array, Uint8Array>();
  const writer = stream.writable.getWriter();
  let closed = false;

  const emit: SSEEmit = async (event, data) => {
    if (closed) return;
    try {
      await writer.write(
        encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
      );
    } catch {
      closed = true;
    }
  };

  const close = async () => {
    if (closed) return;
    closed = true;
    try {
      await writer.close();
    } catch {
      // already closed
    }
  };

  return { emit, close, stream: stream.readable };
}

export const sseHeaders = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
  "X-Accel-Buffering": "no",
};
