import React, { useState } from 'react';
import { CanvasConfig, EmbeddedFileItem, StudyQuestion } from '../types';
import { PatHelpTooltip } from './PatHelpTooltip';
import { FileEmbedSection } from './FileEmbedSection';
import { X, Key, Globe, Calendar, RefreshCw, CheckCircle2, AlertCircle, FileText, Download } from 'lucide-react';

interface CanvasSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: CanvasConfig;
  onSaveConfig: (newConfig: CanvasConfig) => void;
  onTriggerSync: (config: CanvasConfig) => Promise<boolean>;
  onLoadPreset: () => void;
  onResetToBlankCanvas?: () => void;
  onLoadDemoData?: () => void;
  activeCourseCode?: string;
  embeddedFiles?: EmbeddedFileItem[];
  onAddEmbeddedFile?: (file: EmbeddedFileItem, extractedQuestions?: StudyQuestion[]) => void;
  onRemoveEmbeddedFile?: (fileId: string) => void;
  availableCourses?: { code: string; name: string }[];
  onCourseChange?: (courseCode: string) => void;
  onAddNewClass?: () => void;
}

export const CanvasSettingsModal: React.FC<CanvasSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onTriggerSync,
  onLoadPreset,
  onResetToBlankCanvas,
  onLoadDemoData,
  activeCourseCode = 'MGT 301',
  embeddedFiles = [],
  onAddEmbeddedFile,
  onRemoveEmbeddedFile,
  availableCourses,
  onCourseChange,
  onAddNewClass,
}) => {
  const [formData, setFormData] = useState<CanvasConfig>({ ...config });
  const [selectedCourseCode, setSelectedCourseCode] = useState<string>(activeCourseCode);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<{
    status: 'idle' | 'success' | 'error';
    message: string;
  }>({ status: 'idle', message: '' });

  // Local embedded files state fallback
  const [localFiles, setLocalFiles] = useState<EmbeddedFileItem[]>(embeddedFiles);

  if (!isOpen) return null;

  const handleTestAndSync = async () => {
    setIsSyncing(true);
    setSyncFeedback({ status: 'idle', message: 'Connecting to Canvas LMS instance...' });

    try {
      const success = await onTriggerSync(formData);
      if (success) {
        setSyncFeedback({
          status: 'success',
          message: 'Canvas sync completed! Scraped modules, lecture notes, and professor past exams.',
        });
        onSaveConfig({ ...formData, isConnected: true, lastSyncedAt: new Date().toLocaleTimeString() });
      } else {
        setSyncFeedback({
          status: 'error',
          message: 'Could not connect directly to Canvas. Check PAT permissions or use sample course data.',
        });
      }
    } catch {
      setSyncFeedback({
        status: 'error',
        message: 'Sync connection timed out. Please check your token format.',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAddFile = (file: EmbeddedFileItem, extractedQuestions?: StudyQuestion[]) => {
    setLocalFiles((prev) => [file, ...prev]);
    if (onAddEmbeddedFile) onAddEmbeddedFile(file, extractedQuestions);
  };

  const handleRemoveFile = (fileId: string) => {
    setLocalFiles((prev) => prev.filter((f) => f.id !== fileId));
    if (onRemoveEmbeddedFile) onRemoveEmbeddedFile(fileId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-subtle rounded-card border border-ink shadow-card p-6 sm:p-8 overflow-hidden text-ink">
        {/* Top Header */}
        <div className="flex items-start justify-between pb-4 border-b border-line">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-ink text-white text-[11px] font-bold uppercase tracking-wider mb-1.5">
              <Key className="w-3 h-3" /> Canvas LMS Ingestion & Files
            </div>
            <h2 className="text-2xl font-bold text-ink tracking-tight">
              Canvas API & Course Content
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Connect Canvas or manually embed past exam PDFs and course notes.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-soft text-ink transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <div className="space-y-4 my-5 max-h-[68vh] overflow-y-auto pr-1">
          {/* Pre-configured course blueprint */}
          <div className="p-3.5 rounded-2xl bg-soft border border-line flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-ink">Curated Course Blueprint</div>
              <div className="text-[11px] text-muted">
                Instantly restore complete MGT 301 course data with verified professor lecture transcripts & past exam rubrics.
              </div>
            </div>
            <button
              onClick={() => {
                onLoadPreset();
                setSyncFeedback({
                  status: 'success',
                  message: 'Loaded verified MGT 301 course blueprint with professor notes and past exam archives.',
                });
              }}
              className="px-3 py-1.5 rounded-full bg-ink text-white text-xs font-bold hover:bg-ink transition-colors shrink-0 ml-3 flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Load MGT 301 Data
            </button>
          </div>

          {/* Canvas Domain */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1">
              Canvas LMS Institution Domain
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                placeholder="canvas.instructure.com or canvas.university.edu"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-line focus:border-ink text-xs font-semibold text-ink outline-hidden shadow-card"
              />
            </div>
          </div>

          {/* Canvas PAT Token with the Hoverable "?" Sign! */}
          <div>
            <div className="flex items-center mb-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-ink">
                Canvas Personal Access Token (PAT)
              </label>

              {/* The '?' Tooltip */}
              <PatHelpTooltip />

              <span className="text-[10px] text-muted font-medium ml-auto">Per-Semester Token</span>
            </div>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="password"
                value={formData.patToken}
                onChange={(e) => setFormData({ ...formData, patToken: e.target.value })}
                placeholder="Canvas token (hover ? above for instructions)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-line focus:border-ink text-xs font-mono text-ink outline-hidden shadow-card"
              />
            </div>
            <p className="text-[10px] text-muted mt-1">
              Hover the <strong className="text-ink">?</strong> icon above for exact step-by-step instructions.
            </p>
          </div>

          {/* Semester Setup & Bounds */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink mb-1">
                Semester Label
              </label>
              <input
                type="text"
                value={formData.semesterLabel}
                onChange={(e) => setFormData({ ...formData, semesterLabel: e.target.value })}
                placeholder="Fall 2026"
                className="w-full px-3 py-2 rounded-xl bg-white border border-line focus:border-ink text-xs font-semibold text-ink outline-hidden"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink mb-1">
                Term Start Date
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="date"
                  aria-label="Term start date"
                  value={formData.termStartDate}
                  onChange={(e) => setFormData({ ...formData, termStartDate: e.target.value })}
                  className="w-full pl-8 pr-2 py-2 rounded-xl bg-white border border-line focus:border-ink text-xs font-semibold text-ink outline-hidden"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink mb-1">
                Term End Date
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="date"
                  aria-label="Term end date"
                  value={formData.termEndDate}
                  onChange={(e) => setFormData({ ...formData, termEndDate: e.target.value })}
                  className="w-full pl-8 pr-2 py-2 rounded-xl bg-white border border-line focus:border-ink text-xs font-semibold text-ink outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Sync Feedback message */}
          {syncFeedback.message && (
            <div
              className={`p-3 rounded-xl border text-xs font-medium flex items-start gap-2 ${
                syncFeedback.status === 'success'
                  ? 'bg-ink border-ink text-white'
                  : syncFeedback.status === 'error'
                  ? 'bg-subtle border-line text-ink'
                  : 'bg-white border-line text-ink'
              }`}
            >
              {syncFeedback.status === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-ink shrink-0 mt-0.5" />
              ) : syncFeedback.status === 'error' ? (
                <AlertCircle className="w-4 h-4 text-ink shrink-0 mt-0.5" />
              ) : (
                <RefreshCw className="w-4 h-4 animate-spin text-ink shrink-0 mt-0.5" />
              )}
              <span>{syncFeedback.message}</span>
            </div>
          )}

          {/* ======================================================== */}
          {/* OPTION BELOW: MANUALLY EMBED FILES FOR COURSE            */}
          {/* ======================================================== */}
          <div className="pt-2">
            <FileEmbedSection
              courseCode={selectedCourseCode}
              files={localFiles.filter((f) => f.courseCode === selectedCourseCode)}
              onAddFile={handleAddFile}
              onRemoveFile={handleRemoveFile}
              availableCourses={availableCourses}
              onCourseChange={(newCode) => {
                setSelectedCourseCode(newCode);
                if (onCourseChange) onCourseChange(newCode);
              }}
              onAddNewClass={onAddNewClass}
            />
          </div>

          {/* Scraped Assets Summary */}
          <div className="p-3.5 rounded-2xl bg-white border border-line space-y-2 text-xs">
            <div className="font-bold text-ink flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-ink" />
              Scraped Content Pipeline for {activeCourseCode}
            </div>
            <ul className="space-y-1 text-muted pl-2 text-[11px]">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-ink text-white" />
                <strong>Module Pages:</strong> Lecture slides, assigned reading links, chapter summaries
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-ink text-white" />
                <strong>Daily Lecture Notes:</strong> Professor verbatim quotes & mental model framing
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-ink text-white" />
                <strong>Past Exam Archives:</strong> Midterms & Finals with official grading rubrics
              </li>
            </ul>
          </div>

          {/* Data Management & Testing Controls */}
          <div className="p-3.5 rounded-2xl bg-soft border border-line space-y-2 text-xs">
            <div className="font-bold text-ink flex items-center justify-between">
              <span>Environment & Storage Mode</span>
              <span className="text-[10px] font-mono bg-ink text-white px-2 py-0.5 rounded-full">
                Local Storage
              </span>
            </div>
            <p className="text-[11px] text-muted leading-relaxed">
              You can wipe all current custom classes to reset back to a clean blank canvas, or load sample courses anytime.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {onResetToBlankCanvas && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Reset app to a completely blank canvas? This will remove all loaded courses and reset XP and streaks.')) {
                      onResetToBlankCanvas();
                      onClose();
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-soft hover:bg-soft text-ink hover:text-ink border border-line text-xs font-bold transition-colors cursor-pointer"
                >
                  Reset to Blank Canvas
                </button>
              )}
              {onLoadDemoData && (
                <button
                  type="button"
                  onClick={() => {
                    onLoadDemoData();
                    onClose();
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-ink hover:bg-ink text-white text-xs font-bold transition-colors cursor-pointer shadow-card"
                >
                  Load Demo Classes (MGT 301 & CS 189)
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-3 border-t border-line">
          <div className="text-[11px] text-muted">
            Sync state is saved to your browser
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-full bg-soft hover:bg-soft text-ink text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              disabled={isSyncing}
              onClick={handleTestAndSync}
              className="px-6 py-2.5 rounded-full bg-ink hover:bg-ink text-xs font-bold shadow-card border border-ink flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95 disabled:opacity-60 text-white"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Scraping Canvas...' : 'Save & Sync Canvas'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
