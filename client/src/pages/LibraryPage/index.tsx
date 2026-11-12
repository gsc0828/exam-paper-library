import type React from 'react';
import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Grid3X3, List, RotateCcw, FileQuestion } from 'lucide-react';

import PaperCard from '@/components/PaperCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

import { examPaperApi, collegeApi } from '@/api';
import {
  DIFFICULTIES,
  DIFFICULTY_LABELS,
  type Difficulty,
  type ExamPaper,
  type College,
  type Subject,
} from '@shared/api.interface';

const PAGE_SIZE = 12;

/* ---------- 生成可学年选项 ---------- */
const generateAcademicYears = (): string[] => {
  const years: string[] = [];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear; y >= currentYear - 5; y -= 1) {
    years.push(`${y - 1}-${y}`);
  }
  return years;
};
const ACADEMIC_YEARS = generateAcademicYears();

const SEMESTER_OPTIONS = ['第一学期', '第二学期'];

const SORT_OPTIONS = [
  { value: 'newest', label: '最新上传' },
  { value: 'popular', label: '最多浏览' },
  { value: 'downloads', label: '最多下载' },
];

/* ---------- 试卷卡片骨架 ---------- */
const PaperCardSkeleton: React.FC = () => (
  <div className="bg-card border border-border rounded-lg overflow-hidden">
    <Skeleton className="aspect-[4/3] w-full rounded-none" />
    <div className="p-4 space-y-2">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex gap-4 pt-1">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  </div>
);

/* ---------- 分页页码 ---------- */
const getPageNumbers = (current: number, total: number): (number | 'ellipsis')[] => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | 'ellipsis')[] = [1];
  if (current > 3) pages.push('ellipsis');
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i += 1) pages.push(i);
  if (current < total - 2) pages.push('ellipsis');
  pages.push(total);
  return pages;
};

/* ---------- 左侧筛选面板 ---------- */
interface FilterPanelProps {
  searchParams: URLSearchParams;
  updateParams: (updates: Record<string, string | string[] | undefined>) => void;
  onReset: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  searchParams,
  updateParams,
  onReset,
}) => {
  const collegeId = searchParams.get('college') || '';
  const subjectId = searchParams.get('subject') || '';
  const difficulties = searchParams.getAll('difficulty');
  const academicYear = searchParams.get('year') || '';
  const semester = searchParams.get('semester') || '';
  const sort = searchParams.get('sort') || 'newest';

  const { data: colleges, isLoading: collegesLoading } = useQuery({
    queryKey: ['colleges'],
    queryFn: () => collegeApi.getColleges(),
  });

  const { data: subjects, isLoading: subjectsLoading } = useQuery({
    queryKey: ['subjects', collegeId],
    queryFn: () => collegeId ? collegeApi.getCollegeSubjects(collegeId) : Promise.resolve([]),
    enabled: !!collegeId,
  });

  const handleDifficultyChange = (diff: Difficulty, checked: boolean) => {
    const next = new Set(difficulties as Difficulty[]);
    if (checked) next.add(diff);
    else next.delete(diff);
    updateParams({ difficulty: next.size > 0 ? Array.from(next) : undefined });
  };

  return (
    <aside className="w-full lg:w-[260px] shrink-0">
      <div className="bg-card border border-border rounded-lg p-4 space-y-6 sticky top-20">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-semibold text-foreground">筛选条件</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-primary"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            重置
          </Button>
        </div>

        {/* 学院筛选 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">学院</label>
          <Select
            value={collegeId}
            onValueChange={(val) => {
              // 切换学院时清空学科
              updateParams({ college: val || undefined, subject: undefined });
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="全部学院" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">全部学院</SelectItem>
              {colleges?.map((c: College) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {collegesLoading && <Skeleton className="h-9 w-full rounded-md" />}
        </div>

        {/* 学科筛选 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">学科</label>
          {!collegeId ? (
            <Select disabled>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="请先选择学院" />
              </SelectTrigger>
              <SelectContent />
            </Select>
          ) : (
            <Select
              value={subjectId}
              onValueChange={(val) =>
                updateParams({ subject: val || undefined })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="全部学科" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部学科</SelectItem>
                {subjects?.map((s: Subject) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {subjectsLoading && <Skeleton className="h-9 w-full rounded-md" />}
        </div>

        {/* 难度筛选 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">难度</label>
          <div className="space-y-2">
            {DIFFICULTIES.map((diff: Difficulty) => (
              <label
                key={diff}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <Checkbox
                  checked={difficulties.includes(diff)}
                  onCheckedChange={(checked) =>
                    handleDifficultyChange(diff, Boolean(checked))
                  }
                />
                <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                  {DIFFICULTY_LABELS[diff]}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* 学年学期 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">学年学期</label>
          <div className="space-y-2">
            <Select
              value={academicYear}
              onValueChange={(val) =>
                updateParams({ year: val || undefined })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="全部学年" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部学年</SelectItem>
                {ACADEMIC_YEARS.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y} 学年
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={semester}
              onValueChange={(val) =>
                updateParams({ semester: val || undefined })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="全部学期" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部学期</SelectItem>
                {SEMESTER_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 排序方式 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">排序方式</label>
          <Select
            value={sort}
            onValueChange={(val) => updateParams({ sort: val })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </aside>
  );
};

/* ---------- 试卷库页面 ---------- */
const LibraryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get('page') || '1');
  const collegeId = searchParams.get('college') || undefined;
  const subjectId = searchParams.get('subject') || undefined;
  const difficulties = searchParams.getAll('difficulty');
  const academicYear = searchParams.get('year') || undefined;
  const semester = searchParams.get('semester') || undefined;
  const sort = searchParams.get('sort') || 'newest';

  /* 更新 URL 参数，保留其他参数 */
  const updateParams = useCallback(
    (updates: Record<string, string | string[] | undefined>) => {
      const next = new URLSearchParams(searchParams);
      // 翻页重置为 1
      next.delete('page');
      Object.entries(updates).forEach(([key, val]) => {
        next.delete(key);
        if (val === undefined || val === '') return;
        if (Array.isArray(val)) {
          val.forEach((v) => next.append(key, v));
        } else {
          next.set(key, val);
        }
      });
      setSearchParams(next, { replace: false });
    },
    [searchParams, setSearchParams],
  );

  const resetFilters = useCallback(() => {
    setSearchParams({}, { replace: false });
  }, [setSearchParams]);

  /* 组装请求参数 */
  const queryParams = useMemo(() => {
    return {
      page,
      pageSize: PAGE_SIZE,
      collegeId,
      subjectId,
      difficulty: difficulties.length > 0 ? difficulties.join(',') : undefined,
      academicYear,
      semester,
      sortBy: sort || 'newest',
    };
  }, [page, collegeId, subjectId, difficulties, academicYear, semester, sort]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['papers', 'list', queryParams],
    queryFn: () => examPaperApi.getPapers(queryParams),
    placeholderData: keepPreviousData,
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;
  const pageNumbers = getPageNumbers(page, totalPages);

  const handlePageChange = (newPage: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(newPage));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="rise">
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 左侧筛选 */}
          <FilterPanel
            searchParams={searchParams}
            updateParams={updateParams}
            onReset={resetFilters}
          />

          {/* 右侧内容 */}
          <div className="flex-1 min-w-0">
            {/* 顶部：统计 + 视图切换 */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                共 <span className="tnum font-medium text-foreground">{data?.total ?? 0}</span> 份试卷
              </p>
              <div className="flex items-center gap-1 bg-card border border-border rounded-md p-0.5">
                <button
                  aria-label="网格视图"
                  className="p-1.5 rounded-sm text-primary bg-primary/10"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  aria-label="列表视图"
                  className="p-1.5 rounded-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 试卷列表 */}
            {isLoading && !data ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <PaperCardSkeleton key={i} />
                ))}
              </div>
            ) : isError ? (
              <div className="text-center py-16 text-muted-foreground">
                加载失败，请稍后重试
              </div>
            ) : data && data.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <FileQuestion className="w-16 h-16 text-muted-foreground/50 mb-4" />
                <h3 className="font-display text-lg font-semibold text-foreground mb-1">
                  没有找到符合条件的试卷
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  试试调整筛选条件，或者查看其他学院的试卷
                </p>
                <Button variant="outline" onClick={resetFilters}>
                  重置筛选
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {data?.items.map((paper: ExamPaper) => (
                    <PaperCard key={paper.id} paper={paper} />
                  ))}
                </div>

                {/* 分页 */}
                {totalPages > 1 && (
                  <div className="mt-10">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => handlePageChange(Math.max(1, page - 1))}
                            aria-disabled={page <= 1}
                            className={page <= 1 ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                        {pageNumbers.map((p, idx) =>
                          p === 'ellipsis' ? (
                            <PaginationItem key={`ellipsis-${idx}`}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          ) : (
                            <PaginationItem key={p}>
                              <PaginationLink
                                isActive={p === page}
                                onClick={() => handlePageChange(p)}
                                className="cursor-pointer"
                              >
                                {p}
                              </PaginationLink>
                            </PaginationItem>
                          ),
                        )}
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                            aria-disabled={page >= totalPages}
                            className={page >= totalPages ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LibraryPage;
