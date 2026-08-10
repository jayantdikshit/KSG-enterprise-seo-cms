import React from 'react';
import { Input } from '@/components/admin/ui/forms/Input';
import { Select } from '@/components/admin/ui/forms/Select';
import { RichTextEditor } from '@/components/admin/common/RichTextEditor';

interface EditorProps {
  properties: any;
  onChange: (properties: any) => void;
}

export function ImageTextEditor({ properties, onChange }: EditorProps) {
  const handleChange = (field: string, value: any) => {
    onChange({ ...properties, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Heading"
          value={properties.heading || ''}
          onChange={(e) => handleChange('heading', e.target.value)}
        />
        <Select
          label="Image Position"
          value={properties.imagePosition || 'left'}
          onChange={(e) => handleChange('imagePosition', e.target.value)}
          options={[
            { label: 'Left', value: 'left' },
            { label: 'Right', value: 'right' }
          ]}
        />
        <div className="md:col-span-2">
          <Input
            label="Image URL"
            value={properties.imageUrl || ''}
            onChange={(e) => handleChange('imageUrl', e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Content</label>
        <RichTextEditor
          value={properties.content || ''}
          onChange={(val) => handleChange('content', val)}
        />
      </div>
    </div>
  );
}
