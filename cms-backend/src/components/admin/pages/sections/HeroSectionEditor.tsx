import React from 'react';
import { Input } from '@/components/admin/ui/forms/Input';
import { Textarea } from '@/components/admin/ui/forms/Textarea';

interface EditorProps {
  properties: any;
  onChange: (properties: any) => void;
}

export function HeroSectionEditor({ properties, onChange }: EditorProps) {
  const handleChange = (field: string, value: any) => {
    onChange({ ...properties, [field]: value });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input
        label="Headline"
        value={properties.heading || ''}
        onChange={(e) => handleChange('heading', e.target.value)}
      />
      <Input
        label="Background Image URL"
        value={properties.backgroundImage || ''}
        onChange={(e) => handleChange('backgroundImage', e.target.value)}
      />
      <div className="md:col-span-2">
        <Textarea
          label="Subheadline"
          value={properties.subheading || ''}
          onChange={(e) => handleChange('subheading', e.target.value)}
          rows={2}
        />
      </div>
      <Input
        label="Button Text"
        value={properties.buttonText || ''}
        onChange={(e) => handleChange('buttonText', e.target.value)}
      />
      <Input
        label="Button URL"
        value={properties.buttonUrl || ''}
        onChange={(e) => handleChange('buttonUrl', e.target.value)}
      />
    </div>
  );
}
