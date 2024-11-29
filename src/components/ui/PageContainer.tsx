import React, { ReactNode } from 'react';

interface PageContainerProps {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}

export function PageContainer({ icon, title, children }: PageContainerProps) {
  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-lg">
      <div className="flex items-center justify-center gap-2 mb-6">
        {icon}
        <h2 className="text-2xl font-bold text-gray-800 text-center">{title}</h2>
      </div>
      {children}
    </div>
  );
}