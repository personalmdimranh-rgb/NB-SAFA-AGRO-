'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Settings, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SortableSectionItemProps {
  section: any;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export default function SortableSectionItem({ 
  section, 
  isSelected, 
  onSelect, 
  onDelete 
}: SortableSectionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  const getSectionLabel = (type: string) => {
    switch (type) {
      case 'hero': return 'Hero Banner';
      case 'product_showcase': return 'Product Highlight';
      case 'order_form': return 'Checkout Form';
      case 'features': return 'Features Grid';
      case 'video': return 'Video Player';
      case 'testimonials': return 'Customer Reviews';
      case 'faq': return 'FAQ Accordion';
      case 'content_block': return 'Rich Text';
      default: return 'Generic Section';
    }
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={cn(
        "group relative border-b last:border-b-0 transition-all cursor-default",
        isSelected ? "ring-2 ring-primary ring-inset z-10" : "hover:bg-gray-50/50"
      )}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* Selection Indicator & Label */}
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-1 transition-all",
        isSelected ? "bg-primary" : "bg-transparent group-hover:bg-gray-200"
      )} />
      
      <div className="absolute left-4 top-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
        <div 
          {...attributes} 
          {...listeners} 
          className="p-1 bg-white border shadow-sm rounded cursor-grab active:cursor-grabbing hover:text-primary transition-colors"
        >
          <GripVertical className="h-4 w-4" />
        </div>
        <div className="px-2 py-0.5 bg-white border shadow-sm rounded text-[10px] font-black uppercase tracking-widest">
          {getSectionLabel(section.type)}
        </div>
      </div>

      <div className="absolute right-4 top-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
        <Button 
          variant="secondary" 
          size="icon" 
          className="h-8 w-8 bg-white border shadow-sm hover:text-red-500"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Actual Content Preview (Simplified) */}
      <div className="p-12 pointer-events-none select-none overflow-hidden">
        <div className="flex flex-col items-center justify-center text-center space-y-3 opacity-30 grayscale">
          {section.type === 'hero' && (
             <div className="space-y-2 w-full max-w-md">
                <div className="h-8 bg-gray-200 rounded-full w-3/4 mx-auto" />
                <div className="h-4 bg-gray-200 rounded-full w-full" />
                <div className="h-10 bg-gray-300 rounded-lg w-32 mx-auto" />
             </div>
          )}
          {section.type === 'product_showcase' && (
             <div className="flex items-center gap-6 w-full max-w-lg">
                <div className="h-32 w-32 bg-gray-200 rounded-2xl shrink-0" />
                <div className="space-y-2 flex-1 text-left">
                   <div className="h-6 bg-gray-200 rounded-full w-3/4" />
                   <div className="h-4 bg-gray-200 rounded-full w-full" />
                   <div className="h-10 bg-gray-300 rounded-lg w-24" />
                </div>
             </div>
          )}
          {section.type === 'order_form' && (
             <div className="border-2 border-dashed border-gray-200 rounded-3xl p-6 w-full max-w-sm space-y-3">
                <div className="h-10 bg-gray-100 rounded-xl" />
                <div className="h-10 bg-gray-100 rounded-xl" />
                <div className="h-12 bg-primary/20 rounded-xl" />
             </div>
          )}
          {/* Generic placeholder for others */}
          {!['hero', 'product_showcase', 'order_form'].includes(section.type) && (
            <div className="flex flex-col items-center gap-2">
                <Code className="h-8 w-8 opacity-40" />
                <span className="text-[10px] font-bold uppercase">{getSectionLabel(section.type)} PREVIEW</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
