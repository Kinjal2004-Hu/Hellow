import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as calendarService from "@/services/calendar";
import { useUIStore } from "@/store/useUIStore";

export function useEventsQuery(params?: { start?: string; end?: string }) {
  return useQuery({
    queryKey: ["calendar", params],
    queryFn: () => calendarService.fetchEvents(params),
    staleTime: 30_000,
  });
}

export function useEventQuery(eventId: string | null) {
  return useQuery({
    queryKey: ["calendar", "detail", eventId],
    queryFn: () => calendarService.fetchEvent(eventId!),
    enabled: !!eventId,
  });
}

export function useCreateEventMutation() {
  const queryClient = useQueryClient();
  const showToast = useUIStore((s) => s.showToast);

  return useMutation({
    mutationFn: calendarService.createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      showToast("Event created", "success");
    },
    onError: () => showToast("Failed to create event", "error"),
  });
}

export function useUpdateEventMutation() {
  const queryClient = useQueryClient();
  const showToast = useUIStore((s) => s.showToast);

  return useMutation({
    mutationFn: ({ eventId, ...payload }: { eventId: string } & Parameters<typeof calendarService.updateEvent>[1]) =>
      calendarService.updateEvent(eventId, payload),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      queryClient.invalidateQueries({ queryKey: ["calendar", "detail", vars.eventId] });
      showToast("Event updated", "success");
    },
    onError: () => showToast("Failed to update event", "error"),
  });
}

export function useDeleteEventMutation() {
  const queryClient = useQueryClient();
  const showToast = useUIStore((s) => s.showToast);

  return useMutation({
    mutationFn: calendarService.deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      showToast("Event deleted", "success");
    },
    onError: () => showToast("Failed to delete event", "error"),
  });
}
