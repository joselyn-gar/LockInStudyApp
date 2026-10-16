export type StarryMood =
  | 'waving'
  | 'zoomed_face'
  | 'focused'
  | 'stressed'
  | 'triumphant'
  | 'thinking'
  | 'eating'
  | 'supercharged';

export interface StarFeedingState {
  fullness: number; // 0 to 100
  availableTreats: number; // unfed treats from study points
  totalTreatsFed: number; // lifetime fed treats
  level: number; // Star evolution stage (1 to 5)
  stageTitle: string; // e.g. "Level 3: Radiant Starlight"
  lastFedAt?: string;
  hungerState: 'starving' | 'hungry' | 'content' | 'energized' | 'locked_in_full';
}

export type MilestoneMode = 'post_exam_only' | 'cumulative_review';

export interface ModuleItem {
  id: string;
  number: number;
  title: string;
  masteryPercentage: number;
  totalQuestions: number;
  masteredQuestions: number;
  status: 'locked_in' | 'in_review' | 'needs_drill';
  topics: string[];
  isPostExam: boolean; // Whether content belongs to post-Exam 1 scope
}

export interface PastExamItem {
  id: string;
  semester: string;
  examName: string;
  questionNumber: string;
  questionText: string;
  coreConcept: string;
  historicalMissRate: number; // e.g. 42%
  professorRubricNote: string;
}

export interface LectureNoteItem {
  id: string;
  lectureNumber: number;
  title: string;
  slideReference: string;
  professorQuote: string;
  professorFraming: string;
  genericTextbookContrast: string;
}

export interface StudyQuestion {
  id: string;
  moduleId: string;
  moduleNumber: number;
  topic: string;
  difficulty: 'Foundational' | 'Applied' | 'Synthesis';
  question: string;
  options: string[];
  correctIndex: number;
  // Crucial "Professor Notes Only" fields
  professorNoteCitation: string;
  professorExactFraming: string;
  whyGenericAnswersFail: string;
  pastExamLink?: string;
  isDiagnostic?: boolean;
}

export interface ForecastItem {
  id: string;
  topic: string;
  probabilityScore: number;
  confidenceLevel: 'High' | 'Very High' | 'Medium';
  pastExamAnchor: string;
  lectureNoteAnchor: string;
  professorFraming: string;
  whyWillBeTested: string;
  forecastedQuestion: {
    question: string;
    options: string[];
    correctIndex: number;
    professorExplanation: string;
    pitfallWarning: string;
  };
}

export type EmbeddedFileType = 'past_exam' | 'lecture_notes' | 'course_content' | 'syllabus_rubric';

export interface EmbeddedFileItem {
  id: string;
  name: string;
  size: string;
  type: EmbeddedFileType;
  uploadedAt: string;
  courseCode: string;
  summary?: string;
  parsedItemsCount?: number;
  extractedQuestions?: StudyQuestion[];
}

export interface CourseMilestone {
  id: string;
  name: string;
  date: string;
  isCompleted: boolean;
  coverageModules: number[];
}

export interface CourseData {
  id: string;
  code: string;
  name: string;
  professor: string;
  term: string;
  startDate: string;
  endDate: string;
  milestones: CourseMilestone[];
  modules: ModuleItem[];
  pastExams: PastExamItem[];
  lectureNotes: LectureNoteItem[];
  questions: StudyQuestion[];
  embeddedFiles?: EmbeddedFileItem[];
}

export interface CanvasConfig {
  patToken: string;
  domain: string;
  semesterLabel: string;
  termStartDate: string;
  termEndDate: string;
  lastSyncedAt?: string;
  isConnected: boolean;
}

export interface DailyProgressPoint {
  date: string;
  fullDate?: string;
  xpEarned: number;
  cumulativeXp: number;
  masteryPercentage: number;
  questionsAnswered: number;
  focusArea?: string;
}
