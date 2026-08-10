import React from 'react';
import { Input } from '@/components/admin/ui/forms/Input';
import { Plus, Trash2 } from 'lucide-react';

interface EditorProps {
  properties: any;
  onChange: (properties: any) => void;
}

export function GalleryEditor({ properties, onChange }: EditorProps) {
  const images: string[] = properties.images || [];

  const addImage = () => {
    onChange({ ...properties, images: [...images, ''] });
  };

  const updateImage = (index: number, val: string) => {
    const newImages = [...images];
    newImages[index] = val;
    onChange({ ...properties, images: newImages });
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange({ ...properties, images: newImages });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Gallery Images</label>
        <button type="button" onClick={addImage} className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center">
          <Plus className="w-4 h-4 mr-1" /> Add Image
        </button>
      </div>
      
      {images.length === 0 && <p className="text-sm text-gray-500 italic">No images added yet.</p>}
      
      <div className="space-y-2">
        {images.map((img, idx) => (
          <div key={idx} className="flex gap-2 items-center">
            <div className="flex-1">
              <Input
                value={img}
                onChange={(e) => updateImage(idx, e.target.value)}
                placeholder="Image URL"
              />
            </div>
            <button type="button" onClick={() => removeImage(idx)} className="text-red-500 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
