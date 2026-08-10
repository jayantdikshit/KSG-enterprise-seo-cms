import React from 'react';
import { Textarea } from '@/components/admin/ui/forms/Textarea';

interface EditorProps {
  properties: any;
  onChange: (properties: any) => void;
}

export function CustomHTMLEditor({ properties, onChange }: EditorProps) {
  return (
    <div>
      <Textarea
        label="Custom HTML Code"
        value={properties.html || ''}
        onChange={(e) => onChange({ ...properties, html: e.target.value })}
        rows={6}
        placeholder="<div>...</div>"
        className="font-mono text-sm"
      />
    </div>
  );
}
