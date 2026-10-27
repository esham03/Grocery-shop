import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionText,
  actionHref,
  onAction,
}) => {
  return (
    <div className="py-12 px-4 text-center max-w-md mx-auto flex flex-col items-center justify-center">
      <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 mb-4 shadow-soft">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-charcoal mb-2">{title}</h3>
      <p className="text-sm text-charcoal-muted mb-6 leading-relaxed">{description}</p>
      {actionText && actionHref && (
        <Link to={actionHref} className="btn-primary">
          {actionText}
        </Link>
      )}
      {actionText && !actionHref && onAction && (
        <button onClick={onAction} className="btn-primary">
          {actionText}
        </button>
      )}
    </div>
  );
};
