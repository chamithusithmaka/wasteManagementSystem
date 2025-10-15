import React from 'react';
import Badge from './Badge';

interface SlotProps {
  slot: {
    id: string;
    date: string;
    window: string;
    capacityLeft: number;
    recommended: boolean;
  };
  selected: boolean;
  onSelect: () => void;
}

const SlotItem: React.FC<SlotProps> = ({ slot, selected, onSelect }) => {
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    });
  };
  
  return (
    <div 
      onClick={onSelect}
      className={`
        border rounded-xl p-4 cursor-pointer transition-all
        ${selected ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-200 hover:border-blue-300'}
        ${slot.recommended ? 'border-green-200 bg-green-50' : ''}
      `}
    >
      <div className="flex justify-between items-center">
        <div>
          <div className="font-medium">{formatDate(slot.date)}</div>
          <div className="text-gray-700">{slot.window}</div>
          <div className="text-sm text-gray-500 mt-1">
            {slot.capacityLeft} {slot.capacityLeft === 1 ? 'slot' : 'slots'} remaining
          </div>
        </div>
        <div className="flex gap-2 items-center">
          {slot.recommended && <Badge variant="success">Recommended</Badge>}
          <div className={`h-6 w-6 rounded-full border-2 flex-shrink-0 ${selected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
            {selected && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlotItem;