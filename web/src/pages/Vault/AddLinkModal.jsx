import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  LinkSimple,
  Sparkle,
  Warning,
  CircleNotch,
  BookmarkSimple,
  UploadSimple,
  FileArchive,
  CheckCircle,
  InstagramLogo,
  TiktokLogo,
  YoutubeLogo,
  RedditLogo,
  TwitterLogo,
  Globe,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { api } from "@/lib/api";

const URL_RE = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/.*)?$/i;
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB

const PLATFORM_GUIDES = [
  { id: "instagram", name: "Instagram", icon: InstagramLogo, tip: "Profile → Menu → Your Activity → Download your information → Select 'Saved posts' → JSON format" },
  { id: "tiktok", name: "TikTok", icon: TiktokLogo, tip: "Profile → Menu → Settings & Privacy → Account → Download your data → Select JSON" },
  { id: "youtube", name: "YouTube", icon: YoutubeLogo, tip: "Google Takeout → Deselect all → Select YouTube and YouTube Music → Export watch history & playlists" },
  { id: "reddit", name: "Reddit", icon: RedditLogo, tip: "Settings → Account → Request your data → Download saved_posts.csv" },
  { id: "x", name: "X", icon: TwitterLogo, tip: "Settings & Privacy → Your Account → Download an archive of your data → data/bookmarks.js" },
  { id: "browser", name: "Browser", icon: Globe, tip: "Browser Bookmark Manager → ⋮ Menu → Export bookmarks to HTML" },
];

export function AddLinkModal({ open, onClose, onAdded }) {
  const [activeTab, setActiveTab] = useState("single"); // "single" | "import"
  const [url, setUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  // Universal import states
  const [importFile, setImportFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setUrl("");
      setError("");
      setIsSaving(false);
      setImportFile(null);
      setImportResult(null);
      setSelectedGuide(null);
      if (activeTab === "single") {
        setTimeout(() => inputRef.current?.focus(), 60);
      }
    }
  }, [open, activeTab]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const h = (e) => e.key === "Escape" && !isSaving && onClose();
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open, isSaving, onClose]);

  const submitSingle = async (e) => {
    e?.preventDefault?.();
    let clean = url.trim();
    if (!clean) return;
    if (!/^https?:\/\//i.test(clean)) clean = "https://" + clean;
    if (!URL_RE.test(clean)) {
      setError("That doesn't look like a valid URL");
      return;
    }
    setError("");
    setIsSaving(true);
    try {
      const res = await api.createItem(clean);
      onAdded?.(res); // Add item to vault
      if (res.duplicate) {
        toast("Already in your vault", { icon: null });
      } else {
        toast.success("Saved to vault! Analyzing in background…");
      }
      onClose();
    } catch (err) {
      setError(err?.message || "Save failed — try again");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    setError("");
    setImportResult(null);

    // Validate size limit (25MB max)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError("File is too large. Maximum archive file size is 25MB.");
      return;
    }

    setImportFile(file);
  };

  const submitImport = async () => {
    if (!importFile || isSaving) return;
    setError("");
    setIsSaving(true);

    try {
      const res = await api.importArchive(importFile, importFile.name);
      setImportResult(res);
      toast.success(
        `Import complete! Added ${res.imported} save${res.imported === 1 ? "" : "s"} from ${res.platform_display || "archive"} to your vault.`
      );
      onAdded?.(res);
    } catch (err) {
      setError(err?.message || err?.detail || "Failed to import archive. Please check the file format.");
    } finally {
      setIsSaving(false);
    }
  };

  const close = () => {
    if (isSaving) return;
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
          data-testid="add-link-modal"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-on-surface/40 backdrop-blur-[2px]"
            onClick={close}
            aria-hidden
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="relative w-full sm:max-w-[580px] bg-surface border border-ds-border rounded-t-[24px] sm:rounded-ds-lg shadow-tier-1 overflow-hidden"
          >
            {/* Header strip */}
            <div className="glass-header px-6 pt-5 pb-4 flex items-center justify-between border-b border-ds-border/60">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-ds-md bg-brand-tertiary text-brand flex items-center justify-center">
                  {activeTab === "single" ? (
                    <LinkSimple size={18} weight="regular" />
                  ) : (
                    <BookmarkSimple size={18} weight="regular" />
                  )}
                </span>
                <div className="leading-tight">
                  <p className="text-on-surface text-ds-lg font-medium">
                    {activeTab === "single" ? "Save a link" : "Universal Social & Bookmark Importer"}
                  </p>
                  <p className="text-on-surface-secondary text-ds-sm">
                    {activeTab === "single"
                      ? "Paste any URL — we'll do the rest."
                      : "Bulk pull saves from Instagram, TikTok, YouTube, Reddit, X, or Browser."}
                  </p>
                </div>
              </div>
              <button
                onClick={close}
                disabled={isSaving}
                aria-label="Close"
                data-testid="add-link-close"
                className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-secondary hover:bg-surface-secondary transition-colors disabled:opacity-50"
              >
                <X size={16} weight="bold" />
              </button>
            </div>

            {/* Segmented Tab Switcher */}
            <div className="px-6 pt-4 pb-1">
              <div className="flex bg-surface-secondary p-1 rounded-xl border border-ds-border/60">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => {
                    setActiveTab("single");
                    setError("");
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-ds-sm font-medium transition-all ${
                    activeTab === "single"
                      ? "bg-surface text-on-surface shadow-xs"
                      : "text-on-surface-secondary hover:text-on-surface"
                  }`}
                >
                  Single Link
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => {
                    setActiveTab("import");
                    setError("");
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-ds-sm font-medium transition-all ${
                    activeTab === "import"
                      ? "bg-surface text-on-surface shadow-xs"
                      : "text-on-surface-secondary hover:text-on-surface"
                  }`}
                >
                  Universal Importer (.zip, .json, .csv, .html)
                </button>
              </div>
            </div>

            {/* TAB 1: Single Link */}
            {activeTab === "single" ? (
              <form onSubmit={submitSingle} className="px-6 pt-4 pb-6 flex flex-col gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className="sr-only">URL</span>
                  <input
                    ref={inputRef}
                    type="url"
                    inputMode="url"
                    autoCapitalize="none"
                    autoCorrect="off"
                    autoComplete="off"
                    spellCheck={false}
                    value={url}
                    disabled={isSaving}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://instagram.com/reel/... or https://youtube.com/..."
                    data-testid="add-link-input"
                    className={`field-input !text-ds-lg ${error ? "field-input-error" : ""}`}
                  />
                  {error ? (
                    <span
                      className="text-ds-sm text-ds-error flex items-center gap-1.5"
                      data-testid="add-link-error"
                    >
                      <Warning size={13} weight="fill" />
                      {error}
                    </span>
                  ) : (
                    <span className="text-ds-sm text-on-surface-secondary">
                      Instagram, TikTok, YouTube, X, Reddit, articles — anything.
                    </span>
                  )}
                </label>

                <button
                  type="submit"
                  disabled={!url.trim() || isSaving}
                  data-testid="add-link-submit"
                  className="btn-brand"
                >
                  {isSaving ? (
                    <>
                      <CircleNotch size={17} weight="bold" className="animate-spin" />
                      Saving to vault…
                    </>
                  ) : (
                    <>
                      <Sparkle size={17} weight="fill" />
                      Save link
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* TAB 2: Universal Social & Bookmark Import */
              <div className="px-6 pt-4 pb-6 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
                {importResult ? (
                  /* Success Summary Card */
                  <div className="bg-brand-tertiary/40 border border-brand/20 rounded-2xl p-5 flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-full bg-brand/15 text-brand flex items-center justify-center shrink-0">
                        <CheckCircle size={24} weight="fill" />
                      </span>
                      <div>
                        <h4 className="text-ds-base font-semibold text-on-surface">
                          {importResult.platform_display || "Archive"} Ingested Successfully!
                        </h4>
                        <p className="text-ds-xs text-on-surface-secondary">
                          All saves are now indexed and searchable in your personal vault.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 pt-1 text-center">
                      <div className="bg-surface rounded-xl p-2.5 border border-ds-border">
                        <div className="text-[11px] text-on-surface-secondary">Found</div>
                        <div className="text-ds-base font-bold text-on-surface">
                          {importResult.total_found}
                        </div>
                      </div>
                      <div className="bg-surface rounded-xl p-2.5 border border-brand/30">
                        <div className="text-[11px] text-brand font-medium">Added to Vault</div>
                        <div className="text-ds-base font-bold text-brand">
                          {importResult.imported}
                        </div>
                      </div>
                      <div className="bg-surface rounded-xl p-2.5 border border-ds-border">
                        <div className="text-[11px] text-on-surface-secondary">Duplicates</div>
                        <div className="text-ds-base font-bold text-on-surface-secondary">
                          {importResult.skipped_duplicate}
                        </div>
                      </div>
                      <div className="bg-surface rounded-xl p-2.5 border border-brand/30">
                        <div className="text-[11px] text-brand font-medium">AI Queued</div>
                        <div className="text-ds-base font-bold text-brand">
                          {importResult.ai_enrichment_queued}
                        </div>
                      </div>
                    </div>

                    <p className="text-ds-xs text-on-surface-secondary flex items-center gap-1.5">
                      <Sparkle size={13} weight="fill" className="text-brand shrink-0" />
                      All items are instantly searchable. AI enrichment runs safely in background to protect API quotas.
                    </p>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={close}
                        className="btn-brand flex-1 py-2.5 text-ds-sm"
                      >
                        Done & View Vault
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setImportResult(null);
                          setImportFile(null);
                        }}
                        className="btn-secondary py-2.5 px-4 text-ds-sm"
                      >
                        Import Another File
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Upload Dropzone Form */
                  <div className="flex flex-col gap-4">
                    {/* Platform quick guide selector */}
                    <div className="flex flex-col gap-2">
                      <span className="text-ds-xs font-medium text-on-surface-secondary">
                        Select a platform for 1-minute export steps:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {PLATFORM_GUIDES.map((p) => {
                          const IconComp = p.icon;
                          const active = selectedGuide === p.id;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => setSelectedGuide(active ? null : p.id)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-ds-xs transition-colors border ${
                                active
                                  ? "bg-brand text-on-brand border-brand"
                                  : "bg-surface-secondary text-on-surface-secondary border-ds-border/60 hover:text-on-surface hover:bg-surface-secondary/80"
                              }`}
                            >
                              <IconComp size={14} weight={active ? "bold" : "regular"} />
                              <span>{p.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Step tip banner */}
                    {selectedGuide && (
                      <div className="bg-brand-tertiary/50 border border-brand/20 rounded-xl p-3 text-ds-xs text-on-brand-tertiary space-y-1">
                        <span className="font-semibold text-on-surface block">
                          How to export from {PLATFORM_GUIDES.find((g) => g.id === selectedGuide)?.name}:
                        </span>
                        <p>{PLATFORM_GUIDES.find((g) => g.id === selectedGuide)?.tip}</p>
                      </div>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".zip,.json,.csv,.html,.htm,.txt"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileSelect(file);
                      }}
                    />

                    {/* Drag-and-drop box */}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleFileSelect(file);
                      }}
                      onClick={() => !isSaving && fileInputRef.current?.click()}
                      className={`cursor-pointer border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all ${
                        isDragging
                          ? "border-brand bg-brand-tertiary/50"
                          : importFile
                          ? "border-brand/40 bg-surface-secondary"
                          : "border-ds-border hover:border-brand/50 hover:bg-surface-secondary/40"
                      }`}
                    >
                      {importFile ? (
                        <div className="flex items-center gap-3">
                          <span className="w-10 h-10 rounded-xl bg-brand-tertiary text-brand flex items-center justify-center shrink-0">
                            {importFile.name.endsWith(".zip") ? (
                              <FileArchive size={24} weight="duotone" />
                            ) : (
                              <UploadSimple size={24} weight="bold" />
                            )}
                          </span>
                          <div className="text-left">
                            <p className="text-ds-sm font-semibold text-on-surface truncate max-w-[320px]">
                              {importFile.name}
                            </p>
                            <p className="text-ds-xs text-on-surface-secondary">
                              {(importFile.size / 1024).toFixed(1)} KB • Click to choose another file
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <span className="w-11 h-11 rounded-2xl bg-surface-secondary text-brand flex items-center justify-center mb-1">
                            <UploadSimple size={22} weight="bold" />
                          </span>
                          <p className="text-ds-sm font-medium text-on-surface">
                            Drop your export file here (.zip, .json, .csv, .html), or{" "}
                            <span className="text-brand underline decoration-brand/30">browse</span>
                          </p>
                          <p className="text-ds-xs text-on-surface-secondary max-w-sm">
                            Drop an Instagram, TikTok, YouTube Takeout, Reddit, X, or Browser export file.
                          </p>
                        </div>
                      )}
                    </div>

                    {error ? (
                      <span
                        className="text-ds-sm text-ds-error flex items-center gap-1.5"
                        data-testid="import-error"
                      >
                        <Warning size={13} weight="fill" />
                        {error}
                      </span>
                    ) : null}

                    <button
                      type="button"
                      disabled={!importFile || isSaving}
                      onClick={submitImport}
                      data-testid="import-submit"
                      className="btn-brand w-full"
                    >
                      {isSaving ? (
                        <>
                          <CircleNotch size={17} weight="bold" className="animate-spin" />
                          Extracting & saving to vault…
                        </>
                      ) : (
                        <>
                          <BookmarkSimple size={17} weight="fill" />
                          Import Saves into Vault
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
