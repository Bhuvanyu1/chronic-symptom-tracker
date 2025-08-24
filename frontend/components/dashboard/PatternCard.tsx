import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, AlertTriangle, BarChart3 } from 'lucide-react';
import type { Pattern } from '~backend/symptom/types';

interface PatternCardProps {
  pattern: Pattern;
}

export default function PatternCard({ pattern }: PatternCardProps) {
  const getIcon = () => {
    switch (pattern.type) {
      case 'trend':
        return pattern.data?.trend > 0 ? TrendingUp : TrendingDown;
      case 'trigger':
        return AlertTriangle;
      case 'correlation':
        return BarChart3;
      default:
        return BarChart3;
    }
  };

  const getColor = () => {
    switch (pattern.type) {
      case 'trend':
        return pattern.data?.trend > 0 ? 'text-red-600' : 'text-green-600';
      case 'trigger':
        return 'text-orange-600';
      case 'correlation':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getBgColor = () => {
    switch (pattern.type) {
      case 'trend':
        return pattern.data?.trend > 0 ? 'bg-red-50' : 'bg-green-50';
      case 'trigger':
        return 'bg-orange-50';
      case 'correlation':
        return 'bg-blue-50';
      default:
        return 'bg-gray-50';
    }
  };

  const Icon = getIcon();
  const confidence = Math.round(pattern.confidence * 100);

  return (
    <Card className={`${getBgColor()} border-l-4 ${getColor().replace('text-', 'border-')}`}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-full ${getBgColor()}`}>
            <Icon className={`h-5 w-5 ${getColor()}`} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 mb-1">
              {pattern.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 capitalize">
                {pattern.type}
              </span>
              <span className="text-xs text-gray-600">
                {confidence}% confidence
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
