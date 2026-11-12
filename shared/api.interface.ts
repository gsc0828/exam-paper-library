export const PAPER_TYPES = ['final', 'midterm', 'quiz', 'makeup'] as const;
export type PaperType = (typeof PAPER_TYPES)[number];
export const isPaperType = (v: string): v is PaperType =>
  (PAPER_TYPES as readonly string[]).includes(v);
export const PAPER_TYPE_LABELS: Record<PaperType, string> = {
  final: '期末考试',
  midterm: '期中考试',
  quiz: '小测验',
  makeup: '补考',
};

export const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];
export const isDifficulty = (v: string): v is Difficulty =>
  (DIFFICULTIES as readonly string[]).includes(v);
export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
};

export const SEMESTERS = ['第一学期', '第二学期'] as const;
export type Semester = (typeof SEMESTERS)[number];

export interface College {
  id: string;
  name: string;
  code: string;
  description?: string;
  icon?: string;
  sortOrder: number;
  paperCount?: number;
  courseCount?: number;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  collegeId: string;
  description?: string;
  sortOrder: number;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  collegeId: string;
  subjectId?: string;
  teacher?: string;
  credit?: number;
  description?: string;
  viewCount: number;
  collegeName?: string;
  subjectName?: string;
  paperCount?: number;
}

export interface ExamPaper {
  id: string;
  courseId: string;
  title: string;
  academicYear: string;
  semester: string;
  paperType: PaperType;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  previewImageUrl?: string;
  viewCount: number;
  downloadCount: number;
  description?: string;
  difficulty: Difficulty;
  createdAt: string;
  courseName?: string;
  courseCode?: string;
  teacher?: string;
  collegeName?: string;
}

export interface PaperListResponse {
  items: ExamPaper[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CourseListResponse {
  items: Course[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SearchResultItem {
  id: string;
  type: 'paper' | 'course';
  title: string;
  subtitle?: string;
  paper?: ExamPaper;
  course?: Course;
}

export interface SearchResponse {
  items: SearchResultItem[];
  total: number;
  page: number;
  pageSize: number;
}
