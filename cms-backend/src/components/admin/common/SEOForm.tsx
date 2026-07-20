import React from 'react';
import { UseFormRegister, FieldErrors, Control } from 'react-hook-form';
import { Input } from '../ui/forms/Input';
import { Textarea } from '../ui/forms/Textarea';
import { Select } from '../ui/forms/Select';

interface SEOFormProps {
  register: UseFormRegister<any>;
  control?: Control<any>;
  errors?: FieldErrors<any>;
  className?: string;
}

export const SEOForm: React.FC<SEOFormProps> = ({ register, errors, className }) => {
  return (
    <div className={`space-y-6 rounded-lg border border-border bg-card p-6 shadow-sm ${className || ''}`}>
      <h3 className="text-lg font-medium text-foreground">SEO Settings</h3>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Input
          label="Meta Title"
          {...register('seoTitle')}
          error={errors?.seoTitle?.message as string}
          placeholder="50-60 characters"
          maxLength={60}
        />
        <Input
          label="Canonical URL"
          {...register('canonicalUrl')}
          error={errors?.canonicalUrl?.message as string}
          placeholder="https://example.com/page-url"
        />
      </div>

      <Textarea
        label="Meta Description"
        {...register('metaDescription')}
        error={errors?.metaDescription?.message as string}
        placeholder="150-160 characters"
        maxLength={160}
      />

      <Input
        label="Meta Keywords"
        {...register('metaKeywords')}
        error={errors?.metaKeywords?.message as string}
        placeholder="keyword1, keyword2, keyword3"
      />

      <div className="border-t border-border pt-6">
        <h4 className="mb-4 text-md font-medium text-foreground">Social (Open Graph & Twitter)</h4>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Input
            label="OG Title"
            {...register('ogTitle')}
            error={errors?.ogTitle?.message as string}
          />
          <Input
            label="OG Image URL"
            {...register('ogImage')}
            error={errors?.ogImage?.message as string}
            placeholder="https://example.com/image.jpg"
          />
        </div>
        <div className="mt-6">
          <Textarea
            label="OG Description"
            {...register('ogDescription')}
            error={errors?.ogDescription?.message as string}
          />
        </div>
        <div className="mt-6">
          <Select
            label="Twitter Card Type"
            {...register('twitterCard')}
            error={errors?.twitterCard?.message as string}
            options={[
              { label: 'Summary', value: 'summary' },
              { label: 'Summary Large Image', value: 'summary_large_image' },
              { label: 'App', value: 'app' },
              { label: 'Player', value: 'player' },
            ]}
          />
        </div>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mt-6">
          <Input
            label="Twitter Title"
            {...register('twitterTitle')}
            error={errors?.twitterTitle?.message as string}
          />
          <Input
            label="Twitter Image URL"
            {...register('twitterImage')}
            error={errors?.twitterImage?.message as string}
            placeholder="https://example.com/image.jpg"
          />
        </div>
        <div className="mt-6">
          <Textarea
            label="Twitter Description"
            {...register('twitterDescription')}
            error={errors?.twitterDescription?.message as string}
          />
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <h4 className="mb-4 text-md font-medium text-foreground">Advanced Settings</h4>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
           <div className="flex items-center space-x-2 mt-6">
              <input type="checkbox" id="robotsIndex" {...register('robotsIndex')} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
              <label htmlFor="robotsIndex" className="text-sm font-medium text-gray-700">Index this page</label>
           </div>
           <div className="flex items-center space-x-2 mt-6">
              <input type="checkbox" id="robotsFollow" {...register('robotsFollow')} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
              <label htmlFor="robotsFollow" className="text-sm font-medium text-gray-700">Follow links on this page</label>
           </div>
           <div className="flex items-center space-x-2 mt-6">
              <input type="checkbox" id="generateFaqSchema" {...register('generateFaqSchema')} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
              <label htmlFor="generateFaqSchema" className="text-sm font-medium text-gray-700">Enable FAQ Schema</label>
           </div>
           <div className="flex items-center space-x-2 mt-6">
              <input type="checkbox" id="generateBreadcrumbSchema" {...register('generateBreadcrumbSchema')} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
              <label htmlFor="generateBreadcrumbSchema" className="text-sm font-medium text-gray-700">Enable Breadcrumb Schema</label>
           </div>
        </div>
        <div className="mt-6">
          <Textarea
            label="Custom Schema (JSON-LD)"
            {...register('schemaMarkup')}
            error={errors?.schemaMarkup?.message as string}
            placeholder='{ "@context": "https://schema.org", "@type": "Article", ... }'
            className="font-mono text-xs"
          />
        </div>
      </div>
    </div>
  );
};
