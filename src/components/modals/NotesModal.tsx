import { useState } from "react";
import { FileText, FolderPlus, Plus, Trash2, ChevronRight, Archive, Tag, Sparkles, Wand2 } from "lucide-react";
import { HellowModal } from "@/components/HellowModal";
import { useUIStore } from "@/store/useUIStore";
import { useNotesQuery, useNoteFoldersQuery, useCreateNoteMutation, useUpdateNoteMutation, useDeleteNoteMutation, useCreateNoteFolderMutation, useDeleteNoteFolderMutation } from "@/hooks/useNotesMutations";
import { useGenerateNoteContentMutation, useSummarizeMutation } from "@/hooks/useAIChatMutations";
import type { NoteDTO, NoteFolderDTO } from "@/services/notes";

export function NotesModal() {
  const open = useUIStore((s) => s.modals.notes);
  const closeModal = useUIStore((s) => s.closeModal);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const { data: notes = [], isLoading } = useNotesQuery({ archived: showArchived });
  const { data: folders = [] } = useNoteFoldersQuery();
  const createNote = useCreateNoteMutation();
  const updateNote = useUpdateNoteMutation();
  const deleteNote = useDeleteNoteMutation();
  const generateWithAI = useGenerateNoteContentMutation();
  const summarizeWithAI = useSummarizeMutation();
  const createFolder = useCreateNoteFolderMutation();
  const deleteFolder = useDeleteNoteFolderMutation();

  const allTags = [...new Set(notes.flatMap((n) => n.tags))];
  const filteredNotes = filterTag ? notes.filter((n) => n.tags.includes(filterTag)) : notes;

  const selectedNote = notes.find((n) => n._id === selectedId);
  const noteFolders = folders.filter((f) => !f.parentId);

  function selectNote(note: NoteDTO) {
    setSelectedId(note._id);
    setEditTitle(note.title);
    setEditContent(note.content);
  }

  function handleCreate() {
    createNote.mutate({}, {
      onSuccess: (note) => {
        selectNote(note);
      },
    });
  }

  function handleSave() {
    if (!selectedId) return;
    updateNote.mutate({ noteId: selectedId, title: editTitle, content: editContent });
  }

  function handleDelete() {
    if (!selectedId) return;
    deleteNote.mutate(selectedId, { onSuccess: () => setSelectedId(null) });
  }

  return (
    <HellowModal open={open} onClose={() => closeModal("notes")} title="Notes" maxWidth="max-w-[900px]">
      <div className="flex gap-4 h-[65vh]">
        {/* Sidebar */}
        <div className="w-48 shrink-0 flex flex-col gap-2">
          <button onClick={handleCreate} className="flex items-center gap-2 text-sm font-medium text-primary hover:opacity-80 transition">
            <Plus className="h-4 w-4" /> New Note
          </button>
          <button
            onClick={() => { const name = prompt("Folder name:"); if (name) createFolder.mutate({ name }); }}
            className="flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground transition"
          >
            <FolderPlus className="h-4 w-4" /> New Folder
          </button>
          <div className="flex flex-col gap-0.5 mt-2">
            {noteFolders.map((f) => (
              <div key={f._id} className="group flex items-center gap-1">
                <ChevronRight className="h-3 w-3 text-foreground/40" />
                <span className="text-sm truncate flex-1">{f.name}</span>
                <button
                  onClick={() => deleteFolder.mutate(f._id)}
                  className="opacity-0 group-hover:opacity-100 h-5 w-5 grid place-items-center rounded hover:bg-accent transition"
                >
                  <Trash2 className="h-3 w-3 text-foreground/40" />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-auto border-t pt-2">
            <button
              onClick={() => setShowArchived(!showArchived)}
              className="flex items-center gap-2 text-xs text-foreground/50 hover:text-foreground transition"
            >
              <Archive className="h-3.5 w-3.5" /> {showArchived ? "Active" : "Archived"}
            </button>
          </div>
        </div>

        {/* Note list */}
        <div className="w-56 shrink-0 flex flex-col gap-1 overflow-y-auto border-r pr-3">
          {isLoading && <p className="text-xs text-foreground/40">Loading...</p>}
          {filteredNotes.map((note) => (
            <button
              key={note._id}
              onClick={() => selectNote(note)}
              className={`text-left px-2.5 py-2 rounded-lg text-sm transition ${
                selectedId === note._id ? "bg-accent" : "hover:bg-accent/50"
              }`}
            >
              <div className="font-medium truncate">{note.title}</div>
              <div className="text-xs text-foreground/40 truncate mt-0.5">{note.content.slice(0, 60)}</div>
            </button>
          ))}
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col gap-3">
          {selectedNote ? (
            <>
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={handleSave}
                className="text-lg font-semibold bg-transparent outline-none border-b border-border pb-2"
              />
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onBlur={handleSave}
                className="flex-1 resize-none bg-transparent outline-none text-sm leading-relaxed"
                placeholder="Start writing..."
              />
              <div className="flex items-center gap-2 text-xs text-foreground/50">
                {selectedNote.tags.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1 bg-accent/50 px-2 py-0.5 rounded-full">
                    <Tag className="h-3 w-3" />{t}
                  </span>
                ))}
                <button
                  onClick={() => {
                    generateWithAI.mutate(
                      { title: editTitle, existingContent: editContent, instruction: "expand" },
                      { onSuccess: (r) => { setEditContent(r.content); updateNote.mutate({ noteId: selectedId!, content: r.content }); } },
                    );
                  }}
                  disabled={generateWithAI.isPending}
                  className="text-foreground/40 hover:text-primary transition disabled:opacity-30"
                  title="Expand with AI"
                >
                  <Wand2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => {
                    summarizeWithAI.mutate(
                      { text: editContent, maxLength: "short" },
                      { onSuccess: (r) => { setEditContent(r.summary); updateNote.mutate({ noteId: selectedId!, content: r.summary }); } },
                    );
                  }}
                  disabled={summarizeWithAI.isPending}
                  className="text-foreground/40 hover:text-primary transition disabled:opacity-30"
                  title="Summarize with AI"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                </button>
                <button onClick={handleDelete} className="ml-auto text-foreground/40 hover:text-red-500 transition">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 grid place-items-center text-sm text-foreground/40">
              Select a note or create a new one
            </div>
          )}
        </div>
      </div>
    </HellowModal>
  );
}
