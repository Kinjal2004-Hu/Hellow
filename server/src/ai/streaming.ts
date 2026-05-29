import { EventEmitter } from "events";
import type { StreamChunk } from "./types.js";

/**
 * Wraps an AsyncIterable<StreamChunk> in a Node EventEmitter so it can
 * be consumed both via async iteration and via event listeners (useful
 * when piping through Socket.IO or SSE).
 */
export class StreamManager extends EventEmitter {
  private _done = false;
  private _buffer: string[] = [];

  get done(): boolean {
    return this._done;
  }

  get accumulated(): string {
    return this._buffer.join("");
  }

  async consume(iterable: AsyncIterable<StreamChunk>): Promise<void> {
    try {
      for await (const chunk of iterable) {
        if (chunk.type === "content" && chunk.content) {
          this._buffer.push(chunk.content);
          this.emit("content", chunk.content);
        } else if (chunk.type === "done") {
          this._done = true;
          this.emit("done", chunk);
        } else if (chunk.type === "error") {
          this._done = true;
          this.emit("error", new Error(chunk.error ?? "Unknown stream error"));
        }
      }
    } catch (err) {
      this._done = true;
      this.emit("error", err);
    }
  }
}

/**
 * Convert an AsyncIterable<StreamChunk> into a ReadableStream for SSE responses.
 */
export function streamToReadable(
  iterable: AsyncIterable<StreamChunk>,
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async pull(controller) {
      try {
        for await (const chunk of iterable) {
          const data = JSON.stringify(chunk);
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });
}

/**
 * Collect all chunks from a stream into a single string (for non-streaming fallback).
 */
export async function collectStream(
  iterable: AsyncIterable<StreamChunk>,
): Promise<string> {
  const parts: string[] = [];
  for await (const chunk of iterable) {
    if (chunk.type === "content" && chunk.content) {
      parts.push(chunk.content);
    }
  }
  return parts.join("");
}
