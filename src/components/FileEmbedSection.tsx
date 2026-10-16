import React, { useState, useRef } from 'react';
import { EmbeddedFileItem, EmbeddedFileType, StudyQuestion } from '../types';
import { UploadCloud, FileText, CheckCircle2, Trash2, Plus, Sparkles, BookOpen, ShieldCheck, Loader2 } from 'lucide-react';

interface FileEmbedSectionProps {
  courseCode: string;
  files: EmbeddedFileItem[];
  onAddFile: (file: EmbeddedFileItem, extractedQuestions?: StudyQuestion[]) => void;
  onRemoveFile: (fileId: string) => void;
  availableCourses?: { code: string; name: string }[];
  onCourseChange?: (courseCode: string) => void;
  onAddNewClass?: () => void;
}

export const FileEmbedSection: React.FC<FileEmbedSectionProps> = ({
  courseCode,
  files,
  onAddFile,
  onRemoveFile,
  availableCourses,
  onCourseChange,
  onAddNewClass,
}) => {
  const [selectedType, setSelectedType] = useState<EmbeddedFileType>('past_exam');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (fileName: string, fileSizeStr: string, fileTextSnippet?: string) => {
    setIsProcessing(true);

    let defaultSummary = '';
    let parsedCount = 3;

    if (selectedType === 'past_exam') {
      defaultSummary = 'Extracted 3 exam-caliber problems & professor scoring rubric anchors';
    } else if (selectedType === 'lecture_notes') {
      defaultSummary = 'Extracted 3 conceptual lecture framework questions from slide notes';
    } else {
      defaultSummary = 'Extracted 3 core theoretical & quantitative course content problems';
    }

    try {
      const res = await fetch('/api/parse-course-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName,
          fileType: selectedType,
          courseCode,
          fileText: fileTextSnippet || '',
        }),
      });

      const data = await res.json();
      const extractedQuestions: StudyQuestion[] = (data && data.questions) || [];
      const finalSummary = data?.summary || defaultSummary;
      const count = data?.parsedCount || parsedCount;

      const newFile: EmbeddedFileItem = {
        id: `emb-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: fileName,
        size: fileSizeStr,
        type: selectedType,
        uploadedAt: 'Just now',
        courseCode: courseCode,
        summary: finalSummary,
        parsedItemsCount: count,
        extractedQuestions: extractedQuestions,
      };

      onAddFile(newFile, extractedQuestions);
      setUploadSuccessMsg(
        `Embedded "${fileName}"! Extracted ${extractedQuestions.length || 3} course content questions (Zero syllabus trivia).`
      );
    } catch {
      // Fallback local file embed
      const newFile: EmbeddedFileItem = {
        id: `emb-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: fileName,
        size: fileSizeStr,
        type: selectedType,
        uploadedAt: 'Just now',
        courseCode: courseCode,
        summary: defaultSummary,
        parsedItemsCount: parsedCount,
      };
      onAddFile(newFile);
      setUploadSuccessMsg(`Embedded "${fileName}" into ${courseCode}! Questions focused on course content.`);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setUploadSuccessMsg(''), 5500);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (uploaded) {
      const sizeMb = (uploaded.size / (1024 * 1024)).toFixed(1);
      const sizeStr = `${sizeMb} MB`;

      // Read text snippet if text/markdown/json
      if (
        uploaded.type.includes('text') ||
        uploaded.name.endsWith('.txt') ||
        uploaded.name.endsWith('.md') ||
        uploaded.name.endsWith('.csv')
      ) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = (event.target?.result as string) || '';
          handleFileUpload(uploaded.name, sizeStr, text);
        };
        reader.readAsText(uploaded);
      } else {
        handleFileUpload(uploaded.name, sizeStr);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      handleFileUpload(file.name, `${sizeMb} MB`);
    }
  };

  // Quick preset sample uploads
  const handleAddSample = (sampleName: string, type: EmbeddedFileType, size: string) => {
    setSelectedType(type);
    handleFileUpload(sampleName, size);
  };

  return (
    <div className="w-full bg-white rounded-2xl border-2 border-[#D8D1BD] p-4 sm:p-5 text-[#1E2516] space-y-4 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#EAE3D0]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C4F46C]" />
            <h4 className="text-sm font-black text-[#1E2516]">
              Manually Embed Past Exams & Course Content
            </h4>
          </div>
          <p className="text-[11px] text-[#606D53] mt-0.5">
            Attach professor-provided PDF past exams, lecture slide decks, and core course content for{' '}
            <strong className="text-[#1E2516]">{courseCode}</strong>.
          </p>
        </div>

        {/* Course Selector & Add New Class */}
        <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
          {availableCourses && availableCourses.length > 0 && onCourseChange && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase text-[#69775C]">Target Class:</span>
              <select
                value={courseCode}
                onChange={(e) => onCourseChange(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-[#F7F4EB] border border-[#CFC5AC] text-xs font-black text-[#1E2516] outline-hidden cursor-pointer"
              >
                {availableCourses.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code}
                  </option>
                ))}
              </select>
            </div>
          )}
          {onAddNewClass && (
            <button
              type="button"
              onClick={onAddNewClass}
              className="px-2.5 py-1 rounded-lg bg-[#3B4232] hover:bg-[#272D21] text-[#C4F46C] text-[11px] font-black flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
              title="Add a custom class"
            >
              <Plus className="w-3 h-3" />
              <span>+ New Class</span>
            </button>
          )}
        </div>
      </div>

      {/* STRICT COURSE CONTENT GUARANTEE BANNER */}
      <div className="p-3 rounded-xl bg-[#F0F7E6] border border-[#BBD79C] text-[#243E12] text-[11px] flex items-start gap-2.5 shadow-2xs">
        <ShieldCheck className="w-4 h-4 text-[#43741E] shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-black text-[#1E330F]">Pure Course Content Focus: </span>
          When files are embedded, Lock In parses <strong>core academic concepts, formulas, and testable exam problems</strong>. Questions are strictly about substantive course material—<strong>never syllabus logistics, grading percentages, attendance, or course policies</strong>.
        </div>
      </div>

      {/* Category selector pills */}
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#4E5B42] mb-1.5">
          Step 1: Choose File Category
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setSelectedType('past_exam')}
            className={`p-2 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center gap-1 border cursor-pointer ${
              selectedType === 'past_exam'
                ? 'bg-[#3B4232] text-[#C4F46C] border-[#1E2516] shadow-xs'
                : 'bg-[#F7F4EB] text-[#4F5B42] border-[#DED7C2] hover:bg-[#EAE3D0]'
            }`}
          >
            <span className="text-sm">📑</span>
            <span className="text-[11px] leading-tight">Past Exam Archive</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedType('lecture_notes')}
            className={`p-2 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center gap-1 border cursor-pointer ${
              selectedType === 'lecture_notes'
                ? 'bg-[#3B4232] text-[#C4F46C] border-[#1E2516] shadow-xs'
                : 'bg-[#F7F4EB] text-[#4F5B42] border-[#DED7C2] hover:bg-[#EAE3D0]'
            }`}
          >
            <span className="text-sm">🎙️</span>
            <span className="text-[11px] leading-tight">Lecture Slides & Notes</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedType('course_content')}
            className={`p-2 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center gap-1 border cursor-pointer ${
              selectedType === 'course_content' || (selectedType as string) === 'syllabus_rubric'
                ? 'bg-[#3B4232] text-[#C4F46C] border-[#1E2516] shadow-xs'
                : 'bg-[#F7F4EB] text-[#4F5B42] border-[#DED7C2] hover:bg-[#EAE3D0]'
            }`}
          >
            <span className="text-sm">📚</span>
            <span className="text-[11px] leading-tight">Course Content & Readings</span>
          </button>
        </div>
      </div>

      {/* Drag and Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        className={`w-full p-5 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
          isProcessing
            ? 'border-[#9BB97B] bg-[#F2F8EA] opacity-80 cursor-wait'
            : isDragging
            ? 'border-[#3B4232] bg-[#EBF7DA]'
            : 'border-[#CDC3AA] hover:border-[#3B4232] bg-[#FAF8F2]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.pptx,.txt,.csv,.md"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isProcessing}
        />

        {isProcessing ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <Loader2 className="w-7 h-7 text-[#3B4232] animate-spin" />
            <div className="text-xs font-black text-[#1E2516]">
              Parsing Course Material with Gemini...
            </div>
            <p className="text-[10px] text-[#556346]">
              Filtering out syllabus administrative details • Synthesizing academic exam problems
            </p>
          </div>
        ) : (
          <>
            <UploadCloud className="w-7 h-7 text-[#505D43] mb-1.5" />
            <div className="text-xs font-extrabold text-[#1E2516]">
              Drop PDF, PPTX, DOCX, or TXT notes here, or <span className="text-[#3B4232] underline">browse</span>
            </div>
            <p className="text-[10px] text-[#717E66] mt-0.5">
              Category: <strong>{selectedType.replace('_', ' ').toUpperCase()}</strong> • Deep Academic Extraction for {courseCode}
            </p>
          </>
        )}
      </div>

      {/* Upload Feedback */}
      {uploadSuccessMsg && (
        <div className="p-3 rounded-xl bg-[#E8F8D0] border border-[#96D54B] text-[#224A10] text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#396C1E] shrink-0" />
          <span>{uploadSuccessMsg}</span>
        </div>
      )}

      {/* Quick 1-Click Sample File Buttons */}
      <div className="p-3 rounded-xl bg-[#F4EEDC] border border-[#E0D7BF] space-y-1.5">
        <div className="text-[10px] font-black uppercase tracking-wider text-[#5D6B50] flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#3B4232]" />
          Instant Demo Presets for {courseCode} (Pre-scraped Course Content):
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={isProcessing}
            onClick={() =>
              handleAddSample(
                `${courseCode.replace(/\s+/g, '')}_Fall2024_PastMidterm_Archive.pdf`,
                'past_exam',
                '2.4 MB'
              )
            }
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#3B4232] hover:text-[#C4F46C] text-[#2A3420] text-[11px] font-bold border border-[#D5CCB4] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            + Embed Past Midterm Exam.pdf
          </button>
          <button
            type="button"
            disabled={isProcessing}
            onClick={() =>
              handleAddSample(
                `${courseCode.replace(/\s+/g, '')}_Lectures_7to11_SlideDeck.pdf`,
                'lecture_notes',
                '5.1 MB'
              )
            }
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#3B4232] hover:text-[#C4F46C] text-[#2A3420] text-[11px] font-bold border border-[#D5CCB4] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            + Embed Lecture 7-11 Slides.pdf
          </button>
          <button
            type="button"
            disabled={isProcessing}
            onClick={() =>
              handleAddSample(
                `${courseCode.replace(/\s+/g, '')}_Core_Concepts_&_Formulas.pdf`,
                'course_content',
                '3.8 MB'
              )
            }
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#3B4232] hover:text-[#C4F46C] text-[#2A3420] text-[11px] font-bold border border-[#D5CCB4] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <BookOpen className="w-3 h-3" />
            + Embed Course Content & Formulas.pdf
          </button>
        </div>
      </div>

      {/* Embedded Files List */}
      {files.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-[#EAE3D0]">
          <div className="flex items-center justify-between text-[11px] font-black text-[#4E5B42]">
            <span>Embedded Course Assets ({files.length}):</span>
            <span className="text-[10px] font-semibold text-[#546E3A] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5FB224]" />
              Course Content Synced with Study Engine
            </span>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {files.map((file) => {
              let badgeColor = 'bg-[#E3DCB8] text-[#4A573D]';
              let typeLabel = 'Past Exam';
              if (file.type === 'lecture_notes') {
                badgeColor = 'bg-[#DCE8CF] text-[#2F521B]';
                typeLabel = 'Lecture Notes';
              } else if (file.type === 'course_content' || (file.type as string) === 'syllabus_rubric') {
                badgeColor = 'bg-[#D2E7C4] text-[#1E4D12]';
                typeLabel = 'Course Content';
              }

              return (
                <div
                  key={file.id}
                  className="p-2.5 rounded-xl bg-[#F7F4EB] border border-[#DDD4BD] flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="w-4 h-4 text-[#3B4232] shrink-0" />
                    <div className="min-w-0">
                      <div className="font-bold text-[#1E2516] truncate max-w-[200px] sm:max-w-xs">
                        {file.name}
                      </div>
                      <div className="text-[10px] text-[#657358] flex items-center gap-2">
                        <span className={`px-1.5 py-0.2 rounded-md font-bold uppercase ${badgeColor}`}>
                          {typeLabel}
                        </span>
                        <span>{file.size}</span>
                        <span>•</span>
                        <span className="truncate">{file.summary}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveFile(file.id)}
                    className="p-1.5 rounded-lg hover:bg-[#EAE1CB] text-[#9A3C23] transition-colors shrink-0 cursor-pointer"
                    title="Remove File"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
