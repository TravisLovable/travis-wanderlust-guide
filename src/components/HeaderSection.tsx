
import React from 'react';

interface HeaderSectionProps {
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
}

const HeaderSection = ({ leftContent, rightContent }: HeaderSectionProps) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center space-x-4">
        {leftContent}
      </div>
      {rightContent && (
        <div className="flex items-center space-x-2">
          {rightContent}
        </div>
      )}
    </div>
  );
};

export default HeaderSection;
