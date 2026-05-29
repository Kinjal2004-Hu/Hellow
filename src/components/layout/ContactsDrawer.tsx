import { useState } from "react";
import { Search, UserPlus, User, Circle } from "lucide-react";
import { useUIStore } from "@/store/useUIStore";
import { useChatStore } from "@/store/useChatStore";

const dummyContacts = [
  { id: "1", name: "Alice Chen", online: true, lastSeen: "Just now" },
  { id: "2", name: "Bob Martinez", online: true, lastSeen: "2m ago" },
  { id: "3", name: "Carol Smith", online: false, lastSeen: "1h ago" },
  { id: "4", name: "David Kim", online: false, lastSeen: "3h ago" },
  { id: "5", name: "Eve Johnson", online: true, lastSeen: "5m ago" },
  { id: "6", name: "Frank Wilson", online: false, lastSeen: "Yesterday" },
];

export function ContactsDrawer() {
  const [query, setQuery] = useState("");
  const openModal = useUIStore((s) => s.openModal);
  const setActiveRoom = useChatStore((s) => s.setActiveRoom);
  const rooms = useChatStore((s) => s.rooms);

  const filtered = query
    ? dummyContacts.filter((c) =>
        c.name.toLowerCase().includes(query.toLowerCase()),
      )
    : dummyContacts;

  const handleContactClick = (contactId: string) => {
    const dmRoom = rooms.find(
      (r) => r.kind === "dm" && r.name.toLowerCase().includes(contactId),
    );
    if (dmRoom) {
      setActiveRoom(dmRoom._id);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2 rounded-xl bg-background border border-border/50 px-3 h-10 transition-shadow duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] focus-within:ring-2 focus-within:ring-ring/30">
        <Search className="h-4 w-4 text-muted-foreground/70 shrink-0" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search contacts..."
          className="bg-transparent outline-none flex-1 text-[13px] placeholder:text-muted-foreground/55"
        />
      </div>

      <button
        onClick={() => openModal("newContact")}
        className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-xl bg-primary text-primary-foreground text-[13px] font-medium transition duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.97] hover:opacity-90"
      >
        <UserPlus className="h-[16px] w-[16px]" />
        Add Contact
      </button>

      <div className="space-y-1">
        <span className="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground uppercase px-1">
          Recent Contacts
        </span>
        {filtered.length === 0 ? (
          <p className="text-[13px] text-muted-foreground/50 italic px-1">
            No contacts found
          </p>
        ) : (
          filtered.map((contact) => (
            <button
              key={contact.id}
              onClick={() => handleContactClick(contact.id)}
              className="w-full flex items-center gap-3 px-3 h-12 rounded-xl hover:bg-accent/60 transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] group text-left"
            >
              <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0 relative">
                <User className="h-4 w-4 text-muted-foreground" />
                {contact.online && (
                  <span className="absolute -bottom-0.5 -right-0.5">
                    <Circle className="h-3 w-3 fill-green-500 text-green-500" />
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium truncate">
                    {contact.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                    {contact.lastSeen}
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground/60">
                  {contact.online ? "Online" : "Offline"}
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
