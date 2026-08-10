import React from 'react';
import { RichTextEditor } from '@/components/admin/common/RichTextEditor';

interface EditorProps {
  properties: any;
  onChange: (properties: any) => void;
}

export function TextBlockEditor({ properties, onChange }: EditorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Content</label>
      <RichTextEditor
        value={properties.content || ''}
        onChange={(val) => onChange({ ...properties, content: val })}
        placeholder="Write text block content here..."
      />
    </div>
  );
}
