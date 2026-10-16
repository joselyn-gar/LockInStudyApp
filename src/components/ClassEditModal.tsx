import React, { useState, useEffect } from 'react';
import { CourseData } from '../types';
import { X, BookOpen, User, Calendar, Plus, Trash2, CheckCircle2, Sparkles } from 'lucide-react';

interface ClassEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseToEdit?: CourseData | null; // If null, mode is "Create New Class"
  onSaveCourse: (savedCourse: CourseData) => void;
  onDeleteCourse?: (courseId: string) => void;
  canDelete?: boolean;
}

export const ClassEditModal: React.FC<ClassEditModalProps> = ({
  isOpen,
  onClose,
  courseToEdit,
  onSaveCourse,
  onDeleteCourse,
  canDelete = false,
}) => {
  const isEditing = !!courseToEdit;

  const [code, setCode] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [professor, setProfessor] = useState<string>('');
  const [term, setTerm] = useState<string>('Fall 2026');
  const [startDate, setStartDate] = useState<string>('2026-08-28');
  const [endDate, setEndDate] = useState<string>('2026-12-15');
  const [moduleTitles, setModuleTitles] = useState<string[]>([
    'Foundations & Core Principles',
    'Applied Methodologies & Frameworks',
    'Advanced Topics & Case Studies',
  ]);
  const [newModuleInput, setNewModuleInput] = useState<string>('');

  useEffect(() => {
    if (courseToEdit) {
      setCode(courseToEdit.code);
      setName(courseToEdit.name);
      setProfessor(courseToEdit.professor);
      setTerm(courseToEdit.term);
      setStartDate(courseToEdit.startDate);
      setEndDate(courseToEdit.endDate);
      setModuleTitles(
        courseToEdit.modules.length > 0
          ? courseToEdit.modules.map((m) => m.title)
          : ['Core Fundamentals', 'Advanced Topics']
      );
    } else {
      // Default empty for new class
      setCode('');
      setName('');
      setProfessor('');
      setTerm('Fall 2026');
      setStartDate('2026-08-28');
      setEndDate('2026-12-15');
      setModuleTitles([
        'Unit 1: Foundations & Core Concepts',
        'Unit 2: Intermediate Frameworks & Application',
        'Unit 3: Synthesis & Exam Review',
      ]);
    }
  }, [courseToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAddModule = () => {
    if (!newModuleInput.trim()) return;
    setModuleTitles([...moduleTitles, newModuleInput.trim()]);
    setNewModuleInput('');
  };

  const handleRemoveModule = (index: number) => {
    if (moduleTitles.length > 1) {
      setModuleTitles(moduleTitles.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;

    // Generate modules structure
    const updatedModules = moduleTitles.map((title, idx) => ({
      id: courseToEdit?.modules[idx]?.id || `mod-${Date.now()}-${idx + 1}`,
      number: idx + 1,
      title,
      masteryPercentage: courseToEdit?.modules[idx]?.masteryPercentage || 65,
      totalQuestions: courseToEdit?.modules[idx]?.totalQuestions || 20,
      masteredQuestions: courseToEdit?.modules[idx]?.masteredQuestions || 13,
      status: (courseToEdit?.modules[idx]?.status || 'in_review') as
        | 'locked_in'
        | 'in_review'
        | 'needs_drill',
      topics: courseToEdit?.modules[idx]?.topics || [
        `${title} Concept A`,
        `${title} Concept B`,
      ],
      isPostExam: idx >= 1,
    }));

    const finalCourse: CourseData = {
      id: courseToEdit?.id || `course-${Date.now()}`,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      professor: professor.trim() || 'Course Instructor, Ph.D.',
      term: term.trim() || 'Fall 2026',
      startDate,
      endDate,
      milestones: courseToEdit?.milestones || [
        {
          id: `m-1-${Date.now()}`,
          name: 'Midterm Exam 1',
          date: '2026-10-15',
          isCompleted: false,
          coverageModules: [1, 2],
        },
        {
          id: `m-2-${Date.now()}`,
          name: 'Final Comprehensive Exam',
          date: endDate,
          isCompleted: false,
          coverageModules: [1, 2, 3],
        },
      ],
      modules: updatedModules,
      pastExams: courseToEdit?.pastExams || [],
      lectureNotes: courseToEdit?.lectureNotes || [
        {
          id: `ln-custom-1`,
          lectureNumber: 1,
          title: `Introductory Foundations for ${code.trim()}`,
          slideReference: 'Lecture 1, Slide 10',
          professorQuote: `"Focus on core first-principles rather than rote memorization."`,
          professorFraming: `Instructor emphasizes conceptual synthesis and problem formulation.`,
          genericTextbookContrast: `Generic online answers miss the professor's explicit rubric criteria.`,
        },
      ],
      questions: courseToEdit?.questions || [
        {
          id: `q-custom-1`,
          moduleId: updatedModules[0].id,
          moduleNumber: 1,
          topic: `${code.trim()} Core Principles`,
          difficulty: 'Foundational',
          isDiagnostic: true,
          question: `Which fundamental principle is prioritized in ${code.trim()} (${name.trim()}) according to ${professor.trim() || 'the instructor'}?`,
          options: [
            `Understanding the underlying causal mechanisms and specific rubric definitions`,
            `Relying solely on external internet forum summaries`,
            `Skipping foundational prerequisites during calculations`,
            `Ignoring professor lecture emphasis points`,
          ],
          correctIndex: 0,
          professorNoteCitation: `Lecture 1, Slide 10: "Course Foundations & Framing"`,
          professorExactFraming: `The professor emphasizes adhering strictly to the lecture's conceptual definitions.`,
          whyGenericAnswersFail: `Standard internet definitions fail to match the instructor's grading criteria.`,
        },
      ],
      embeddedFiles: courseToEdit?.embeddedFiles || [],
    };

    onSaveCourse(finalCourse);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-subtle rounded-card border border-ink shadow-card p-6 sm:p-8 overflow-hidden text-ink">
        {/* Top Header */}
        <div className="flex items-start justify-between pb-4 border-b border-line">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-ink text-white flex items-center justify-center font-bold shadow-card">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-ink text-white text-[10px] font-bold uppercase tracking-wider mb-0.5">
                {isEditing ? 'Edit Existing Class' : 'Create Custom Class'}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">
                {isEditing ? `Edit ${courseToEdit.code}` : 'Add Your Own Class'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-soft text-ink transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 my-5 max-h-[68vh] overflow-y-auto pr-1">
          {/* Quick presets for new classes */}
          {!isEditing && (
            <div className="p-3 rounded-2xl bg-soft border border-line text-xs">
              <div className="text-[10px] font-bold uppercase text-ink mb-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-ink" /> Quick Class Presets:
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setCode('BIO 101');
                    setName('Cellular & Molecular Biology');
                    setProfessor('Prof. Jennifer Doudna, Ph.D.');
                    setModuleTitles([
                      'Cell Membranes & Transport',
                      'Enzyme Kinetics & Metabolism',
                      'DNA Replication & Expression',
                    ]);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-ink hover:text-white text-ink text-[11px] font-bold border border-line transition-colors cursor-pointer"
                >
                  + BIO 101: Cell Biology
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCode('HIST 150');
                    setName('Modern Global History');
                    setProfessor('Dr. Timothy Snyder, Ph.D.');
                    setModuleTitles([
                      'Industrialization & Imperialism',
                      'World Wars & Ideologies',
                      'Decolonization & Globalization',
                    ]);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-ink hover:text-white text-ink text-[11px] font-bold border border-line transition-colors cursor-pointer"
                >
                  + HIST 150: Global History
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCode('PSYCH 101');
                    setName('Introduction to Cognitive Psychology');
                    setProfessor('Prof. Steven Pinker, Ph.D.');
                    setModuleTitles([
                      'Sensory Perception & Attention',
                      'Memory Architecture & Recall',
                      'Language Acquisition & Reasoning',
                    ]);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-ink hover:text-white text-ink text-[11px] font-bold border border-line transition-colors cursor-pointer"
                >
                  + PSYCH 101: Cognitive Psych
                </button>
              </div>
            </div>
          )}

          {/* Course Code & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink mb-1">
                Class Code *
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. MGT 301, BIO 101"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-line focus:border-ink text-xs font-bold uppercase text-ink outline-hidden shadow-card"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink mb-1">
                Full Course Title *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Strategic Management & Org Behavior"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-line focus:border-ink text-xs font-bold text-ink outline-hidden shadow-card"
              />
            </div>
          </div>

          {/* Professor Name & Term */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink mb-1">
                Professor / Instructor
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  value={professor}
                  onChange={(e) => setProfessor(e.target.value)}
                  placeholder="e.g. Prof. Harrison Miller, Ph.D."
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-line focus:border-ink text-xs font-semibold text-ink outline-hidden shadow-card"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink mb-1">
                Semester Term
              </label>
              <input
                type="text"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Fall 2026"
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-line focus:border-ink text-xs font-semibold text-ink outline-hidden shadow-card"
              />
            </div>
          </div>

          {/* Term Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink mb-1">
                Term Start Date
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="date"
                  aria-label="Term start date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-line focus:border-ink text-xs font-semibold text-ink outline-hidden"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink mb-1">
                Term End Date
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="date"
                  aria-label="Term end date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-line focus:border-ink text-xs font-semibold text-ink outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Course Modules / Units Setup */}
          <div className="pt-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-ink mb-1.5">
              Course Modules & Syllabus Units ({moduleTitles.length})
            </label>

            <div className="space-y-1.5 mb-2.5">
              {moduleTitles.map((modTitle, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 p-2 px-3 rounded-xl bg-white border border-line text-xs"
                >
                  <span className="flex items-center gap-2 font-bold text-ink">
                    <span className="w-5 h-5 rounded-md bg-ink text-white text-[10px] flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <span className="truncate max-w-[280px] sm:max-w-sm">{modTitle}</span>
                  </span>

                  {moduleTitles.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveModule(idx)}
                      aria-label={`Remove ${modTitle}`}
                      className="text-ink hover:text-ink p-1 rounded-md hover:bg-subtle transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add Module Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newModuleInput}
                onChange={(e) => setNewModuleInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddModule();
                  }
                }}
                placeholder="Add another module topic (e.g. Unit 4: Case Studies)..."
                className="grow px-3 py-2 rounded-xl bg-white border border-line focus:border-ink text-xs font-medium text-ink outline-hidden"
              />
              <button
                type="button"
                onClick={handleAddModule}
                className="px-3.5 py-2 rounded-xl bg-ink hover:bg-ink text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5 text-white" /> Add
              </button>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-2.5">
            {isEditing && canDelete && onDeleteCourse && courseToEdit ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Are you sure you want to remove ${courseToEdit.code}?`)) {
                    onDeleteCourse(courseToEdit.id);
                    onClose();
                  }
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-full bg-subtle text-ink hover:bg-soft text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Class</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full bg-soft hover:bg-soft text-ink font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-ink hover:bg-ink text-xs font-bold shadow-card border border-ink flex items-center gap-1.5 cursor-pointer transition-transform active:scale-95 text-white"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-ink" />
                <span>{isEditing ? 'Save Changes' : 'Create & Lock In Class'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
