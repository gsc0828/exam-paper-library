import type React from 'react';
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Eye,
  Download,
  ArrowLeft,
  FileText,
  BookOpen,
  Calendar,
  FileType,
  HardDrive,
  GraduationCap,
  Check,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Image from '@/components/ui/image';
import PaperCard from '@/components/PaperCard';
import DifficultyBadge from '@/components/DifficultyBadge';
import { examPaperApi, courseApi } from '@/api';
import { formatFileSize, formatCount } from '@/utils/format';
import {
  PAPER_TYPE_LABELS,
  type ExamPaper,
} from '@shared/api.interface';

const PLACEHOLDER_IMG =
  '/spark/app/app_17hq3t85egk/runtime/api/v1/storage/object/bucket_aadk6fnoa2kos_static/static%2Faadk6fgohhwbu_ve_miaoda';

const PaperDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [downloaded, setDownloaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const { data: paper, isLoading: paperLoading } = useQuery({
    queryKey: ['paperDetail', id],
    queryFn: () => examPaperApi.getPaperDetail(id || ''),
    enabled: !!id,
  });

  const { data: coursePapers } = useQuery({
    queryKey: ['coursePapers', paper?.courseId],
    queryFn: () => courseApi.getCoursePapers(paper?.courseId || ''),
    enabled: !!paper?.courseId,
  });

  useEffect(() => {
    if (id) {
      examPaperApi.incrementPaperView(id).catch(() => {});
    }
  }, [id]);

  const relatedPapers = (coursePapers || [])
    .filter((p: ExamPaper) => p.id !== id)
    .slice(0, 4);

  const handleDownload = async () => {
    if (!id || isDownloading) return;
    setIsDownloading(true);
    try {
      const result = await examPaperApi.incrementPaperDownload(id);
      if (result.fileUrl) {
        window.open(result.fileUrl, '_blank');
        setDownloaded(true);
      }
    } catch {
      // 错误已在 API 层记录
    } finally {
      setIsDownloading(false);
    }
  };

  if (!id) return null;

  const InfoRow: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
    link?: string;
  }> = ({ icon, label, value, link }) => (
    <div className="flex items-start gap-3 py-2">
      <div className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className="text-sm font-medium text-foreground">
          {link ? (
            <Link
              to={link}
              className="text-accent hover:underline truncate block"
            >
              {value}
            </Link>
          ) : (
            value
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        返回列表
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧预览区 */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="bg-muted p-4 flex items-center justify-center min-h-[400px]">
              {paperLoading ? (
                <Skeleton className="w-full aspect-[4/3] rounded-lg max-w-2xl" />
              ) : paper?.previewImageUrl || paper ? (
                <div className="relative w-full max-w-2xl">
                  <Image
                    src={paper.previewImageUrl || PLACEHOLDER_IMG}
                    alt={paper.title}
                    width={800}
                    quality={85}
                    className="w-full h-auto rounded-lg border-2 border-border shadow-lg"
                  />
                </div>
              ) : null}
            </div>
            <CardContent className="p-4 text-center text-sm text-muted-foreground border-t border-border">
              预览图仅供参考，完整内容请下载原文件
            </CardContent>
          </Card>
        </div>

        {/* 右侧信息区 */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-5">
              {paperLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-7 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="space-y-2 pt-4">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                  </div>
                  <Skeleton className="h-10 w-full rounded-lg mt-4" />
                </div>
              ) : paper ? (
                <>
                  <h1 className="text-xl font-bold text-foreground font-display leading-tight mb-2">
                    {paper.title}
                  </h1>
                  <div className="flex items-center gap-2 mb-4">
                    <DifficultyBadge difficulty={paper.difficulty} />
                    <Badge variant="outline">
                      {PAPER_TYPE_LABELS[paper.paperType]}
                    </Badge>
                  </div>

                  <div className="divide-y divide-border">
                    <InfoRow
                      icon={<BookOpen className="w-5 h-5" />}
                      label="课程"
                      value={paper.courseName || '—'}
                      link={`/course/${paper.courseId}`}
                    />
                    <InfoRow
                      icon={<Calendar className="w-5 h-5" />}
                      label="学年学期"
                      value={`${paper.academicYear} · ${paper.semester}`}
                    />
                    <InfoRow
                      icon={<FileText className="w-5 h-5" />}
                      label="考试类型"
                      value={PAPER_TYPE_LABELS[paper.paperType]}
                    />
                    <InfoRow
                      icon={<GraduationCap className="w-5 h-5" />}
                      label="难度"
                      value={
                        <DifficultyBadge difficulty={paper.difficulty} />
                      }
                    />
                    <InfoRow
                      icon={<FileType className="w-5 h-5" />}
                      label="文件格式"
                      value={paper.fileType?.toUpperCase() || '—'}
                    />
                    <InfoRow
                      icon={<HardDrive className="w-5 h-5" />}
                      label="文件大小"
                      value={
                        <span className="tnum">
                          {formatFileSize(paper.fileSize)}
                        </span>
                      }
                    />
                    <InfoRow
                      icon={<Eye className="w-5 h-5" />}
                      label="浏览次数"
                      value={
                        <span className="tnum">
                          {formatCount(paper.viewCount)}
                        </span>
                      }
                    />
                    <InfoRow
                      icon={<Download className="w-5 h-5" />}
                      label="下载次数"
                      value={
                        <span className="tnum">
                          {formatCount(paper.downloadCount)}
                        </span>
                      }
                    />
                  </div>

                  <Button
                    size="lg"
                    className="w-full mt-5 h-12 text-base"
                    onClick={handleDownload}
                    disabled={isDownloading}
                    variant={downloaded ? 'secondary' : 'default'}
                  >
                    {downloaded ? (
                      <>
                        <Check className="w-5 h-5" />
                        已下载
                      </>
                    ) : isDownloading ? (
                      <>下载中...</>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        下载试卷
                      </>
                    )}
                  </Button>
                </>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 相关推荐 */}
      {relatedPapers.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            相关试卷
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedPapers.map((paper: ExamPaper) => (
              <PaperCard key={paper.id} paper={paper} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaperDetailPage;
