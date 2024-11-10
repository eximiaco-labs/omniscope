import React from "react";

interface SectionHeaderProps {
  title: string;
  subtitle: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="flex items-center mb-3">
      <p className="text-sm font-semibold text-gray-900 uppercase">
        {title}{"  "}
        <span className="text-xs text-gray-600 uppercase">{subtitle}</span>
      </p>
      <div className="flex-grow h-px bg-gray-200 ml-2"></div>
    </div>
  );
};

export default SectionHeader;
