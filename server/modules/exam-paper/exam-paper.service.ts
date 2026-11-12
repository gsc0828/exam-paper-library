import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  DRIZZLE_DATABASE,
  type PostgresJsDatabase,
} from '@lark-apaas/fullstack-nestjs-core';
import {
  college,
  course,
  examPaper,
} from '@server/database/schema';
import {
  and,
  asc,
  count,
  desc,
  eq,
  sql,
} from 'drizzle-orm';
import type { ExamPaper, PaperListResponse } from '@shared/api.interface';
import type {
  PaperListQueryDto,
  PaperSearchQueryDto,
} from './exam-paper.dto';

type PaperSortBy = 'newest' | 'popular' | 'downloads';

@Injectable()
export class ExamPaperService {
  private readonly logger = new Logger(ExamPaperService.name);

  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
  ) {}

  private mapPaperRow(row: {
    id: string;
    courseId: string;
    title: string;
    academicYear: string;
    semester: string;
    paperType: string | null;
    fileUrl: string;
    fileName: string;
    fileType: string | null;
    fileSize: number | null;
    previewImageUrl: string | null;
    viewCount: number | null;
    downloadCount: number | null;
    description: string | null;
    difficulty: string | null;
    createdAt: Date;
    courseName?: string | null;
    courseCode?: string | null;
    teacher?: string | null;
    collegeName?: string | null;
  }): ExamPaper {
    return {
      id: row.id,
      courseId: row.courseId,
      title: row.title,
      academicYear: row.academicYear,
      semester: row.semester,
      paperType: (row.paperType ?? 'final') as ExamPaper['paperType'],
      fileUrl: row.fileUrl,
      fileName: row.fileName,
      fileType: row.fileType ?? 'pdf',
      fileSize: Number(row.fileSize) || 0,
      previewImageUrl: row.previewImageUrl ?? undefined,
      viewCount: row.viewCount ?? 0,
      downloadCount: row.downloadCount ?? 0,
      description: row.description ?? undefined,
      difficulty: (row.difficulty ?? 'medium') as ExamPaper['difficulty'],
      createdAt: row.createdAt.toISOString(),
      courseName: row.courseName ?? undefined,
      courseCode: row.courseCode ?? undefined,
      teacher: row.teacher ?? undefined,
      collegeName: row.collegeName ?? undefined,
    };
  }

  async getPaperDetail(id: string): Promise<ExamPaper> {
    try {
      const rows = await this.db
        .select({
          id: examPaper.id,
          courseId: examPaper.courseId,
          title: examPaper.title,
          academicYear: examPaper.academicYear,
          semester: examPaper.semester,
          paperType: examPaper.paperType,
          fileUrl: examPaper.fileUrl,
          fileName: examPaper.fileName,
          fileType: examPaper.fileType,
          fileSize: examPaper.fileSize,
          previewImageUrl: examPaper.previewImageUrl,
          viewCount: examPaper.viewCount,
          downloadCount: examPaper.downloadCount,
          description: examPaper.description,
          difficulty: examPaper.difficulty,
          createdAt: examPaper.createdAt,
          courseName: course.name,
          courseCode: course.code,
          teacher: course.teacher,
          collegeName: college.name,
        })
        .from(examPaper)
        .leftJoin(course, eq(course.id, examPaper.courseId))
        .leftJoin(college, eq(college.id, course.collegeId))
        .where(eq(examPaper.id, id));

      if (rows.length === 0) {
        throw new NotFoundException('试卷不存在');
      }

      return this.mapPaperRow(rows[0]);
    } catch (error) {
      this.logger.error(`获取试卷详情失败: ${id}`, error);
      throw error;
    }
  }

  async getPapers(query: PaperListQueryDto): Promise<PaperListResponse> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 12;
    const sortBy = (query.sortBy ?? 'newest') as PaperSortBy;

    try {
      const conditions: Parameters<typeof and>[number][] = [];

      if (query.collegeId) {
        conditions.push(eq(course.collegeId, query.collegeId));
      }
      if (query.subjectId) {
        conditions.push(eq(course.subjectId, query.subjectId));
      }
      if (query.courseId) {
        conditions.push(eq(examPaper.courseId, query.courseId));
      }
      if (query.difficulty) {
        conditions.push(eq(examPaper.difficulty, query.difficulty));
      }
      if (query.academicYear) {
        conditions.push(eq(examPaper.academicYear, query.academicYear));
      }
      if (query.semester) {
        conditions.push(eq(examPaper.semester, query.semester));
      }
      if (query.paperType) {
        conditions.push(eq(examPaper.paperType, query.paperType));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Count
      const countBase = this.db
        .select({ count: count() })
        .from(examPaper)
        .leftJoin(course, eq(course.id, examPaper.courseId));

      const [countResult] = whereClause
        ? await countBase.where(whereClause)
        : await countBase;

      const total = Number(countResult.count) || 0;

      // Sort order
      let orderClause;
      switch (sortBy) {
        case 'popular':
          orderClause = desc(examPaper.viewCount);
          break;
        case 'downloads':
          orderClause = desc(examPaper.downloadCount);
          break;
        case 'newest':
        default:
          orderClause = desc(examPaper.createdAt);
      }

      // Data
      const dataBase = this.db
        .select({
          id: examPaper.id,
          courseId: examPaper.courseId,
          title: examPaper.title,
          academicYear: examPaper.academicYear,
          semester: examPaper.semester,
          paperType: examPaper.paperType,
          fileUrl: examPaper.fileUrl,
          fileName: examPaper.fileName,
          fileType: examPaper.fileType,
          fileSize: examPaper.fileSize,
          previewImageUrl: examPaper.previewImageUrl,
          viewCount: examPaper.viewCount,
          downloadCount: examPaper.downloadCount,
          description: examPaper.description,
          difficulty: examPaper.difficulty,
          createdAt: examPaper.createdAt,
          courseName: course.name,
          courseCode: course.code,
          teacher: course.teacher,
          collegeName: college.name,
        })
        .from(examPaper)
        .leftJoin(course, eq(course.id, examPaper.courseId))
        .leftJoin(college, eq(college.id, course.collegeId))
        .orderBy(orderClause, desc(examPaper.id))
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      const rows = whereClause ? await dataBase.where(whereClause) : await dataBase;

      const items: ExamPaper[] = rows.map((row) => this.mapPaperRow(row));

      return { items, total, page, pageSize };
    } catch (error) {
      this.logger.error('获取试卷列表失败', error);
      throw error;
    }
  }

  async getHotPapers(limit: number = 8): Promise<ExamPaper[]> {
    try {
      const rows = await this.db
        .select({
          id: examPaper.id,
          courseId: examPaper.courseId,
          title: examPaper.title,
          academicYear: examPaper.academicYear,
          semester: examPaper.semester,
          paperType: examPaper.paperType,
          fileUrl: examPaper.fileUrl,
          fileName: examPaper.fileName,
          fileType: examPaper.fileType,
          fileSize: examPaper.fileSize,
          previewImageUrl: examPaper.previewImageUrl,
          viewCount: examPaper.viewCount,
          downloadCount: examPaper.downloadCount,
          description: examPaper.description,
          difficulty: examPaper.difficulty,
          createdAt: examPaper.createdAt,
          courseName: course.name,
          courseCode: course.code,
          teacher: course.teacher,
          collegeName: college.name,
        })
        .from(examPaper)
        .leftJoin(course, eq(course.id, examPaper.courseId))
        .leftJoin(college, eq(college.id, course.collegeId))
        .orderBy(desc(examPaper.viewCount), desc(examPaper.id))
        .limit(limit);

      return rows.map((row) => this.mapPaperRow(row));
    } catch (error) {
      this.logger.error('获取热门试卷失败', error);
      throw error;
    }
  }

  async getRecentPapers(limit: number = 8): Promise<ExamPaper[]> {
    try {
      const rows = await this.db
        .select({
          id: examPaper.id,
          courseId: examPaper.courseId,
          title: examPaper.title,
          academicYear: examPaper.academicYear,
          semester: examPaper.semester,
          paperType: examPaper.paperType,
          fileUrl: examPaper.fileUrl,
          fileName: examPaper.fileName,
          fileType: examPaper.fileType,
          fileSize: examPaper.fileSize,
          previewImageUrl: examPaper.previewImageUrl,
          viewCount: examPaper.viewCount,
          downloadCount: examPaper.downloadCount,
          description: examPaper.description,
          difficulty: examPaper.difficulty,
          createdAt: examPaper.createdAt,
          courseName: course.name,
          courseCode: course.code,
          teacher: course.teacher,
          collegeName: college.name,
        })
        .from(examPaper)
        .leftJoin(course, eq(course.id, examPaper.courseId))
        .leftJoin(college, eq(college.id, course.collegeId))
        .orderBy(desc(examPaper.createdAt), desc(examPaper.id))
        .limit(limit);

      return rows.map((row) => this.mapPaperRow(row));
    } catch (error) {
      this.logger.error('获取最近更新试卷失败', error);
      throw error;
    }
  }

  async searchPapers(query: PaperSearchQueryDto): Promise<PaperListResponse> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 12;
    const q = query.q?.trim() ?? '';

    try {
      if (!q) {
        // Empty query: return empty result
        return { items: [], total: 0, page, pageSize };
      }

      const pattern = `%${q}%`;

      const searchCondition = sql`
        ${course.name} ILIKE ${pattern}
        OR ${course.code} ILIKE ${pattern}
        OR ${course.teacher} ILIKE ${pattern}
        OR ${examPaper.title} ILIKE ${pattern}
        OR ${examPaper.academicYear} ILIKE ${pattern}
      `;

      const [countResult] = await this.db
        .select({ count: count() })
        .from(examPaper)
        .leftJoin(course, eq(course.id, examPaper.courseId))
        .where(searchCondition);

      const total = Number(countResult.count) || 0;

      const rows = await this.db
        .select({
          id: examPaper.id,
          courseId: examPaper.courseId,
          title: examPaper.title,
          academicYear: examPaper.academicYear,
          semester: examPaper.semester,
          paperType: examPaper.paperType,
          fileUrl: examPaper.fileUrl,
          fileName: examPaper.fileName,
          fileType: examPaper.fileType,
          fileSize: examPaper.fileSize,
          previewImageUrl: examPaper.previewImageUrl,
          viewCount: examPaper.viewCount,
          downloadCount: examPaper.downloadCount,
          description: examPaper.description,
          difficulty: examPaper.difficulty,
          createdAt: examPaper.createdAt,
          courseName: course.name,
          courseCode: course.code,
          teacher: course.teacher,
          collegeName: college.name,
        })
        .from(examPaper)
        .leftJoin(course, eq(course.id, examPaper.courseId))
        .leftJoin(college, eq(college.id, course.collegeId))
        .where(searchCondition)
        .orderBy(desc(examPaper.viewCount), desc(examPaper.id))
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      const items: ExamPaper[] = rows.map((row) => this.mapPaperRow(row));

      return { items, total, page, pageSize };
    } catch (error) {
      this.logger.error(`搜索试卷失败: ${q}`, error);
      throw error;
    }
  }

  async incrementView(id: string): Promise<{ success: boolean; viewCount: number }> {
    try {
      const updated = await this.db
        .update(examPaper)
        .set({ viewCount: sql`${examPaper.viewCount} + 1` })
        .where(eq(examPaper.id, id))
        .returning({ viewCount: examPaper.viewCount });

      if (updated.length === 0) {
        throw new NotFoundException('试卷不存在');
      }

      return { success: true, viewCount: updated[0].viewCount ?? 0 };
    } catch (error) {
      this.logger.error(`增加试卷浏览次数失败: ${id}`, error);
      throw error;
    }
  }

  async incrementDownload(
    id: string,
  ): Promise<{ success: boolean; downloadCount: number; fileUrl: string }> {
    try {
      const updated = await this.db
        .update(examPaper)
        .set({ downloadCount: sql`${examPaper.downloadCount} + 1` })
        .where(eq(examPaper.id, id))
        .returning({ downloadCount: examPaper.downloadCount, fileUrl: examPaper.fileUrl });

      if (updated.length === 0) {
        throw new NotFoundException('试卷不存在');
      }

      return {
        success: true,
        downloadCount: updated[0].downloadCount ?? 0,
        fileUrl: updated[0].fileUrl,
      };
    } catch (error) {
      this.logger.error(`增加试卷下载次数失败: ${id}`, error);
      throw error;
    }
  }
}
