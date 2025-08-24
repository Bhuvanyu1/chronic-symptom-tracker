import React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface SymptomSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  color: 'red' | 'green' | 'yellow' | 'blue';
  lowLabel: string;
  highLabel: string;
}

export default function SymptomSlider({ 
  label, 
  value, 
  onChange, 
  color, 
  lowLabel, 
  highLabel 
}: SymptomSliderProps) {
  const getColorClasses = () => {
    switch (color) {
      case 'red':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'green':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'yellow':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'blue':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getValueColor = () => {
    if (value <= 3) return 'text-red-600';
    if (value <= 6) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">{label}</Label>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getColorClasses()}`}>
          {value}/10
        </div>
      </div>
      
      <div className="px-3">
        <Slider
          value={[value]}
          onValueChange={(values) => onChange(values[0])}
          max={10}
          min={1}
          step={1}
          className="w-full"
        />
      </div>
      
      <div className="flex justify-between text-xs text-gray-500 px-3">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}
