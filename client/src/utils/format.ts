/**
 * 格式化文件大小
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * 格式化数字（千/万简写）
 */
export const formatCount = (num: number): string => {
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}万+`;
  }
  if (num >= 1000) {
    return `${Math.floor(num / 100) / 10}k`;
  }
  return String(num);
};
