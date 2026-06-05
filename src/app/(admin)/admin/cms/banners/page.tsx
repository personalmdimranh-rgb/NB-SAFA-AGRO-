'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import Swal from 'sweetalert2';
import { ImageUpload } from '@/components/ui/image-upload';

interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  image: string;
  ctaText?: string;
  ctaLink?: string;
  secondaryBtnText?: string;
  secondaryBtnLink?: string;
  order: number;
  isActive: boolean;
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [image, setImage] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [ctaLink, setCtaLink] = useState('');
  const [secondaryBtnText, setSecondaryBtnText] = useState('');
  const [secondaryBtnLink, setSecondaryBtnLink] = useState('');
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const fetchBanners = async () => {
    try {
      const response = await fetch('/api/admin/banners');
      if (!response.ok) {
        toast.error(`Failed to fetch banners: ${response.status} ${response.statusText}`);
        return;
      }
      const data = await response.json();
      setBanners(data);
    } catch {
      toast.error('Failed to fetch banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openAddModal = () => {
    setEditingBanner(null);
    setTitle('');
    setSubtitle('');
    setImage('');
    setCtaText('');
    setCtaLink('');
    setSecondaryBtnText('');
    setSecondaryBtnLink('');
    setOrder(banners.length + 1);
    setIsActive(true);
    setIsOpen(true);
  };

  const openEditModal = (banner: Banner) => {
    setEditingBanner(banner);
    setTitle(banner.title);
    setSubtitle(banner.subtitle || '');
    setImage(banner.image);
    setCtaText(banner.ctaText || '');
    setCtaLink(banner.ctaLink || '');
    setSecondaryBtnText(banner.secondaryBtnText || '');
    setSecondaryBtnLink(banner.secondaryBtnLink || '');
    setOrder(banner.order);
    setIsActive(banner.isActive);
    setIsOpen(true);
  };

  const handleStatusToggle = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/banners/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (res.ok) {
        toast.success(`Banner status updated successfully`);
        fetchBanners();
      } else {
        toast.error('Failed to update banner status');
      }
    } catch {
      toast.error('Error updating status');
    }
  };

  const handleDelete = async (id: string, bannerTitle: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete banner "${bannerTitle}". This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#00D1B2',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      customClass: {
        popup: 'rounded-xl',
        confirmButton: 'rounded-lg px-4 py-2 font-bold',
        cancelButton: 'rounded-lg px-4 py-2 font-bold'
      }
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/admin/banners/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          toast.success('Banner deleted successfully');
          fetchBanners();
        } else {
          toast.error('Failed to delete banner');
        }
      } catch {
        toast.error('Error deleting banner');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !image.trim()) {
      toast.error('Title and Image are required');
      return;
    }

    setSubmitLoading(true);
    const payload = {
      title,
      subtitle,
      image,
      ctaText,
      ctaLink,
      secondaryBtnText,
      secondaryBtnLink,
      order,
      isActive,
    };

    try {
      let response;
      if (editingBanner) {
        response = await fetch(`/api/admin/banners/${editingBanner._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch('/api/admin/banners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (response.ok) {
        toast.success(editingBanner ? 'Banner updated successfully' : 'Banner created successfully');
        setIsOpen(false);
        fetchBanners();
      } else {
        const err = await response.json();
        toast.error(err.message || 'Action failed');
      }
    } catch {
      toast.error('Network error occurred');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Homepage Banners</h1>
          <p className="text-muted-foreground text-sm">Manage the active sliders displayed on the landing page</p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="mr-2 h-4 w-4" /> Add Banner
        </Button>
      </div>

      <div className="rounded-md border bg-background overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[120px]">Image</TableHead>
              <TableHead>Title & Subtitle</TableHead>
              <TableHead>CTA Details</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Loading banners...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : banners.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-lg font-medium">No banners found</p>
                    <p className="text-sm text-muted-foreground">Add your first homepage banner to get started.</p>
                    <Button variant="outline" size="sm" onClick={openAddModal} className="mt-2">
                      Add Banner
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              banners.map((banner) => (
                <TableRow key={banner._id} className="group hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="h-16 aspect-video overflow-hidden rounded-md border bg-muted relative">
                      {banner.image ? (
                        <img 
                          src={banner.image} 
                          alt={banner.title} 
                          className="h-full w-full object-cover" 
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm line-clamp-1">{banner.title}</span>
                      {banner.subtitle && (
                        <span className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{banner.subtitle}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {banner.ctaText ? (
                      <div className="flex flex-col text-xs">
                        <span className="font-semibold text-primary">Primary: {banner.ctaText}</span>
                        <span className="text-muted-foreground truncate max-w-[150px] mb-1">{banner.ctaLink}</span>
                        {banner.secondaryBtnText && (
                          <>
                            <span className="font-semibold text-foreground">Secondary: {banner.secondaryBtnText}</span>
                            <span className="text-muted-foreground truncate max-w-[150px]">{banner.secondaryBtnLink}</span>
                          </>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">None</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {banner.order}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <button 
                      onClick={() => handleStatusToggle(banner._id, banner.isActive)}
                      className="transition-opacity hover:opacity-80"
                    >
                      <Badge variant={banner.isActive ? 'default' : 'secondary'} className="cursor-pointer">
                        {banner.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 hover:text-primary hover:bg-primary/10"
                        onClick={() => openEditModal(banner)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" 
                        onClick={() => handleDelete(banner._id, banner.title)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[550px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editingBanner ? 'Edit Banner' : 'Add New Banner'}</DialogTitle>
            <DialogDescription>
              Configure details for the sliding homepage banner section.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="banner-title" className="text-sm font-semibold">Banner Title *</Label>
              <Input 
                id="banner-title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="e.g., Premium Maize Silage" 
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="banner-subtitle" className="text-sm font-semibold">Subtitle</Label>
              <Input 
                id="banner-subtitle" 
                value={subtitle} 
                onChange={(e) => setSubtitle(e.target.value)} 
                placeholder="Brief description or catchphrase" 
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">Banner Image *</Label>
              <div className="flex items-center gap-4">
                {image && (
                  <div className="h-16 aspect-video rounded-lg border bg-white overflow-hidden shrink-0 shadow-sm relative group">
                    <img src={image} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                )}
                <div className="flex-1">
                  <ImageUpload 
                    onUpload={(url) => setImage(url)} 
                    className="h-16 rounded-xl border-2 border-dashed border-primary/20 hover:border-primary transition-all bg-white"
                  />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground italic">Recommended aspect ratio: 16:9 or 21:9 for banners.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cta-text" className="text-sm font-semibold">Button Text (CTA)</Label>
                  <Input 
                    id="cta-text" 
                    value={ctaText} 
                    onChange={(e) => setCtaText(e.target.value)} 
                    placeholder="e.g., Shop Now" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cta-link" className="text-sm font-semibold">Button Link (CTA)</Label>
                  <Input 
                    id="cta-link" 
                    value={ctaLink} 
                    onChange={(e) => setCtaLink(e.target.value)} 
                    placeholder="e.g., /shop" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="secondary-btn-text" className="text-sm font-semibold">Secondary Button Text</Label>
                  <Input 
                    id="secondary-btn-text" 
                    value={secondaryBtnText} 
                    onChange={(e) => setSecondaryBtnText(e.target.value)} 
                    placeholder="e.g., Contact Us" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondary-btn-link" className="text-sm font-semibold">Secondary Button Link</Label>
                  <Input 
                    id="secondary-btn-link" 
                    value={secondaryBtnLink} 
                    onChange={(e) => setSecondaryBtnLink(e.target.value)} 
                    placeholder="e.g., /contact" 
                  />
                </div>
              </div>

            <div className="grid grid-cols-2 gap-4 items-center pt-2">
              <div className="space-y-2">
                <Label htmlFor="banner-order" className="text-sm font-semibold">Display Order</Label>
                <Input 
                  id="banner-order" 
                  type="number"
                  value={order} 
                  onChange={(e) => setOrder(Number(e.target.value))} 
                  min={1}
                />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <input 
                  type="checkbox" 
                  id="is-active"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="is-active" className="text-sm font-semibold cursor-pointer">Visible (Active)</Label>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitLoading}>
                {submitLoading ? 'Saving...' : 'Save Banner'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
