import { api } from "./api";

export type RecurringRule = "daily" | "weekly" | "monthly" | "yearly" | null;

export interface CalendarEventDTO {
  _id: string;
  userId: string;
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  allDay: boolean;
  color: string | null;
  meetingCode: string | null;
  reminderMinutes: number[];
  isRecurring: boolean;
  recurringRule: RecurringRule;
  createdAt: string;
  updatedAt: string;
}

export async function fetchEvents(params?: { start?: string; end?: string }): Promise<CalendarEventDTO[]> {
  const { data } = await api.get("/calendar", { params });
  return data;
}

export async function fetchEvent(eventId: string): Promise<CalendarEventDTO> {
  const { data } = await api.get(`/calendar/${eventId}`);
  return data;
}

export async function createEvent(payload: {
  title?: string;
  description?: string;
  startAt: string;
  endAt: string;
  allDay?: boolean;
  color?: string | null;
  meetingCode?: string | null;
  reminderMinutes?: number[];
  isRecurring?: boolean;
  recurringRule?: RecurringRule;
}): Promise<CalendarEventDTO> {
  const { data } = await api.post("/calendar", payload);
  return data;
}

export async function updateEvent(eventId: string, payload: Partial<Pick<CalendarEventDTO, "title" | "description" | "startAt" | "endAt" | "allDay" | "color" | "meetingCode" | "reminderMinutes" | "isRecurring" | "recurringRule">>): Promise<CalendarEventDTO> {
  const { data } = await api.put(`/calendar/${eventId}`, payload);
  return data;
}

export async function deleteEvent(eventId: string): Promise<void> {
  await api.delete(`/calendar/${eventId}`);
}
