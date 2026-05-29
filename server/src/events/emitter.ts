import type { DomainEventType, DomainPayload, DomainEvent, EventHandler, Unsubscribe } from "./types.js";

const handlers = new Map<string, Set<{ handler: EventHandler; label: string | null }>>();

let correlationCounter = 0;

function nextCorrelationId(): string {
  return `evt-${Date.now()}-${++correlationCounter}`;
}

export async function emit<E extends DomainEventType>(
  type: E,
  payload: DomainPayload<E>,
  correlationId?: string | null,
): Promise<void> {
  const event: DomainEvent<E> = {
    type,
    payload,
    timestamp: new Date(),
    correlationId: correlationId ?? nextCorrelationId(),
  };

  const set = handlers.get(type as string);
  if (!set || set.size === 0) return;

  const results: Promise<void>[] = [];

  for (const { handler, label } of set) {
    try {
      const result = handler(payload as any, event as any);
      if (result instanceof Promise) results.push(result);
    } catch (err) {
      console.error(`[Event] Handler "${label ?? "anonymous"}" failed for ${type}:`, err);
    }
  }

  await Promise.allSettled(results);
}

export function on<E extends DomainEventType>(
  type: E,
  handler: EventHandler<E>,
  label?: string,
): Unsubscribe {
  const key = type as string;
  if (!handlers.has(key)) handlers.set(key, new Set());
  const entry = { handler: handler as EventHandler, label: label ?? null };
  handlers.get(key)!.add(entry);
  return () => {
    handlers.get(key)?.delete(entry);
  };
}

export function off<E extends DomainEventType>(type: E, handler: EventHandler<E>): void {
  const key = type as string;
  handlers.get(key)?.forEach((entry) => {
    if (entry.handler === handler) handlers.get(key)!.delete(entry);
  });
}

export function removeAllListeners(type?: DomainEventType): void {
  if (type) {
    handlers.delete(type as string);
  } else {
    handlers.clear();
  }
}

export function listenerCount(type: DomainEventType): number {
  return handlers.get(type as string)?.size ?? 0;
}

export function registeredEventTypes(): string[] {
  return Array.from(handlers.keys());
}
