'use client';

import { X, Settings2, Palette, Image as ImageIcon, Type, ShoppingBag, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { ImageUpload } from '@/components/ui/image-upload';
import { 
  SectionType, 
  LandingPageSection, 
  SectionContent, 
  SectionStyles 
} from '@/lib/landing-page-sections';

interface SectionSettingsEditorProps {
  section: LandingPageSection | undefined;
  onUpdateContent: (content: SectionContent) => void;
  onUpdateStyles: (styles: SectionStyles) => void;
  onClose: () => void;
}

export default function SectionSettingsEditor({
  section,
  onUpdateContent,
  onUpdateStyles,
  onClose
}: SectionSettingsEditorProps) {
  if (!section) return null;

  const handleContentChange = (key: string, value: any) => {
    onUpdateContent({ ...(section.content || {}), [key]: value });
  };

  const handleStyleChange = (key: string, value: any) => {
    onUpdateStyles({ ...(section.styles || {}), [key]: value });
  };

  const handlePriceChange = (key: string, value: string) => {
    const parsed = parseFloat(value);
    const validatedValue = Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
    handleContentChange(key, validatedValue);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="h-14 border-b flex items-center justify-between px-4 shrink-0">
        <h3 className="font-black text-xs uppercase tracking-widest flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-primary" />
          Section Settings
        </h3>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="content" className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-2 rounded-none bg-gray-50/50 border-b h-12 shrink-0">
          <TabsTrigger value="content" className="rounded-none data-[state=active]:bg-white">Content</TabsTrigger>
          <TabsTrigger value="styles" className="rounded-none data-[state=active]:bg-white">Styles</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto p-4">
          <TabsContent value="content" className="mt-0 space-y-6">
            {/* HERO SECTION EDITOR */}
            {section.type === 'hero' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase opacity-50">Headline</Label>
                  <Input 
                    value={section.content?.headline ?? ''} 
                    onChange={(e) => handleContentChange('headline', e.target.value)} 
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase opacity-50">Sub-headline</Label>
                  <Textarea 
                    value={section.content?.subheadline ?? ''} 
                    onChange={(e) => handleContentChange('subheadline', e.target.value)}
                    className="rounded-xl min-h-[80px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase opacity-50">CTA Button Text</Label>
                  <Input 
                    value={section.content?.ctaText ?? ''} 
                    onChange={(e) => handleContentChange('ctaText', e.target.value)} 
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase opacity-50">Background Image</Label>
                  <ImageUpload 
                    onUpload={(url) => handleContentChange('backgroundImage', url || '')}
                    className="rounded-2xl"
                  />
                </div>
              </div>
            )}

            {/* PRODUCT SHOWCASE EDITOR */}
            {section.type === 'product_showcase' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase opacity-50">Product ID (Internal)</Label>
                  <Input 
                    placeholder="Search or Paste ID"
                    value={section.content?.productId ?? ''} 
                    onChange={(e) => handleContentChange('productId', e.target.value)} 
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase opacity-50">Custom Title</Label>
                  <Input 
                    value={section.content?.title ?? ''} 
                    onChange={(e) => handleContentChange('title', e.target.value)} 
                    className="rounded-xl"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase opacity-50">Regular Price</Label>
                    <Input 
                      type="number"
                      value={section.content?.price ?? 0} 
                      onChange={(e) => handlePriceChange('price', e.target.value)} 
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase opacity-50">Sale Price</Label>
                    <Input 
                      type="number"
                      value={section.content?.salePrice ?? 0} 
                      onChange={(e) => handlePriceChange('salePrice', e.target.value)} 
                      className="rounded-xl font-bold text-emerald-600"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                   <Label className="text-[10px] font-bold uppercase opacity-50">Benefits (One per line)</Label>
                   <Textarea 
                      value={(section.content?.benefits ?? []).join('\n')}
                      onChange={(e) => {
                        const lines = e.target.value.split('\n')
                          .map(line => line.trim())
                          .filter(line => line.length > 0);
                        handleContentChange('benefits', lines);
                      }}
                      className="rounded-xl min-h-[100px]"
                   />
                </div>
              </div>
            )}

            {/* ORDER FORM EDITOR */}
            {section.type === 'order_form' && (
               <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase opacity-50">Form Title</Label>
                    <Input 
                      value={section.content?.title ?? ''} 
                      onChange={(e) => handleContentChange('title', e.target.value)} 
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase opacity-50">Submit Button Text</Label>
                    <Input 
                      value={section.content?.buttonText ?? ''} 
                      onChange={(e) => handleContentChange('buttonText', e.target.value)} 
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase opacity-50">Instructions (Payment etc.)</Label>
                    <Textarea 
                      value={section.content?.paymentInstructions ?? ''} 
                      onChange={(e) => handleContentChange('paymentInstructions', e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
               </div>
            )}

            {/* Default Placeholder */}
            {!['hero', 'product_showcase', 'order_form'].includes(section.type) && (
              <div className="py-10 text-center text-muted-foreground italic text-sm">
                Advanced editor for this section type is coming soon.
              </div>
            )}
          </TabsContent>

          <TabsContent value="styles" className="mt-0 space-y-6">
             <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase opacity-50">Background Color</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {['#ffffff', '#f9fafb', '#f3f4f6', '#111827', '#065f46'].map(color => (
                      <button 
                        key={color}
                        onClick={() => handleStyleChange('backgroundColor', color)}
                        className={cn(
                          "h-8 rounded-lg border shadow-sm transition-all",
                          section.styles?.backgroundColor === color ? "ring-2 ring-primary ring-offset-2" : ""
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                   <Label className="text-[10px] font-bold uppercase opacity-50">Padding Vertical</Label>
                   <div className="grid grid-cols-3 gap-2">
                      {['py-4', 'py-12', 'py-24'].map(p => (
                        <Button 
                          key={p} 
                          variant={section.styles?.paddingTop === p ? 'default' : 'outline'}
                          size="sm"
                          className="text-xs rounded-lg"
                          onClick={() => {
                            handleStyleChange('paddingTop', p);
                            handleStyleChange('paddingBottom', p);
                          }}
                        >
                          {p === 'py-4' ? 'Compact' : p === 'py-12' ? 'Standard' : 'Spacious'}
                        </Button>
                      ))}
                   </div>
                </div>
             </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
