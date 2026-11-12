import { logger } from '@lark-apaas/client-toolkit/logger';
import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';
import type {
  College,
  Subject,
  CourseListResponse,
} from '@shared/api.interface';

/**
 * 获取学院列表
 */
export const getColleges = async (): Promise<College[]> => {
  try {
    const res = await axiosForBackend.get('/api/colleges');
    return res.data;
  } catch (error) {
    logger.error('获取学院列表失败', error);
    throw error;
  }
};

/**
 * 获取学院下的学科列表
 */
export const getCollegeSubjects = async (
  collegeId: string,
): Promise<Subject[]> => {
  try {
    const res = await axiosForBackend.get(
      `/api/colleges/${collegeId}/subjects`,
    );
    return res.data;
  } catch (error) {
    logger.error(`获取学院学科列表失败: ${collegeId}`, error);
    throw error;
  }
};

/**
 * 获取学院下的课程列表
 */
export const getCollegeCourses = async (
  collegeId: string,
  page = 1,
  pageSize = 20,
): Promise<CourseListResponse> => {
  try {
    const res = await axiosForBackend.get(
      `/api/colleges/${collegeId}/courses`,
      {
        params: { page, pageSize },
      },
    );
    return res.data;
  } catch (error) {
    logger.error(`获取学院课程列表失败: ${collegeId}`, error);
    throw error;
  }
};

/**
 * 获取带统计数据的学院列表
 */
export const getCollegesWithStats = async (): Promise<College[]> => {
  try {
    const res = await axiosForBackend.get('/api/colleges/with-stats');
    return res.data;
  } catch (error) {
    logger.error('获取学院统计列表失败', error);
    throw error;
  }
};
