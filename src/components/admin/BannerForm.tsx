'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { 
  Loader2, 
  ArrowLeft 
} from 'lucide-react';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/ui/image-upload';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const bannerSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  subtitle: z.string().optional(),
  image: z.string().min(1, 'Image is required'),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
  secondaryBtnText: z.string().optional(),
  secondaryBtnLink: z.string().optional(),
  order: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

type BannerFormValues = z.infer<typeof bannerSchema>;

interface BannerFormProps {
  initialData?: any;
}

export function BannerForm({ initialData }: BannerFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<BannerFormValues>({
    resolver: zodResolver(bannerSchema) as any,
    defaultValues: {
      title: initialData?.title || '',
      subtitle: initialData?.subtitle || '',
      image: initialData?.image || '',
      ctaText: initialData?.ctaText || '',
      ctaLink: initialData?.ctaLink || '',
      secondaryBtnText: initialData?.secondaryBtnText || '',
      secondaryBtnLink: initialData?.secondaryBtnLink || '',
      order: initialData?.order || 1,
      isActive: initialData?.isActive ?? true,
    },
  });

  const onSubmit = async (values: BannerFormValues) => {
    setLoading(true);
    try {
      const url = initialData ? `/api/admin/banners/${initialData._id}` : '/api/admin/banners';
      const method = initialData ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        toast.success(`Banner ${initialData ? 'updated' : 'created'} successfully`);
        router.push('/admin/cms/banners');
        router.refresh();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Something went wrong');
      }
    } catch (error) {
      console.error('Error saving banner:', error);
      toast.error('Failed to save banner');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              onClick={() => router.back()}
              className="h-9 w-9"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">
              {initialData ? 'Edit' : 'Add'} Banner
            </h1>
          </div>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Banner
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Banner Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Premium High-Starch Maize Silage" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subtitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subtitle</FormLabel>
                      <FormControl>
                        <Input placeholder="Formulated for maximum dairy milk yields" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="ctaText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Button Text (CTA)</FormLabel>
                        <FormControl>
                          <Input placeholder="Explore Shop" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ctaLink"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Button Link (CTA)</FormLabel>
                        <FormControl>
                          <Input placeholder="/shop" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="secondaryBtnText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Secondary Button Text</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Contact Us" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="secondaryBtnLink"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Secondary Button Link</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., /contact" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 items-end">
                  <FormField
                    control={form.control}
                    name="order"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Order</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center gap-2 rounded-lg border p-3 shadow-sm select-none">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="leading-none">
                          <FormLabel className="text-sm font-semibold cursor-pointer">Visible (Active)</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <Label>Banner Image *</Label>
                <div className="w-full">
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <ImageUpload 
                            value={field.value}
                            onUpload={(url) => field.onChange(url)} 
                            className="aspect-[21/9] w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <p className="text-xs text-muted-foreground italic">Recommended aspect ratio: 16:9 or 21:9 for banners.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  );
}
