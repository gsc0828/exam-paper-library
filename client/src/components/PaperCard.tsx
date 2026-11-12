import type React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Download } from 'lucide-react';
import Image from '@/components/ui/image';
import DifficultyBadge from '@/components/DifficultyBadge';
import { formatCount } from '@/utils/format';
import type { ExamPaper } from '@shared/api.interface';

interface PaperCardProps {
  paper: ExamPaper;
  onClick?: () => void;
}

const PLACEHOLDER_IMG =
  '/spark/app/app_17hq3t85egk/runtime/api/v1/storage/object/bucket_aadk6fnoa2kos_static/static%2Faadk6fgohhwbu_ve_miaoda';

const PaperCard: React.FC<PaperCardProps> = ({ paper, onClick }) => {
  const handleClick = () => {
    onClick?.();
  };

  return (
    <Link
      to={`/paper/${paper.id}`}
      onClick={handleClick}
      className="paper-card block bg-card border border-border rounded-lg overflow-hidden group"
    >
      {/* 预览图 */}
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        <Image
          src={paper.previewImageUrl || PLACEHOLDER_IMG}
          alt={paper.title}
          width={400}
          quality={75}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
        <div className="absolute top-3 right-3">
          <DifficultyBadge difficulty={paper.difficulty} />
        </div>
      </div>

      {/* 内容区 */}
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-foreground text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {paper.courseName || paper.title}
        </h3>
        <p className="text-sm text-muted-foreground">
          {paper.academicYear} · {paper.semester}
        </p>
        <div className="flex items-center gap-4 pt-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            <span className="tnum">{formatCount(paper.viewCount)}</span>
          </span>
          <span className="flex items-center gap-1">
            <Download className="w-3.5 h-3.5" />
            <span className="tnum">{formatCount(paper.downloadCount)}</span>
          </span>
        </div>
      </div>
    </Link>
  );
};

export default PaperCard;
