import type React from 'react';
import { Link } from 'react-router-dom';
import type { College } from '@shared/api.interface';

interface CollegeCardProps {
  college: College;
  onClick?: () => void;
}

const CollegeCard: React.FC<CollegeCardProps> = ({ college, onClick }) => {
  const handleClick = () => {
    onClick?.();
  };

  return (
    <Link
      to={`/library?college=${college.id}`}
      onClick={handleClick}
      className="block p-6 bg-card border border-border rounded-lg hover:border-primary hover:bg-card hover:shadow-md transition-all duration-200 group"
    >
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="text-4xl group-hover:scale-110 transition-transform duration-200">
          {college.icon || '🏛️'}
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
            {college.name}
          </h3>
          <p className="text-xs text-muted-foreground">
            <span className="tnum">{college.paperCount ?? 0}</span> 份试卷
          </p>
        </div>
      </div>
    </Link>
  );
};

export default CollegeCard;
