"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function Breadcrumb({ className }: { className?: string }) {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  const formatSegmentName = (segment: string) => {
    return segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <nav className={cn("flex px-5 py-3 text-sm border-b border-border bg-card", className)} aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li className="inline-flex items-center">
          <Link href="/admin/dashboard" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-indigo-600 dark:hover:text-white transition-colors">
            <Home className="w-4 h-4 mr-2" />
            Admin
          </Link>
        </li>
        
        {segments.map((segment, idx) => {
          // Skip 'admin' segment since it's the home above
          if (segment.toLowerCase() === 'admin') return null;

          const href = '/' + segments.slice(0, idx + 1).join('/');
          const isLast = idx === segments.length - 1;
          const name = formatSegmentName(segment);

          return (
            <li key={href}>
              <div className="flex items-center">
                <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
                {isLast ? (
                  <span className="ml-1 text-sm font-medium text-foreground md:ml-2">
                    {name}
                  </span>
                ) : (
                  <Link href={href} className="ml-1 text-sm font-medium text-muted-foreground hover:text-indigo-600 md:ml-2 dark:hover:text-white transition-colors">
                    {name}
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
