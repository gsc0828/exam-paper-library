import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  DRIZZLE_DATABASE,
  type PostgresJsDatabase,
} from '@lark-apaas/fullstack-nestjs-core';
import { college, course, examPaper, subject } from '@server/database/schema';
import { asc, count, eq, sql } from 'drizzle-orm';
import type { College, Course, Subject, CourseListResponse } from '@shared/api.interface';
import type { CollegeCoursesQueryDto } from './college.dto';

@Injectable()
export class CollegeService {
  private readonly logger = new Logger(CollegeService.name);

  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
  ) {}

  async getColleges(): Promise<College[]> {
    try {
      const rows = await this.db
        .select({
          id: college.id,
          name: college.name,
          code: college.code,
          description: college.description,
          icon: college.icon,
          sortOrder: college.sortOrder,
          paperCount: count(examPaper.id),
        })
        .from(college)
        .leftJoin(course, eq(course.collegeId, college.id))
        .leftJoin(examPaper, eq(examPaper.courseId, course.id))
        .groupBy(college.id)
        .orderBy(asc(college.sortOrder));

      return rows.map((row) => ({
        id: row.id,
        name: row.name,
        code: row.code,
        description: row.description ?? undefined,
        icon: row.icon ?? undefined,
        sortOrder: row.sortOrder ?? 0,
        paperCount: Number(row.paperCount) || 0,
      }));
    } catch (error) {
      this.logger.error('获取学院列表失败', error);
      throw error;
    }
  }

  async getCollegesWithStats(): Promise<College[]> {
    try {
      const rows = await this.db
        .select({
          id: college.id,
          name: college.name,
          code: college.code,
          description: college.description,
          icon: college.icon,
          sortOrder: college.sortOrder,
          paperCount: count(examPaper.id),
          courseCount: sql<number>`count(distinct ${course.id})`,
        })
        .from(college)
        .leftJoin(course, eq(course.collegeId, college.id))
        .leftJoin(examPaper, eq(examPaper.courseId, course.id))
        .groupBy(college.id)
        .orderBy(asc(college.sortOrder));

      return rows.map((row) => ({
        id: row.id,
        name: row.name,
        code: row.code,
        description: row.description ?? undefined,
        icon: row.icon ?? undefined,
        sortOrder: row.sortOrder ?? 0,
        paperCount: Number(row.paperCount) || 0,
        courseCount: Number(row.courseCount) || 0,
      }));
    } catch (error) {
      this.logger.error('获取学院统计列表失败', error);
      throw error;
    }
  }

  async getSubjects(collegeId: string): Promise<Subject[]> {
    try {
      const collegeRow = await this.db
        .select({ id: college.id })
        .from(college)
        .where(eq(college.id, collegeId))
        .limit(1);

      if (collegeRow.length === 0) {
        throw new NotFoundException('学院不存在');
      }

      const rows = await this.db
        .select()
        .from(subject)
        .where(eq(subject.collegeId, collegeId))
        .orderBy(asc(subject.sortOrder));

      return rows.map((row) => ({
        id: row.id,
        name: row.name,
        code: row.code,
        collegeId: row.collegeId,
        description: row.description ?? undefined,
        sortOrder: row.sortOrder ?? 0,
      }));
    } catch (error) {
      this.logger.error(`获取学院学科列表失败: ${collegeId}`, error);
      throw error;
    }
  }

  async getCourses(
    collegeId: string,
    query: CollegeCoursesQueryDto,
  ): Promise<CourseListResponse> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 12;

    try {
      const collegeRow = await this.db
        .select({ id: college.id })
        .from(college)
        .where(eq(college.id, collegeId))
        .limit(1);

      if (collegeRow.length === 0) {
        throw new NotFoundException('学院不存在');
      }

      const [countResult] = await this.db
        .select({ count: count() })
        .from(course)
        .where(eq(course.collegeId, collegeId));

      const total = Number(countResult.count) || 0;

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
          paperCount: count(examPaper.id),
        })
        .from(course)
        .leftJoin(examPaper, eq(examPaper.courseId, course.id))
        .where(eq(course.collegeId, collegeId))
        .groupBy(course.id)
        .orderBy(asc(course.name))
        .limit(pageSize)
        .offset((page - 1) * pageSize);

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
      this.logger.error(`获取学院课程列表失败: ${collegeId}`, error);
      throw error;
    }
  }
}
