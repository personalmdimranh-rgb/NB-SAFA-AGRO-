'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Edit, Trash, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import Swal from 'sweetalert2';

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

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Homepage Banners</h1>
          <p className="text-muted-foreground text-sm">Manage the active sliders displayed on the landing page</p>
        </div>
        <Link href="/admin/cms/banners/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Banner
          </Button>
        </Link>
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
                    <Link href="/admin/cms/banners/new" className="mt-2">
                      <Button variant="outline" size="sm">
                        Add Banner
                      </Button>
                    </Link>
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
                      <Link href={`/admin/cms/banners/${banner._id}/edit`}>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 hover:text-primary hover:bg-primary/10"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
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
    </div>
  );
}
