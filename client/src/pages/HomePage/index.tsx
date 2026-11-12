import type React from 'react';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, ArrowRight } from 'lucide-react';
import { logger } from '@lark-apaas/client-toolkit/logger';

import PaperCard from '@/components/PaperCard';
import CollegeCard from '@/components/CollegeCard';
import { Skeleton } from '@/components/ui/skeleton';
import Image from '@/components/ui/image';

import { examPaperApi } from '@/api';
import { collegeApi } from '@/api';

import type { ExamPaper, College } from '@shared/api.interface';

const HERO_IMG =
  '/spark/app/app_17hq3t85egk/runtime/api/v1/storage/object/bucket_aadk6fnoa2kos_static/static%2Faadk6flgpoukw_ve_miaoda';

/* ---------- Hero 区块 ---------- */
const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      navigate(`/search?q=${encodeURIComponent(q)}`);
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-[hsl(42_60%_94%)] to-[hsl(35_55%_90%)]">
      <div className="max-w-[1200px] mx-auto px-6 py-16 md:py-20 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* 左侧文案 + 搜索 */}
          <div className="space-y-6 rise">
            <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] font-bold leading-tight text-foreground">
              历年期末试卷库
            </h1>
            <p className="text-lg text-muted-foreground max-w-md">
              汇聚全校各学院历年期末真题，助你高效备考
            </p>
            <form onSubmit={handleSearch} className="relative max-w-lg">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索课程名称、代码或教师..."
                className="w-full pl-12 pr-4 h-14 bg-card border border-border rounded-xl text-base shadow-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </form>
          </div>

          {/* 右侧配图 */}
          <div className="relative hidden lg:block">
            <div className="absolute -top-6 -right-6 w-full h-full bg-primary/10 rounded-2xl -rotate-3" />
            <Image
              src={HERO_IMG}
              alt="历年试卷插图"
              width={560}
              quality={80}
              className="relative w-full rounded-xl shadow-lg rotate-1 hover:rotate-0 transition-transform duration-500"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

/* ---------- 区块标题 ---------- */
interface SectionHeaderProps {
  title: string;
  moreHref?: string;
  moreText?: string;
}
const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  moreHref,
  moreText = '查看更多',
}) => (
  <div className="flex items-center justify-between mb-6">
    <h2 className="font-display text-2xl font-bold text-foreground">{title}</h2>
    {moreHref && (
      <Link
        to={moreHref}
        className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors group"
      >
        {moreText}
        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
      </Link>
    )}
  </div>
);

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

/* ---------- 试卷网格区块 ---------- */
interface PaperSectionProps {
  title: string;
  moreHref: string;
  queryKey: string[];
  queryFn: () => Promise<ExamPaper[]>;
}
const PaperSection: React.FC<PaperSectionProps> = ({
  title,
  moreHref,
  queryKey,
  queryFn,
}) => {
  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn,
  });

  return (
    <section className="py-8">
      <div className="max-w-[1200px] mx-auto px-6">
        <SectionHeader title={title} moreHref={moreHref} />
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <PaperCardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-12 text-muted-foreground">
            加载失败，请稍后重试
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {data?.map((paper: ExamPaper) => (
              <PaperCard key={paper.id} paper={paper} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

/* ---------- 学院卡片骨架 ---------- */
const CollegeCardSkeleton: React.FC = () => (
  <div className="p-6 bg-card border border-border rounded-lg">
    <div className="flex flex-col items-center text-center space-y-3">
      <Skeleton className="h-10 w-10 rounded-md" />
      <div className="space-y-1 w-full">
        <Skeleton className="h-5 w-20 mx-auto" />
        <Skeleton className="h-3 w-16 mx-auto" />
      </div>
    </div>
  </div>
);

/* ---------- 学院分类区块 ---------- */
const CollegeSection: React.FC = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['colleges', 'with-stats'],
    queryFn: () => collegeApi.getCollegesWithStats(),
  });

  return (
    <section className="py-8">
      <div className="max-w-[1200px] mx-auto px-6">
        <SectionHeader title="按学院浏览" />
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <CollegeCardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-12 text-muted-foreground">
            加载失败，请稍后重试
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {data?.map((college: College) => (
              <CollegeCard key={college.id} college={college} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

/* ---------- 首页 ---------- */
const HomePage: React.FC = () => {
  return (
    <div className="rise">
      <HeroSection />
      <PaperSection
        title="热门试卷"
        moreHref="/library?sort=popular"
        queryKey={['papers', 'hot', '8']}
        queryFn={() => examPaperApi.getHotPapers(8)}
      />
      <PaperSection
        title="最近更新"
        moreHref="/library?sort=newest"
        queryKey={['papers', 'recent', '8']}
        queryFn={() => examPaperApi.getRecentPapers(8)}
      />
      <CollegeSection />
    </div>
  );
};

export default HomePage;
