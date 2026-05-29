import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as notesService from "@/services/notes";
import { useUIStore } from "@/store/useUIStore";

export function useNotesQuery(params?: { folderId?: string; tag?: string; archived?: boolean }) {
  return useQuery({
    queryKey: ["notes", params],
    queryFn: () => notesService.fetchNotes(params),
    staleTime: 30_000,
  });
}

export function useNoteQuery(noteId: string | null) {
  return useQuery({
    queryKey: ["notes", "detail", noteId],
    queryFn: () => notesService.fetchNote(noteId!),
    enabled: !!noteId,
  });
}

export function useNoteFoldersQuery() {
  return useQuery({
    queryKey: ["notes", "folders"],
    queryFn: notesService.fetchNoteFolders,
    staleTime: 60_000,
  });
}

export function useCreateNoteMutation() {
  const queryClient = useQueryClient();
  const showToast = useUIStore((s) => s.showToast);

  return useMutation({
    mutationFn: notesService.createNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      showToast("Note created", "success");
    },
    onError: () => showToast("Failed to create note", "error"),
  });
}

export function useUpdateNoteMutation() {
  const queryClient = useQueryClient();
  const showToast = useUIStore((s) => s.showToast);

  return useMutation({
    mutationFn: ({ noteId, ...payload }: { noteId: string } & Parameters<typeof notesService.updateNote>[1]) =>
      notesService.updateNote(noteId, payload),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["notes", "detail", vars.noteId] });
      showToast("Note updated", "success");
    },
    onError: () => showToast("Failed to update note", "error"),
  });
}

export function useDeleteNoteMutation() {
  const queryClient = useQueryClient();
  const showToast = useUIStore((s) => s.showToast);

  return useMutation({
    mutationFn: notesService.deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      showToast("Note deleted", "success");
    },
    onError: () => showToast("Failed to delete note", "error"),
  });
}

export function useCreateNoteFolderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notesService.createNoteFolder,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notes", "folders"] }),
  });
}

export function useDeleteNoteFolderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notesService.deleteNoteFolder,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notes", "folders"] }),
  });
}
