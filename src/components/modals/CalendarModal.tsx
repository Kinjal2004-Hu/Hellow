import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2, Clock } from "lucide-react";
import { HellowModal } from "@/components/HellowModal";
import { useUIStore } from "@/store/useUIStore";
import { useEventsQuery, useCreateEventMutation, useDeleteEventMutation } from "@/hooks/useCalendarMutations";
import type { CalendarEventDTO } from "@/services/calendar";
import { cn } from "@/lib/utils";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarModal() {
  const open = useUIStore((s) => s.modals.calendar);
  const closeModal = useUIStore((s) => s.closeModal);
  const [cursor, setCursor] = useState(() => new Date());
  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formStart, setFormStart] = useState("");
  const [formEnd, setFormEnd] = useState("");

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const rangeStart = useMemo(() => {
    const d = new Date(year, month, 1);
    d.setDate(d.getDate() - d.getDay());
    return d.toISOString();
  }, [year, month]);

  const rangeEnd = useMemo(() => {
    const d = new Date(year, month + 1, 0);
    d.setDate(d.getDate() + (6 - d.getDay()));
    d.setHours(23, 59, 59, 999);
    return d.toISOString();
  }, [year, month]);

  const { data: events = [] } = useEventsQuery({ start: rangeStart, end: rangeEnd });
  const createEvent = useCreateEventMutation();
  const deleteEvent = useDeleteEventMutation();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDow = new Date(year, month, 1).getDay();
  const todayStr = new Date().toDateString();

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  const eventsByDate: Record<string, CalendarEventDTO[]> = {};
  for (const ev of events) {
    const key = new Date(ev.startAt).toDateString();
    if (!eventsByDate[key]) eventsByDate[key] = [];
    eventsByDate[key].push(ev);
  }

  function prevMonth() { setCursor(new Date(year, month - 1, 1)); }
  function nextMonth() { setCursor(new Date(year, month + 1, 1)); }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!formTitle.trim() || !formStart || !formEnd) return;
    createEvent.mutate({
      title: formTitle.trim(),
      startAt: new Date(formStart).toISOString(),
      endAt: new Date(formEnd).toISOString(),
    });
    setFormTitle("");
    setFormStart("");
    setFormEnd("");
    setShowForm(false);
  }

  return (
    <HellowModal open={open} onClose={() => closeModal("calendar")} title="Calendar" maxWidth="max-w-[800px]">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="h-8 w-8 grid place-items-center rounded-full hover:bg-accent transition">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-base font-semibold">{MONTHS[month]} {year}</span>
            <button onClick={nextMonth} className="h-8 w-8 grid place-items-center rounded-full hover:bg-accent transition">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 h-8 px-3 rounded-full bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition"
          >
            <Plus className="h-3.5 w-3.5" /> Event
          </button>
        </div>

        {/* Create form */}
        {showForm && (
          <form onSubmit={handleCreate} className="flex flex-col gap-2 p-3 rounded-xl bg-surface border border-border">
            <input
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Event title"
              className="h-9 rounded-lg border border-border bg-background px-3 text-sm outline-none"
              autoFocus
            />
            <div className="flex items-center gap-2">
              <input
                type="datetime-local"
                value={formStart}
                onChange={(e) => setFormStart(e.target.value)}
                className="flex-1 h-9 rounded-lg border border-border bg-background px-3 text-xs outline-none"
              />
              <span className="text-xs text-foreground/40">to</span>
              <input
                type="datetime-local"
                value={formEnd}
                onChange={(e) => setFormEnd(e.target.value)}
                className="flex-1 h-9 rounded-lg border border-border bg-background px-3 text-xs outline-none"
              />
            </div>
            <button
              type="submit"
              className="self-end h-8 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition"
            >
              Create
            </button>
          </form>
        )}

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-px bg-border/40 rounded-xl overflow-hidden">
          {DAYS.map((d) => (
            <div key={d} className="bg-background px-2 py-1.5 text-xs font-medium text-foreground/50 text-center">
              {d}
            </div>
          ))}
          {calendarDays.map((d, i) => {
            const dateStr = d ? new Date(year, month, d).toDateString() : null;
            const dayEvents = dateStr ? eventsByDate[dateStr] || [] : [];
            const isToday = dateStr === todayStr;

            return (
              <div
                key={i}
                className={cn(
                  "bg-background min-h-[70px] px-1.5 py-1 text-xs transition",
                  d ? "hover:bg-accent/30" : "",
                )}
              >
                {d && (
                  <>
                    <span className={cn(
                      "inline-flex h-5 w-5 items-center justify-center rounded-full text-xs",
                      isToday ? "bg-primary text-primary-foreground font-semibold" : "",
                    )}>
                      {d}
                    </span>
                    <div className="mt-0.5 flex flex-col gap-0.5">
                      {dayEvents.slice(0, 3).map((ev) => (
                        <div
                          key={ev._id}
                          className="group flex items-center gap-1 truncate rounded px-1 py-0.5 hover:bg-accent/50 cursor-pointer"
                          style={{ color: ev.color ?? undefined }}
                          title={ev.title}
                        >
                          <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: ev.color ?? "#888" }} />
                          <span className="truncate text-[11px]">{ev.title}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteEvent.mutate(ev._id); }}
                            className="ml-auto opacity-0 group-hover:opacity-100 shrink-0"
                          >
                            <Trash2 className="h-2.5 w-2.5 text-foreground/40" />
                          </button>
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <span className="text-[10px] text-foreground/30 pl-1">+{dayEvents.length - 3} more</span>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </HellowModal>
  );
}
