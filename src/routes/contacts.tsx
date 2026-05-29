import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Plus, Search } from "lucide-react";

function ContactsPage() {
  const navigate = useNavigate();

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-6 py-6 border-b border-border bg-surface">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate({ to: "/" })}
              className="h-9 w-9 rounded-full grid place-items-center hover:bg-accent transition"
              title="Go home"
              aria-label="Go home"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-3xl font-semibold leading-tight">Contacts</h1>
              <p className="text-sm text-muted-foreground mt-1">Your people, calls, and favorites - all in one place.</p>
            </div>
          </div>

          <button className="h-11 px-5 rounded-full bg-primary text-primary-foreground text-sm font-medium inline-flex items-center gap-2 hover:opacity-90 transition">
            <Plus className="h-4 w-4" />
            New contact
          </button>
        </div>
      </div>

      <div className="px-6 py-6 space-y-4">
        <div className="flex items-center gap-2">
          <button className="h-8 px-4 rounded-full bg-background border border-border text-sm font-medium">All contacts</button>
          <button className="h-8 px-4 rounded-full bg-muted/70 text-sm text-muted-foreground">Call logs</button>
          <button className="h-8 px-4 rounded-full bg-muted/70 text-sm text-muted-foreground">Favorites</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5 min-h-[520px]">
          <aside className="rounded-2xl border border-border bg-surface p-3 flex flex-col">
            <div className="h-10 rounded-xl border border-border bg-background px-3 flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input placeholder="Search contacts..." className="w-full bg-transparent outline-none text-sm" />
            </div>

            <div className="flex-1 grid place-items-center text-center text-muted-foreground/70">
              <p>No contacts.</p>
            </div>
          </aside>

          <section className="rounded-2xl border border-border bg-surface p-6">
            <div className="flex items-start justify-between mb-5">
              <h2 className="text-2xl font-semibold">New contact</h2>
              <button className="h-8 w-8 rounded-full grid place-items-center text-muted-foreground hover:bg-accent transition" aria-label="Close form" title="Close form">x</button>
            </div>

            <div className="space-y-4 max-w-3xl">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Name *</label>
                <input placeholder="Full name" className="w-full h-11 rounded-xl border border-border bg-background px-4 text-sm outline-none" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Phone (optional)</label>
                  <input placeholder="+1 555 555 0100" className="w-full h-11 rounded-xl border border-border bg-background px-4 text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Email (optional)</label>
                  <input placeholder="name@example.com" className="w-full h-11 rounded-xl border border-border bg-background px-4 text-sm outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Notes (optional)</label>
                <textarea placeholder="Where you met, kid's names, anything..." className="w-full h-28 rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none resize-none" />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/contacts")({
  component: ContactsPage,
});
