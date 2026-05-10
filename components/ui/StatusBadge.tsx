import { CheckCircle, AlertTriangle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'safe' | 'suspicious';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  if (status === 'safe') {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
        <CheckCircle className="w-4 h-4 mr-1" />
        Aman
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
      <AlertTriangle className="w-4 h-4 mr-1" />
      Mencurigakan
    </span>
  );
}