'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    async function fetchOrderAndTrack() {
      try {
        const res = await fetch(`/api/orders/${id}`);
        if (res.ok) {
          const orderData = await res.json();
          setOrder(orderData);

          const { fbEvent } = await import('@/lib/fpixel');
          const safeItems = Array.isArray(orderData.items) ? orderData.items : [];
          const fullName = orderData.shippingAddress?.fullName || '';
          const nameParts = fullName ? fullName.trim().split(/\s+/) : [];

          fbEvent('Purchase', {
            value: orderData.totalAmount,
            currency: 'BDT',
            content_ids: safeItems.map((i: any) => i.product?._id || i.product),
            content_type: 'product',
            num_items: safeItems.length,
            contents: safeItems.map((i: any) => ({
              id: i.product?._id || i.product,
              quantity: i.quantity,
              item_price: i.price
            }))
          }, {
            em: orderData.shippingAddress?.email,
            ph: orderData.shippingAddress?.phone,
            fn: nameParts[0] || '',
            ln: nameParts.slice(1).join(' ') || '',
            ct: orderData.shippingAddress?.city,
            st: orderData.shippingAddress?.state,
            country: 'bd'
          }, orderData._id);
        } else {
          setFetchError(true);
          setOrder(null);
        }
      } catch (error) {
        console.error('Failed to fetch order for tracking:', error);
        setFetchError(true);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    }

    fetchOrderAndTrack();
  }, [id]);

  if (loading) {
    return (
      <div className="container py-24 flex justify-center items-center h-[50vh] mx-auto">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (fetchError || !order) {
    return (
      <div className="container px-4 md:px-6 py-24 flex flex-col items-center text-center mx-auto">
        <h1 className="text-2xl font-bold text-destructive mb-4">Error Loading Order</h1>
        <p className="text-muted-foreground mb-8">We couldn't retrieve the details of your order. Please check your dashboard to view your orders.</p>
        <Link href="/dashboard">
          <Button className="rounded-full shadow-lg shadow-primary/20">Go to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container px-4 md:px-6 py-24 flex flex-col items-center text-center animate-in fade-in duration-700 mx-auto">
      <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center mb-8 border-8 border-green-50 shadow-xl shadow-green-500/20">
        <CheckCircle2 className="h-12 w-12 text-green-600 animate-bounce" />
      </div>
      
      <h1 className="text-4xl font-black tracking-tight mb-4">Order Confirmed!</h1>
      <p className="text-muted-foreground text-lg max-w-[600px] mb-2 leading-relaxed">
        Thank you for your purchase! We've received your order and we're getting it ready for delivery.
      </p>
      {id && (
        <p className="text-sm font-mono text-muted-foreground bg-muted px-4 py-2 rounded-full mb-10 inline-block">
          Order ID: <span className="font-bold text-foreground">#{id}</span>
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-[400px]">
        <Link href="/shop" className="w-full">
            <Button variant="outline" className="w-full h-12 rounded-full font-bold group">
                <ShoppingBag className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                Continue Shopping 
            </Button>
        </Link>
        <Link href="/dashboard" className="w-full">
            <Button className="w-full h-12 rounded-full font-bold group shadow-lg shadow-primary/20">
                View My Orders <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
        <div className="container py-24 flex justify-center items-center h-[50vh] mx-auto">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
    }>
        <SuccessContent />
    </Suspense>
  );
}
