import { useState } from "react";
import { ArrowLeft, Plus, Search, X, User } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "./Layout";

const btn = "transition duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.97]";

type Tab = "all" | "calls" | "favorites";

interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
}

export function ContactsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewContact, setShowNewContact] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);

  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newNotes, setNewNotes] = useState("");

  const filteredContacts = searchQuery
    ? contacts.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : contacts;

  const handleCreateContact = () => {
    if (!newName.trim()) return;
    const contact: Contact = {
      id: Date.now().toString(),
      name: newName.trim(),
      phone: newPhone.trim(),
      email: newEmail.trim(),
      notes: newNotes.trim(),
    };
    setContacts([...contacts, contact]);
    setNewName("");
    setNewPhone("");
    setNewEmail("");
    setNewNotes("");
    setShowNewContact(false);
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="h-full overflow-y-auto animate-fade-in">
          {/* Header */}
          <div className="px-6 pt-6 pb-4 flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Link
                to="/"
                className="mt-1 h-8 w-8 grid place-items-center rounded-full text-foreground/60 hover:bg-accent hover:text-foreground transition"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div>
                <h1 className="text-[28px] font-semibold tracking-tight">Contacts</h1>
                <p className="text-[14px] text-muted-foreground mt-0.5">
                  Your people, calls, and favorites — all in one place.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowNewContact(true)}
              className={`inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-primary text-primary-foreground text-[14px] font-medium ${btn} hover:opacity-90`}
            >
              <Plus className="h-4 w-4" />
              New contact
            </button>
          </div>

          {/* Tabs */}
          <div className="px-6 pb-4">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/50 w-fit">
              {([
                { key: "all", label: "All contacts" },
                { key: "calls", label: "Call logs" },
                { key: "favorites", label: "Favorites" },
              ] as const).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    activeTab === key
                      ? "bg-background text-foreground shadow-soft"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-6 flex gap-6">
            {/* Contacts List */}
            <div className="w-[320px] shrink-0 rounded-2xl border border-border bg-surface p-4 min-h-[480px]">
              <div className="flex items-center gap-2 rounded-xl bg-background border border-border/50 px-3 h-10 mb-4">
                <Search className="h-4 w-4 text-muted-foreground/70 shrink-0" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search contacts..."
                  className="bg-transparent outline-none flex-1 text-[13px] placeholder:text-muted-foreground/55"
                />
              </div>

              {filteredContacts.length === 0 ? (
                <div className="flex items-center justify-center h-[400px]">
                  <p className="text-[14px] text-muted-foreground/60">No contacts.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center gap-3 px-3 h-12 rounded-xl hover:bg-accent/60 transition cursor-pointer"
                    >
                      <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[13px] font-medium truncate block">
                          {contact.name}
                        </span>
                        {contact.phone && (
                          <span className="text-[11px] text-muted-foreground/60">
                            {contact.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* New Contact Form */}
            {showNewContact && (
              <div className="flex-1 rounded-2xl border border-border bg-surface p-6 min-h-[480px]">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[20px] font-semibold tracking-tight">New contact</h2>
                  <button
                    onClick={() => setShowNewContact(false)}
                    className="h-8 w-8 grid place-items-center rounded-full text-foreground/60 hover:bg-accent hover:text-foreground transition"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-5 max-w-[560px]">
                  <div>
                    <label className="block text-[13px] font-medium text-foreground mb-2">
                      Name <span className="text-destructive">*</span>
                    </label>
                    <input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Full name"
                      className="w-full h-12 px-4 rounded-xl border border-border bg-background text-[14px] outline-none transition-shadow duration-150 focus:ring-2 focus:ring-ring/30 placeholder:text-muted-foreground/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[13px] font-medium text-foreground mb-2">
                        Phone <span className="text-muted-foreground">(optional)</span>
                      </label>
                      <input
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        placeholder="+1 555 555 0100"
                        className="w-full h-12 px-4 rounded-xl border border-border bg-background text-[14px] outline-none transition-shadow duration-150 focus:ring-2 focus:ring-ring/30 placeholder:text-muted-foreground/50"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-foreground mb-2">
                        Email <span className="text-muted-foreground">(optional)</span>
                      </label>
                      <input
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full h-12 px-4 rounded-xl border border-border bg-background text-[14px] outline-none transition-shadow duration-150 focus:ring-2 focus:ring-ring/30 placeholder:text-muted-foreground/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-foreground mb-2">
                      Notes <span className="text-muted-foreground">(optional)</span>
                    </label>
                    <textarea
                      value={newNotes}
                      onChange={(e) => setNewNotes(e.target.value)}
                      placeholder="Where you met, kid's names, anything..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-[14px] outline-none transition-shadow duration-150 focus:ring-2 focus:ring-ring/30 placeholder:text-muted-foreground/50 resize-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleCreateContact}
                      disabled={!newName.trim()}
                      className={`h-11 px-6 rounded-xl bg-primary text-primary-foreground text-[14px] font-medium ${btn} hover:opacity-90 disabled:opacity-50`}
                    >
                      Save contact
                    </button>
                    <button
                      onClick={() => setShowNewContact(false)}
                      className={`h-11 px-6 rounded-xl bg-background border border-border text-foreground/80 text-[14px] ${btn} hover:bg-accent`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
