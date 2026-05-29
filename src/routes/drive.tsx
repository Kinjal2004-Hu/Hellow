import { useState, useEffect, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  FolderOpen, File, Upload, Download, Trash2, Star, FolderPlus, Search,
  FileText, Image, Music, Video, Archive, ChevronRight, MoreHorizontal,
  RotateCcw, X, Loader2,
} from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/layout/Layout";
import { cn } from "@/lib/utils";
import * as driveService from "@/services/drive";
import { useUIStore } from "@/store/useUIStore";

function DrivePage() {
  const showToast = useUIStore((s) => s.showToast);
  const [files, setFiles] = useState<driveService.DriveFileDTO[]>([]);
  const [folders, setFolders] = useState<driveService.DriveFolderDTO[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<{ _id: string | null; name: string }[]>([{ _id: null, name: "My Drive" }]);
  const [search, setSearch] = useState("");
  const [showTrash, setShowTrash] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    try {
      const [f, d] = await Promise.all([
        driveService.listFolders(currentFolderId ?? undefined),
        driveService.listFiles(currentFolderId ?? undefined, search || undefined, showTrash || undefined),
      ]);
      setFolders(f);
      setFiles(d);
    } catch {} finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [currentFolderId, search, showTrash]);

  function navigateToFolder(folderId: string, folderName: string) {
    setCurrentFolderId(folderId);
    setFolderPath((prev) => [...prev, { _id: folderId, name: folderName }]);
  }

  function navigateUp() {
    if (folderPath.length <= 1) return;
    const newPath = folderPath.slice(0, -1);
    setFolderPath(newPath);
    setCurrentFolderId(newPath[newPath.length - 1]._id);
  }

  function navigateToBreadcrumb(index: number) {
    const newPath = folderPath.slice(0, index + 1);
    setFolderPath(newPath);
    setCurrentFolderId(newPath[newPath.length - 1]._id);
  }

  async function handleCreateFolder() {
    if (!newFolderName.trim()) return;
    try {
      await driveService.createFolder(newFolderName, currentFolderId ?? undefined);
      setNewFolderName("");
      setShowNewFolder(false);
      load();
      showToast("Folder created", "success");
    } catch {
      showToast("Failed to create folder", "error");
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await driveService.uploadFile(file, currentFolderId ?? undefined);
      showToast("File uploaded", "success");
      load();
    } catch {
      showToast("Upload failed", "error");
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleDelete(fileId: string) {
    try {
      await driveService.deleteFile(fileId);
      load();
      showToast("Moved to trash", "success");
    } catch {
      showToast("Delete failed", "error");
    }
  }

  async function handleRestore(fileId: string) {
    try {
      await driveService.restoreFile(fileId);
      load();
      showToast("File restored", "success");
    } catch {
      showToast("Restore failed", "error");
    }
  }

  async function handlePermanentDelete(fileId: string) {
    try {
      await driveService.permanentDeleteFile(fileId);
      load();
      showToast("File permanently deleted", "success");
    } catch {
      showToast("Delete failed", "error");
    }
  }

  async function handleStar(fileId: string, starred: boolean) {
    try {
      await driveService.updateFile(fileId, { isStarred: !starred });
      load();
    } catch {}
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  function getFileIcon(mimeType: string) {
    if (mimeType.startsWith("image/")) return <Image className="h-4 w-4 text-green-500" />;
    if (mimeType.startsWith("video/")) return <Video className="h-4 w-4 text-purple-500" />;
    if (mimeType.startsWith("audio/")) return <Music className="h-4 w-4 text-orange-500" />;
    if (mimeType.includes("zip") || mimeType.includes("rar") || mimeType.includes("tar"))
      return <Archive className="h-4 w-4 text-yellow-500" />;
    if (mimeType.includes("text") || mimeType.includes("pdf") || mimeType.includes("document"))
      return <FileText className="h-4 w-4 text-blue-500" />;
    return <File className="h-4 w-4 text-foreground/60" />;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 h-14 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5 text-primary" />
          <span className="font-semibold text-sm">Drive</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search files..."
              className="w-48 h-8 pl-8 pr-3 rounded-lg border border-border bg-background text-xs outline-none focus:border-primary/40 transition"
            />
          </div>
          <button
            onClick={() => setShowTrash(!showTrash)}
            className={cn(
              "h-8 px-3 rounded-lg text-xs font-medium border border-border transition",
              showTrash ? "bg-accent" : "hover:bg-accent",
            )}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition"
          >
            <Upload className="h-3.5 w-3.5" />
            Upload
          </button>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleUpload}
            className="hidden"
          />
          <button
            onClick={() => setShowNewFolder(true)}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border text-xs font-medium hover:bg-accent transition"
          >
            <FolderPlus className="h-3.5 w-3.5" />
            New Folder
          </button>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1 px-6 h-10 border-b border-border bg-accent/20">
        {folderPath.map((p, i) => (
          <span key={p._id ?? "root"} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
            <button
              onClick={() => navigateToBreadcrumb(i)}
              className={cn(
                "text-xs px-2 py-0.5 rounded-md transition",
                i === folderPath.length - 1
                  ? "font-semibold text-foreground"
                  : "text-muted-foreground hover:bg-accent",
              )}
            >
              {p.name}
            </button>
          </span>
        ))}
        {folderPath.length > 1 && (
          <button
            onClick={navigateUp}
            className="ml-2 h-6 w-6 grid place-items-center rounded-md text-muted-foreground hover:bg-accent transition"
          >
            <ChevronRight className="h-3 w-3 rotate-180" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : showNewFolder && (
          <div className="mb-4 p-4 rounded-2xl border border-border bg-accent/30 flex items-center gap-3">
            <FolderPlus className="h-5 w-5 text-primary" />
            <input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
              placeholder="Folder name"
              className="flex-1 h-9 rounded-xl border border-border bg-background px-4 text-sm outline-none focus:border-primary/40 transition"
              autoFocus
            />
            <button
              onClick={handleCreateFolder}
              className="h-9 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition"
            >
              Create
            </button>
            <button
              onClick={() => { setShowNewFolder(false); setNewFolderName(""); }}
              className="h-9 w-9 grid place-items-center rounded-xl border border-border hover:bg-accent transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {folders.length === 0 && files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <FolderOpen className="h-12 w-12 text-muted-foreground/20 mb-3" />
            <p className="text-sm text-muted-foreground/60">
              {showTrash ? "Trash is empty" : "No files yet"}
            </p>
            {!showTrash && (
              <p className="text-xs text-muted-foreground/40 mt-1">
                Upload a file or create a folder to get started
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {/* Folders */}
            {folders.map((folder) => (
              <button
                key={folder._id}
                onClick={() => navigateToFolder(folder._id, folder.name)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent/50 transition group"
              >
                <FolderOpen className="h-5 w-5 text-yellow-500 shrink-0" />
                <span className="text-sm font-medium truncate flex-1 text-left">{folder.name}</span>
                <span className="text-xs text-muted-foreground">Folder</span>
              </button>
            ))}

            {/* Files */}
            {files.map((file) => (
              <div
                key={file._id}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent/30 transition group"
              >
                {getFileIcon(file.mimeType)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {formatSize(file.size)} &middot; {formatDate(file.createdAt)}
                    {file.source === "app" && " \u00b7 AI-generated"}
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  {!showTrash && (
                    <>
                      <button
                        onClick={() => handleStar(file._id, file.isStarred)}
                        className={cn(
                          "h-8 w-8 grid place-items-center rounded-lg transition",
                          file.isStarred ? "text-yellow-500" : "text-muted-foreground hover:bg-accent",
                        )}
                      >
                        <Star className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(file._id)}
                        className="h-8 w-8 grid place-items-center rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-500 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                  {showTrash && (
                    <>
                      <button
                        onClick={() => handleRestore(file._id)}
                        className="h-8 w-8 grid place-items-center rounded-lg text-muted-foreground hover:bg-accent transition"
                        title="Restore"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(file._id)}
                        className="h-8 w-8 grid place-items-center rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-500 transition"
                        title="Delete permanently"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/drive")({
  component: () => (
    <ProtectedRoute>
      <Layout>
        <DrivePage />
      </Layout>
    </ProtectedRoute>
  ),
});
