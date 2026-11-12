import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  DRIZZLE_DATABASE,
  type PostgresJsDatabase,
} from '@lark-apaas/fullstack-nestjs-core';
import {
  college,
  course,
  examPaper,
  subject,
} from '@server/database/schema';
import { sql } from 'drizzle-orm';
import { and, asc, count, desc, eq } from 'drizzle-orm';
import type {
  Course,
  CourseListResponse,
  ExamPaper,
} from '@shared/api.interface';
import type { CourseListQueryDto } from './course.dto';

@Injectable()
export class CourseService {
  private readonly logger = new Logger(CourseService.name);

  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
  ) {}

  async getCourses(query: CourseListQueryDto): Promise<CourseListResponse> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 12;

    try {
      const conditions: Parameters<typeof and>[number][] = [];
      if (query.collegeId) {
        conditions.push(eq(course.collegeId, query.collegeId));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const countBase = this.db.select({ count: count() }).from(course);
      const [countResult] = whereClause
        ? await countBase.where(whereClause)
        : await countBase;

      const total = Number(countResult.count) || 0;

      const baseQuery = this.db
        .select({
          id: course.id,
          name: course.name,
          code: course.code,
          collegeId: course.collegeId,
          subjectId: course.subjectId,
          teacher: course.teacher,
          credit: course.credit,
          description: course.description,
          viewCount: course.viewCount,
          paperCount: count(examPaper.id),
        })
        .from(course)
        .leftJoin(examPaper, eq(examPaper.courseId, course.id))
        .groupBy(course.id)
        .orderBy(asc(course.name))
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      const rows = whereClause
        ? await baseQuery.where(whereClause)
        : await baseQuery;

      const items: Course[] = rows.map((row) => ({
        id: row.id,
        name: row.name,
        code: row.code,
        collegeId: row.collegeId,
        subjectId: row.subjectId ?? undefined,
        teacher: row.teacher ?? undefined,
        credit: row.credit ? Number(row.credit) : undefined,
        description: row.description ?? undefined,
        viewCount: row.viewCount ?? 0,
        paperCount: Number(row.paperCount) || 0,
      }));

      return { items, total, page, pageSize };
    } catch (error) {
      this.logger.error('获取课程列表失败', error);
      throw error;
    }
  }

  async getCourseDetail(id: string): Promise<Course> {
    try {
      const rows = await this.db
        .select({
          id: course.id,
          name: course.name,
          code: course.code,
          collegeId: course.collegeId,
          subjectId: course.subjectId,
          teacher: course.teacher,
          credit: course.credit,
          description: course.description,
          viewCount: course.viewCount,
          collegeName: college.name,
          subjectName: subject.name,
          paperCount: count(examPaper.id),
        })
        .from(course)
        .leftJoin(college, eq(college.id, course.collegeId))
        .leftJoin(subject, eq(subject.id, course.subjectId))
        .leftJoin(examPaper, eq(examPaper.courseId, course.id))
        .where(eq(course.id, id))
        .groupBy(course.id, college.id, subject.id);

      if (rows.length === 0) {
        throw new NotFoundException('课程不存在');
      }

      const row = rows[0];
      return {
        id: row.id,
        name: row.name,
        code: row.code,
        collegeId: row.collegeId,
        subjectId: row.subjectId ?? undefined,
        teacher: row.teacher ?? undefined,
        credit: row.credit ? Number(row.credit) : undefined,
        description: row.description ?? undefined,
        viewCount: row.viewCount ?? 0,
        collegeName: row.collegeName ?? undefined,
        subjectName: row.subjectName ?? undefined,
        paperCount: Number(row.paperCount) || 0,
      };
    } catch (error) {
      this.logger.error(`获取课程详情失败: ${id}`, error);
      throw error;
    }
  }

  async getCoursePapers(courseId: string): Promise<ExamPaper[]> {
    try {
      const courseRow = await this.db
        .select({ id: course.id })
        .from(course)
        .where(eq(course.id, courseId))
        .limit(1);

      if (courseRow.length === 0) {
        throw new NotFoundException('课程不存在');
      }

      const rows = await this.db
        .select()
        .from(examPaper)
        .where(eq(examPaper.courseId, courseId))
        .orderBy(
          desc(examPaper.academicYear),
          desc(examPaper.semester),
          desc(examPaper.createdAt),
        );

      return rows.map((row) => ({
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
      }));
    } catch (error) {
      this.logger.error(`获取课程试卷列表失败: ${courseId}`, error);
      throw error;
    }
  }

  async incrementView(id: string): Promise<{ success: boolean; viewCount: number }> {
    try {
      const updated = await this.db
        .update(course)
        .set({ viewCount: sql`${course.viewCount} + 1` })
        .where(eq(course.id, id))
        .returning({ viewCount: course.viewCount });

      if (updated.length === 0) {
        throw new NotFoundException('课程不存在');
      }

      return { success: true, viewCount: updated[0].viewCount ?? 0 };
    } catch (error) {
      this.logger.error(`增加课程浏览次数失败: ${id}`, error);
      throw error;
    }
  }
}
