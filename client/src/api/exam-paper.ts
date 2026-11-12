import { logger } from '@lark-apaas/client-toolkit/logger';
import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';
import type {
  ExamPaper,
  PaperListResponse,
} from '@shared/api.interface';

export interface GetPapersParams {
  page?: number;
  pageSize?: number;
  courseId?: string;
  collegeId?: string;
  subjectId?: string;
  difficulty?: string;
  academicYear?: string;
  paperType?: string;
  sortBy?: 'newest' | 'popular' | 'downloads';
}

/**
 * 获取试卷详情
 */
export const getPaperDetail = async (id: string): Promise<ExamPaper> => {
  try {
    const res = await axiosForBackend.get(`/api/papers/${id}`);
    return res.data;
  } catch (error) {
    logger.error(`获取试卷详情失败: ${id}`, error);
    throw error;
  }
};

/**
 * 获取试卷列表
 */
export const getPapers = async (
  params: GetPapersParams = {},
): Promise<PaperListResponse> => {
  try {
    const res = await axiosForBackend.get('/api/papers', { params });
    return res.data;
  } catch (error) {
    logger.error('获取试卷列表失败', error);
    throw error;
  }
};

/**
 * 获取热门试卷
 */
export const getHotPapers = async (
  limit = 8,
): Promise<ExamPaper[]> => {
  try {
    const res = await axiosForBackend.get('/api/papers/hot', {
      params: { limit },
    });
    return res.data;
  } catch (error) {
    logger.error('获取热门试卷失败', error);
    throw error;
  }
};

/**
 * 获取最近更新试卷
 */
export const getRecentPapers = async (
  limit = 8,
): Promise<ExamPaper[]> => {
  try {
    const res = await axiosForBackend.get('/api/papers/recent', {
      params: { limit },
    });
    return res.data;
  } catch (error) {
    logger.error('获取最近更新试卷失败', error);
    throw error;
  }
};

/**
 * 搜索试卷
 */
export const searchPapers = async (
  q: string,
  page = 1,
  pageSize = 20,
): Promise<PaperListResponse> => {
  try {
    const res = await axiosForBackend.get('/api/papers/search', {
      params: { q, page, pageSize },
    });
    return res.data;
  } catch (error) {
    logger.error(`搜索试卷失败: ${q}`, error);
    throw error;
  }
};

/**
 * 增加试卷浏览量
 */
export const incrementPaperView = async (id: string): Promise<void> => {
  try {
    await axiosForBackend.post(`/api/papers/${id}/view`);
  } catch (error) {
    logger.error(`增加试卷浏览量失败: ${id}`, error);
    throw error;
  }
};

/**
 * 增加试卷下载量并获取下载链接
 */
export const incrementPaperDownload = async (
  id: string,
): Promise<{ fileUrl: string }> => {
  try {
    const res = await axiosForBackend.post(`/api/papers/${id}/download`);
    return res.data;
  } catch (error) {
    logger.error(`获取试卷下载链接失败: ${id}`, error);
    throw error;
  }
};
