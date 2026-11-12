import type React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  DIFFICULTY_LABELS,
  type Difficulty,
} from '@shared/api.interface';

interface DifficultyBadgeProps {
  difficulty: Difficulty;
}

const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({ difficulty }) => {
  const styleMap: Record<Difficulty, string> = {
    easy: 'bg-status-easy/15 text-status-easy border-status-easy/30 hover-elevate',
    medium:
      'bg-status-medium/15 text-status-medium border-status-medium/30 hover-elevate',
    hard: 'bg-status-hard/15 text-status-hard border-status-hard/30 hover-elevate',
  };

  return (
    <Badge
      variant="outline"
      className={styleMap[difficulty]}
    >
      {DIFFICULTY_LABELS[difficulty]}
    </Badge>
  );
};

export default DifficultyBadge;
