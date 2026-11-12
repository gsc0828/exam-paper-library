import { logger } from '@lark-apaas/client-toolkit/logger';
import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';
import type {
  Course,
  ExamPaper,
  CourseListResponse,
} from '@shared/api.interface';

export interface GetCoursesParams {
  page?: number;
  pageSize?: number;
  collegeId?: string;
  subjectId?: string;
  keyword?: string;
}

/**
 * 获取课程详情
 */
export const getCourseDetail = async (id: string): Promise<Course> => {
  try {
    const res = await axiosForBackend.get(`/api/courses/${id}`);
    return res.data;
  } catch (error) {
    logger.error(`获取课程详情失败: ${id}`, error);
    throw error;
  }
};

/**
 * 获取课程下的试卷列表
 */
export const getCoursePapers = async (id: string): Promise<ExamPaper[]> => {
  try {
    const res = await axiosForBackend.get(`/api/courses/${id}/papers`);
    return res.data;
  } catch (error) {
    logger.error(`获取课程试卷列表失败: ${id}`, error);
    throw error;
  }
};

/**
 * 获取课程列表
 */
export const getCourses = async (
  params: GetCoursesParams = {},
): Promise<CourseListResponse> => {
  try {
    const res = await axiosForBackend.get('/api/courses', { params });
    return res.data;
  } catch (error) {
    logger.error('获取课程列表失败', error);
    throw error;
  }
};

/**
 * 增加课程浏览量
 */
export const incrementCourseView = async (id: string): Promise<void> => {
  try {
    await axiosForBackend.post(`/api/courses/${id}/view`);
  } catch (error) {
    logger.error(`增加课程浏览量失败: ${id}`, error);
    throw error;
  }
};
