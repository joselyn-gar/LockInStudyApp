// Read-only views over existing course data. Nothing here changes scoring;
// it only reshapes what the app already stores for the new screens.
import { CourseData, CourseMilestone, ForecastItem, ModuleItem, StudyQuestion } from '../types';
import type { MasteryLevel } from '../components/ui';

const DAY_MS = 24 * 60 * 60 * 1000;

export const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const parseIso = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

export const daysUntil = (iso: string, from: string = todayIso()) =>
  Math.round((parseIso(iso).getTime() - parseIso(from).getTime()) / DAY_MS);

export const formatShortDate = (iso: string) => {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso || '';
  return parseIso(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export const courseMastery = (course: CourseData) => {
  if (!course.modules.length) return 0;
  return Math.round(course.modules.reduce((sum, m) => sum + m.masteryPercentage, 0) / course.modules.length);
};

export const weakestModule = (course: CourseData): ModuleItem | undefined =>
  [...course.modules].sort((a, b) => a.masteryPercentage - b.masteryPercentage)[0];

// Same thresholds the app already uses for module status (85 / 70).
export const masteryLevel = (pct: number): MasteryLevel =>
  pct >= 85 ? 'mastered' : pct >= 70 ? 'getting_there' : 'review';

export const AT_RISK_BELOW = 60;

export interface UpcomingExam {
  course: CourseData;
  milestone: CourseMilestone;
  daysLeft: number;
}

export const upcomingExams = (courses: CourseData[]): UpcomingExam[] =>
  courses
    .flatMap((course) =>
      course.milestones
        .filter((m) => !m.isCompleted)
        .map((milestone) => ({ course, milestone, daysLeft: daysUntil(milestone.date) }))
    )
    .filter((e) => e.daysLeft >= 0)
    .sort((a, b) => a.daysLeft - b.daysLeft);

export const nextExamFor = (course: CourseData) => upcomingExams([course])[0];

export const moduleRange = (milestone: CourseMilestone) => {
  const mods = [...(milestone.coverageModules || [])].sort((a, b) => a - b);
  if (!mods.length) return '';
  return mods.length === 1 ? `Module ${mods[0]}` : `Modules ${mods[0]}–${mods[mods.length - 1]}`;
};

// A forecast carries its own practice question. Turning the top forecasts into
// StudyQuestions lets "Play the top 3 topics" reuse the normal game screen.
export const forecastToQuestion = (fc: ForecastItem, course: CourseData): StudyQuestion => {
  const words = fc.topic.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
  const match = course.modules.find((m) =>
    [m.title, ...m.topics].some((t) => words.some((w) => t.toLowerCase().includes(w)))
  );
  return {
    id: `forecast-${fc.id}`,
    moduleId: match?.id || '',
    moduleNumber: match?.number || 0,
    topic: fc.topic,
    difficulty: 'Applied',
    question: fc.forecastedQuestion.question,
    options: fc.forecastedQuestion.options,
    correctIndex: fc.forecastedQuestion.correctIndex,
    professorNoteCitation: fc.lectureNoteAnchor,
    professorExactFraming: fc.forecastedQuestion.professorExplanation,
    whyGenericAnswersFail: fc.forecastedQuestion.pitfallWarning,
    pastExamLink: fc.pastExamAnchor,
  };
};

export const sourceTags = (course: CourseData) => {
  const tags: string[] = [];
  if (course.milestones.length) tags.push('Syllabus');
  const files = course.embeddedFiles || [];
  const slides = files.filter((f) => f.type === 'lecture_notes').length + course.lectureNotes.length;
  const exams = files.filter((f) => f.type === 'past_exam').length + course.pastExams.length;
  const other = files.filter((f) => f.type === 'course_content' || f.type === 'syllabus_rubric').length;
  if (slides) tags.push(`${slides} lecture ${slides === 1 ? 'note' : 'notes'}`);
  if (exams) tags.push(`${exams} past exam ${exams === 1 ? 'question' : 'questions'}`);
  if (other) tags.push(`${other} uploaded ${other === 1 ? 'file' : 'files'}`);
  if (course.modules.length) tags.push(`${course.modules.length} modules`);
  return tags;
};
