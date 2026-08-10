import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import { PageSection } from '@/types/page.types';

interface SortableSectionProps {
  section: PageSection;
  onRemove: (id: string) => void;
  children: React.ReactNode;
}

export function SortableSection({ section, onRemove, children }: SortableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white dark:bg-gray-800 shadow rounded-lg border ${
        isDragging ? 'border-indigo-500 shadow-lg' : 'border-gray-200 dark:border-gray-700'
      } mb-4 overflow-hidden relative`}
    >
      <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500"
          >
            <GripVertical className="w-5 h-5" />
          </div>
          <span className="font-semibold text-gray-700 dark:text-gray-200 uppercase text-sm tracking-wider">
            {section.type.replace('_', ' ')}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onRemove(section.id)}
          className="text-gray-400 hover:text-red-500 transition-colors p-1"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}
