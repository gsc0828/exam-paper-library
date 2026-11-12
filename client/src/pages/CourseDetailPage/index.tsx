import type React from 'react';
import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Eye,
  Download,
  FileText,
  GraduationCap,
  ArrowLeft,
  Building2,
  User,
  BookOpen,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import DifficultyBadge from '@/components/DifficultyBadge';
import { courseApi } from '@/api';
import { formatFileSize } from '@/utils/format';
import type { ExamPaper } from '@shared/api.interface';

const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['courseDetail', id],
    queryFn: () => courseApi.getCourseDetail(id || ''),
    enabled: !!id,
  });

  const { data: papers, isLoading: papersLoading } = useQuery({
    queryKey: ['coursePapers', id],
    queryFn: () => courseApi.getCoursePapers(id || ''),
    enabled: !!id,
  });

  useEffect(() => {
    if (id) {
      courseApi.incrementCourseView(id).catch(() => {});
    }
  }, [id]);

  // 按学年倒序分组，再按学期分组
  const groupedPapers = papers?.reduce<Record<string, Record<string, ExamPaper[]>>>(
    (acc, paper) => {
      const year = paper.academicYear;
      const semester = paper.semester;
      if (!acc[year]) acc[year] = {};
      if (!acc[year][semester]) acc[year][semester] = [];
      acc[year][semester].push(paper);
      return acc;
    },
    {},
  ) || {};

  const sortedYears = Object.keys(groupedPapers).sort().reverse();

  if (!id) return null;

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      <Link
        to="/library"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        返回试卷库
      </Link>

      {/* 课程信息 */}
      {courseLoading ? (
        <div className="bg-card border border-border rounded-lg p-6 mb-8 space-y-4">
          <Skeleton className="h-8 w-1/2" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ) : course ? (
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <div className="flex items-start gap-2 mb-3">
            <GraduationCap className="w-7 h-7 text-primary shrink-0 mt-1" />
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">
                {course.name}
              </h1>
              {course.code && (
                <p className="text-sm text-muted-foreground mt-1 tnum">
                  课程代码：{course.code}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {course.teacher && (
              <Badge variant="outline" className="gap-1">
                <User className="w-3 h-3" />
                {course.teacher}
              </Badge>
            )}
            {course.credit && (
              <Badge variant="outline" className="gap-1">
                <BookOpen className="w-3 h-3" />
                {course.credit} 学分
              </Badge>
            )}
            {course.collegeName && (
              <Badge variant="outline" className="gap-1">
                <Building2 className="w-3 h-3" />
                {course.collegeName}
              </Badge>
            )}
            {course.subjectName && (
              <Badge variant="outline">{course.subjectName}</Badge>
            )}
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground border-t border-border pt-4">
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              <span className="tnum">{course.viewCount}</span> 次浏览
            </span>
            <span className="flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              <span className="tnum">{course.paperCount || 0}</span> 份试卷
            </span>
          </div>

          {course.description && (
            <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
              {course.description}
            </p>
          )}
        </div>
      ) : null}

      {/* 试卷列表 */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          历年试卷（{papers?.length || 0} 份）
        </h2>

        {papersLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-lg p-4"
              >
                <Skeleton className="h-5 w-1/3 mb-2" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : sortedYears.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-lg">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">该课程暂无试卷</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedYears.map((year) => (
              <div key={year}>
                <h3 className="text-base font-semibold mb-3 text-foreground flex items-center gap-2">
                  <span className="w-1 h-5 bg-primary rounded-full" />
                  {year} 学年
                </h3>
                <div className="space-y-4">
                  {Object.entries(groupedPapers[year]).map(
                    ([semester, semesterPapers]) => (
                      <div key={semester}>
                        <p className="text-sm text-muted-foreground mb-2 pl-3">
                          {semester}
                        </p>
                        <div className="space-y-2">
                          {semesterPapers.map((paper) => (
                            <Link
                              key={paper.id}
                              to={`/paper/${paper.id}`}
                              className="block"
                            >
                              <div className="bg-card border border-border rounded-lg p-4 hover:bg-accent/30 hover:border-primary/50 transition-colors">
                                <div className="flex items-center justify-between gap-4">
                                  <div className="min-w-0 flex-1">
                                    <h4 className="font-medium text-foreground truncate">
                                      {paper.title}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                                      <DifficultyBadge
                                        difficulty={paper.difficulty}
                                      />
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {paper.paperType === 'final'
                                          ? '期末'
                                          : paper.paperType === 'midterm'
                                            ? '期中'
                                            : paper.paperType === 'makeup'
                                              ? '补考'
                                              : '测验'}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground tnum">
                                        {formatFileSize(paper.fileSize)}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground shrink-0">
                                    <span className="flex items-center gap-1">
                                      <Eye className="w-4 h-4" />
                                      <span className="tnum">
                                        {paper.viewCount}
                                      </span>
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Download className="w-4 h-4" />
                                      <span className="tnum">
                                        {paper.downloadCount}
                                      </span>
                                    </span>
                                    <div className="flex gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => {
                                          e.preventDefault();
                                        }}
                                      >
                                        预览
                                      </Button>
                                      <Button size="sm">下载</Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetailPage;
