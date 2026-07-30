import React from 'react';

export const PostSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 animate-pulse space-y-4 mb-4">
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 bg-slate-200 rounded-full" />
      <div className="space-y-1.5 flex-1">
        <div className="h-4 bg-slate-200 rounded w-1/3" />
        <div className="h-3 bg-slate-200 rounded w-1/4" />
      </div>
    </div>
    <div className="w-full h-64 bg-slate-200 rounded-xl" />
    <div className="h-4 bg-slate-200 rounded w-3/4" />
    <div className="h-3 bg-slate-200 rounded w-1/2" />
  </div>
);

export const ProductSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 animate-pulse space-y-3">
    <div className="w-full h-44 bg-slate-200 rounded-xl" />
    <div className="h-4 bg-slate-200 rounded w-3/4" />
    <div className="h-3 bg-slate-200 rounded w-1/2" />
    <div className="flex justify-between items-center pt-2">
      <div className="h-5 bg-slate-200 rounded w-1/3" />
      <div className="h-8 bg-slate-200 rounded-lg w-1/3" />
    </div>
  </div>
);

export const ChatSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl p-3 border border-slate-100 animate-pulse flex items-center space-x-3 mb-2">
    <div className="w-12 h-12 bg-slate-200 rounded-full" />
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-slate-200 rounded w-1/2" />
      <div className="h-3 bg-slate-200 rounded w-3/4" />
    </div>
  </div>
);
