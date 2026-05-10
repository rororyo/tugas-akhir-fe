interface ConfidenceBarProps {
  confidence: number;
}

export function ConfidenceBar({ confidence }: ConfidenceBarProps) {
  return (
    <div className="flex items-center space-x-2">
      <div className="flex-1 bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${
            confidence >= 0.8 ? 'bg-red-500' :
            confidence >= 0.6 ? 'bg-yellow-500' :
            'bg-green-500'
          }`}
          style={{ width: `${confidence * 100}%` }}
        />
      </div>
      <span className="text-gray-900 font-semibold text-sm">
        {(confidence * 100).toFixed(1)}%
      </span>
    </div>
  );
}