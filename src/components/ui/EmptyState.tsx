import Link from 'next/link';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  actionIcon?: ReactNode;
}

// Friendly empty-state card shown when a page has no data yet.
export default function EmptyState({ icon, title, description, actionLabel, actionHref, actionIcon }: EmptyStateProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex flex-col items-center text-center px-6 py-16">
        <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center text-violet-500 mb-5">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="text-sm text-gray-500 mt-2 max-w-sm">{description}</p>
        )}
        {actionLabel && actionHref && (
          <Link
            href={actionHref}
            className="mt-6 inline-flex items-center gap-2 remo-gradient text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {actionIcon}
            {actionLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
