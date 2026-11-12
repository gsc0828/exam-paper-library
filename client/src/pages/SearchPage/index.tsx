import type React from 'react';
import { useMemo, useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Eye, FileText, GraduationCap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import PaperCard from '@/components/PaperCard';
import DifficultyBadge from '@/components/DifficultyBadge';
import { examPaperApi, courseApi, collegeApi } from '@/api';
import {
  DIFFICULTIES,
  type Difficulty,
  type ExamPaper,
  type Course,
} from '@shared/api.interface';

const PAGE_SIZE = 12;

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const [inputValue, setInputValue] = useState(q);
  const [activeTab, setActiveTab] = useState<'all' | 'paper' | 'course'>('all');
  const [selectedDifficulties, setSelectedDifficulties] = useState<Difficulty[]>([]);
  const [selectedCollege, setSelectedCollege] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    setInputValue(q);
    setPage(1);
  }, [q]);

  const { data: papers, isLoading: papersLoading } = useQuery({
    queryKey: ['searchPapers', q, page],
    queryFn: () => examPaperApi.searchPapers(q, page, PAGE_SIZE),
    enabled: q.length > 0 && activeTab !== 'course',
  });

  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ['searchCourses', q, page],
    queryFn: () =>
      courseApi.getCourses({ keyword: q, page, pageSize: PAGE_SIZE }),
    enabled: q.length > 0 && activeTab !== 'paper',
  });

  const { data: colleges } = useQuery({
    queryKey: ['colleges'],
    queryFn: () => collegeApi.getColleges(),
  });

  const filteredPapers = useMemo(() => {
    if (!papers?.items) return [];
    let result = papers.items;
    if (selectedDifficulties.length > 0) {
      result = result.filter((p: ExamPaper) =>
        selectedDifficulties.includes(p.difficulty),
      );
    }
    if (selectedCollege) {
      result = result.filter(
        (p: ExamPaper) => p.collegeName === selectedCollege,
      );
    }
    if (selectedYear) {
      result = result.filter(
        (p: ExamPaper) => p.academicYear === selectedYear,
      );
    }
    return result;
  }, [papers, selectedDifficulties, selectedCollege, selectedYear]);

  const filteredCourses = useMemo(() => {
    if (!courses?.items) return [];
    let result = courses.items;
    if (selectedCollege) {
      result = result.filter((c: Course) => c.collegeName === selectedCollege);
    }
    return result;
  }, [courses, selectedCollege]);

  const handleSearch = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set('q', value);
    } else {
      params.delete('q');
    }
    setSearchParams(params);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(inputValue);
    }
  };

  const toggleDifficulty = (diff: Difficulty) => {
    setSelectedDifficulties((prev) =>
      prev.includes(diff)
        ? prev.filter((d) => d !== diff)
        : [...prev, diff],
    );
  };

  const totalPapers = papers?.total || 0;
  const totalCourses = courses?.total || 0;
  const totalPages = papers
    ? Math.ceil(papers.total / papers.pageSize)
    : Math.ceil(totalCourses / PAGE_SIZE);

  const academicYears = useMemo(() => {
    if (!papers?.items) return [];
    const years = new Set<string>();
    papers.items.forEach((p: ExamPaper) => years.add(p.academicYear));
    return Array.from(years).sort().reverse();
  }, [papers]);

  const renderPaperSkeletons = () =>
    Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="space-y-3">
        <Skeleton className="aspect-[4/3] w-full rounded-lg" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    ));

  const renderCourseSkeletons = () =>
    Array.from({ length: 5 }).map((_, i) => (
      <Card key={i} className="p-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </Card>
    ));

  const renderPagination = (total: number, currentPage: number) => {
    const totalPg = Math.ceil(total / PAGE_SIZE);
    if (totalPg <= 1) return null;
    return (
      <div className="flex justify-center pt-6">
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            上一页
          </Button>
          <span className="px-3 text-sm text-muted-foreground tnum">
            {currentPage} / {totalPg}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(currentPage + 1)}
            disabled={currentPage >= totalPg}
          >
            下一页
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      <div className="max-w-5xl mx-auto mb-8">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="搜索课程名、试卷关键词..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="h-12 text-base"
          />
          <Button
            size="lg"
            onClick={() => handleSearch(inputValue)}
            className="h-12 px-6"
          >
            <Search className="w-5 h-5" />
            搜索
          </Button>
        </div>
        {q && (
          <p className="mt-3 text-sm text-muted-foreground">
            找到{' '}
            <span className="font-semibold text-foreground tnum">
              {totalPapers}
            </span>{' '}
            份试卷、
            <span className="font-semibold text-foreground tnum">
              {totalCourses}
            </span>{' '}
            门课程
          </p>
        )}
      </div>

      <div className="flex gap-6 flex-col lg:flex-row">
        {/* 左侧筛选面板 */}
        <aside className="w-full lg:w-56 shrink-0">
          <div className="bg-card border border-border rounded-lg p-4 space-y-5 sticky top-4">
            <div>
              <h3 className="text-sm font-semibold mb-3">结果类型</h3>
              <Tabs
                value={activeTab}
                onValueChange={(v) => {
                  setActiveTab(v as typeof activeTab);
                  setPage(1);
                }}
              >
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="all">全部</TabsTrigger>
                  <TabsTrigger value="paper">试卷</TabsTrigger>
                  <TabsTrigger value="course">课程</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3">难度</h3>
              <div className="space-y-2">
                {DIFFICULTIES.map((diff) => (
                  <label
                    key={diff}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedDifficulties.includes(diff)}
                      onCheckedChange={() => toggleDifficulty(diff)}
                    />
                    <DifficultyBadge difficulty={diff} />
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3">学院</h3>
              <Select value={selectedCollege} onValueChange={setSelectedCollege}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="全部学院" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部学院</SelectItem>
                  {colleges?.map((c) => (
                    <SelectItem key={c.id} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3">学年</h3>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="全部学年" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部学年</SelectItem>
                  {academicYears.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </aside>

        {/* 右侧结果 */}
        <main className="flex-1 min-w-0">
          {/* 试卷结果 */}
          {activeTab !== 'course' && (
            <div className={activeTab === 'all' ? 'mb-8' : ''}>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                相关试卷
              </h2>
              {papersLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {renderPaperSkeletons()}
                </div>
              ) : filteredPapers.length === 0 ? (
                <div
                  className={`text-center bg-card border border-border rounded-lg ${activeTab === 'paper' ? 'py-16' : 'py-8'}`}
                >
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">未找到相关试卷</p>
                  {activeTab === 'paper' && (
                    <p className="text-sm text-muted-foreground mt-1">
                      试试换个关键词？
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(activeTab === 'all'
                      ? filteredPapers.slice(0, 6)
                      : filteredPapers
                    ).map((paper: ExamPaper) => (
                      <PaperCard key={paper.id} paper={paper} />
                    ))}
                  </div>
                  {activeTab === 'paper' &&
                    renderPagination(totalPapers, page)}
                </>
              )}
            </div>
          )}

          {/* 课程结果 */}
          {activeTab !== 'paper' && (
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                相关课程
              </h2>
              {coursesLoading ? (
                <div className="space-y-3">{renderCourseSkeletons()}</div>
              ) : filteredCourses.length === 0 ? (
                <div
                  className={`text-center bg-card border border-border rounded-lg ${activeTab === 'course' ? 'py-16' : 'py-8'}`}
                >
                  <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">未找到相关课程</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(activeTab === 'all'
                    ? filteredCourses.slice(0, 5)
                    : filteredCourses
                  ).map((course: Course) => (
                    <Link
                      key={course.id}
                      to={`/course/${course.id}`}
                      className="block"
                    >
                      <Card className="hover:border-primary transition-colors cursor-pointer">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-foreground truncate">
                              {course.name}
                            </h3>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {course.teacher && (
                                <Badge
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {course.teacher}
                                </Badge>
                              )}
                              {course.collegeName && (
                                <Badge
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {course.collegeName}
                                </Badge>
                              )}
                              {course.credit && (
                                <Badge
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {course.credit} 学分
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-right text-sm text-muted-foreground ml-4 shrink-0">
                            <div className="flex items-center gap-1 justify-end">
                              <FileText className="w-4 h-4" />
                              <span className="tnum">
                                {course.paperCount || 0} 份试卷
                              </span>
                            </div>
                            <div className="flex items-center gap-1 justify-end mt-1">
                              <Eye className="w-4 h-4" />
                              <span className="tnum">{course.viewCount}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                  {activeTab === 'course' &&
                    renderPagination(totalCourses, page)}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SearchPage;
