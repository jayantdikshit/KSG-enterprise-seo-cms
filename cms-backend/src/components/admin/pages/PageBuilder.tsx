import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

import { PageSection } from '@/types/page.types';
import { SortableSection } from './sections/SortableSection';

// Editors
import { HeroSectionEditor } from './sections/HeroSectionEditor';
import { TextBlockEditor } from './sections/TextBlockEditor';
import { ImageTextEditor } from './sections/ImageTextEditor';
import { GalleryEditor } from './sections/GalleryEditor';
import { CustomHTMLEditor } from './sections/CustomHTMLEditor';

// (Optional, if we want to migrate everything to sections)
// import { CTASectionEditor } from './sections/CTASectionEditor';
// import { FAQSectionEditor } from './sections/FAQSectionEditor';
// import { TestimonialEditor } from './sections/TestimonialEditor';

const SECTION_TYPES = [
  { type: 'HERO', label: 'Hero Banner' },
  { type: 'TEXT_BLOCK', label: 'Text Block' },
  { type: 'IMAGE_TEXT', label: 'Image + Text' },
  { type: 'GALLERY', label: 'Gallery' },
  { type: 'CUSTOM_HTML', label: 'Custom HTML' },
  { type: 'CTA', label: 'Call To Action' },
  { type: 'FAQ', label: 'FAQ List' },
  { type: 'TESTIMONIALS', label: 'Testimonials' }
];

interface PageBuilderProps {
  sections: PageSection[];
  onChange: (sections: PageSection[]) => void;
}

export function PageBuilder({ sections = [], onChange }: PageBuilderProps) {
  const [isAdding, setIsAdding] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);
      
      const newSections = arrayMove(sections, oldIndex, newIndex);
      // Update order property
      newSections.forEach((s, idx) => s.order = idx);
      onChange(newSections);
    }
  };

  const handleAddSection = (type: string) => {
    const newSection: PageSection = {
      id: uuidv4(),
      type,
      properties: {},
      order: sections.length
    };
    onChange([...sections, newSection]);
    setIsAdding(false);
  };

  const handleRemoveSection = (id: string) => {
    const newSections = sections.filter((s) => s.id !== id);
    newSections.forEach((s, idx) => s.order = idx);
    onChange(newSections);
  };

  const handleUpdateProperties = (id: string, properties: any) => {
    const newSections = sections.map((s) => 
      s.id === id ? { ...s, properties } : s
    );
    onChange(newSections);
  };

  const renderEditor = (section: PageSection) => {
    const props = {
      properties: section.properties,
      onChange: (props: any) => handleUpdateProperties(section.id, props)
    };

    switch (section.type) {
      case 'HERO': return <HeroSectionEditor {...props} />;
      case 'TEXT_BLOCK': return <TextBlockEditor {...props} />;
      case 'IMAGE_TEXT': return <ImageTextEditor {...props} />;
      case 'GALLERY': return <GalleryEditor {...props} />;
      case 'CUSTOM_HTML': return <CustomHTMLEditor {...props} />;
      // For now fallback to custom HTML or empty for unsupported
      default: return <div className="text-gray-500 italic p-4 text-sm">Editor for {section.type} coming soon. You can use the structured fields below instead.</div>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Page Sections Builder</h2>
        <div className="relative">
          <button 
            type="button" 
            onClick={() => setIsAdding(!isAdding)}
            className="text-sm bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 px-3 py-1.5 rounded-md font-medium flex items-center transition-colors"
          >
            <Plus className="w-4 h-4 mr-1" /> Add Section
          </button>
          
          {isAdding && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-xl rounded-md border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
              <ul className="py-1">
                {SECTION_TYPES.map(st => (
                  <li key={st.type}>
                    <button
                      type="button"
                      onClick={() => handleAddSection(st.type)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {st.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {sections.length === 0 ? (
        <div className="text-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">No sections added yet.</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Click "Add Section" to start building your page layout.</p>
        </div>
      ) : (
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={sections.map(s => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {sections.sort((a, b) => a.order - b.order).map((section) => (
              <SortableSection key={section.id} section={section} onRemove={handleRemoveSection}>
                {renderEditor(section)}
              </SortableSection>
            ))}
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
