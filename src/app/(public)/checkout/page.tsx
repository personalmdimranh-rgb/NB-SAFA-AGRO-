'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToCart, removeFromCart, clearCart, syncItems } from '@/store/slices/cartSlice';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, CreditCard, Truck, CheckCircle2, Plus, Minus, X, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { fbEvent } from '@/lib/fpixel';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const checkoutSchema = z.object({
  fullName: z.string().min(2, 'আপনার নাম লিখুন'),
  phone: z.string().min(11, 'সঠিক মোবাইল নম্বর লিখুন'),
  street: z.string().min(5, 'আপনার সম্পূর্ণ ঠিকানা লিখুন'),
  shippingRegion: z.enum(['Inside Dhaka', 'Outside Dhaka'], {
    message: 'ডেলিভারি এলাকা সিলেক্ট করুন',
  }),
  paymentMethod: z.enum(['COD', 'Online', 'Manual'], {
    message: 'পেমেন্ট মেথড সিলেক্ট করুন'
  }),
});

type CheckoutValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { items, totalAmount, isHydrated } = useAppSelector((state) => state.cart);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [useWallet, setUseWallet] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<any>(null);
  const [manualDetails, setManualDetails] = useState({
    senderNumber: '',
    transactionId: ''
  });
  const [paymentDetailTab, setPaymentDetailTab] = useState<'phone' | 'trx'>('phone');
  const [syncData, setSyncData] = useState<any>(null);

  const form = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      street: '',
      shippingRegion: 'Inside Dhaka',
      paymentMethod: 'COD',
    },
  });

  const paymentMethodVal = useWatch({
    control: form.control,
    name: 'paymentMethod',
  });

  useEffect(() => {
    if (paymentMethodVal !== 'Manual') {
      setSelectedMethod(null);
      setManualDetails({ senderNumber: '', transactionId: '' });
    }
  }, [paymentMethodVal]);

  useEffect(() => {
    async function fetchLoyaltyAndSyncCart() {
      if (!isHydrated) return;

      try {
        const [profileRes, settingsRes] = await Promise.all([
          fetch('/api/user/profile'),
          fetch('/api/settings')
        ]);
        
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData);
          if (profileData) {
            form.reset({
              fullName: profileData.name || '',
              phone: profileData.phone || '',
              street: (profileData.addresses && profileData.addresses[0]?.street) || '',
              shippingRegion: profileData.addresses && profileData.addresses[0]?.division === 'Dhaka' ? 'Inside Dhaka' : 'Outside Dhaka',
              paymentMethod: 'COD',
            });
          }
        }
        if (settingsRes.ok) setSettings(await settingsRes.json());

        // Simple mock cart sync if no sync endpoint is available, or do fetch
        if (items.length > 0) {
          const syncRes = await fetch('/api/cart/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items })
          }).catch(() => null);
          
          if (syncRes && syncRes.ok) {
            const data = await syncRes.json();
            setSyncData({ validItems: data.validItems, hasInsufficientStock: data.hasInsufficientStock });
          } else {
            // Fallback: items are valid
            setSyncData({ validItems: items.map(i => ({ ...i, isInsufficient: false })), hasInsufficientStock: false });
          }
        }
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
      }
    }
    fetchLoyaltyAndSyncCart();
  }, [form, isHydrated, items.length, dispatch]);

  const hasTrackedInitiate = useRef(false);
  useEffect(() => {
    if (isHydrated && items.length > 0 && !hasTrackedInitiate.current) {
      const validItems = items.filter(i => i.productId);
      if (validItems.length === 0) return;

      fbEvent('InitiateCheckout', {
        content_ids: validItems.map(i => i.productId),
        content_type: 'product',
        value: totalAmount,
        currency: 'BDT',
        num_items: validItems.length,
        contents: validItems.map(i => ({
          id: i.productId,
          quantity: i.quantity,
          item_price: i.price
        }))
      });
      hasTrackedInitiate.current = true;
    }
  }, [isHydrated, items, totalAmount]); 

  const submissionSucceededRef = useRef(false);
  const [canRedirect, setCanRedirect] = useState(false);

  useEffect(() => {
    if (isHydrated) {
      const timer = setTimeout(() => setCanRedirect(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [isHydrated]);

  useEffect(() => {
    if (canRedirect && isHydrated && items.length === 0 && !loading && !submissionSucceededRef.current) {
      router.push('/shop');
    }
  }, [canRedirect, isHydrated, items.length, router, loading]);

  const onSubmit = async (values: CheckoutValues) => {
    setLoading(true);
    try {
      const orderData = {
        items: items.map(item => ({
            product: item.productId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            image: item.image,
            color: item.color,
            size: item.size
        })),
        shippingAddress: {
            fullName: values.fullName,
            phone: values.phone,
            email: profile?.email || `${values.phone}@store.com`,
            street: values.street,
            city: values.shippingRegion === 'Inside Dhaka' ? 'Dhaka' : 'Outside Dhaka',
            state: values.shippingRegion === 'Inside Dhaka' ? 'Dhaka' : 'Outside Dhaka',
            division: values.shippingRegion === 'Inside Dhaka' ? 'Dhaka' : 'Outside Dhaka',
            district: values.shippingRegion === 'Inside Dhaka' ? 'Dhaka' : 'Outside Dhaka',
            thana: values.shippingRegion === 'Inside Dhaka' ? 'Dhaka' : 'Outside Dhaka',
            zipCode: '0000',
            country: 'Bangladesh'
        },
        paymentMethod: values.paymentMethod,
        deliveryCharge: deliveryCharge,
        useWallet: useWallet,
        couponCode: appliedCoupon || undefined,
        manualPaymentDetails: values.paymentMethod === 'Manual' ? {
          methodName: selectedMethod?.id,
          senderNumber: manualDetails.senderNumber,
          transactionId: manualDetails.transactionId
        } : undefined
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const order = await response.json();
        submissionSucceededRef.current = true;
        
        if (values.paymentMethod === 'Online') {
          const initRes = await fetch('/api/payment/init', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: order._id }),
          });

          if (initRes.ok) {
            const { url } = await initRes.json();
            dispatch(clearCart());
            window.location.href = url;
            return;
          } else {
            const initError = await initRes.json().catch(() => ({}));
            toast.error(initError.message || 'Failed to initialize payment gateway. Please try paying from your dashboard.');
            router.push('/dashboard');
          }
        } else {
          dispatch(clearCart());
          toast.success('Order placed successfully!');
          router.push(`/checkout/success?id=${order._id}`);
        }
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to place order');
      }
    } catch (error) {
      toast.error('An error occurred while placing your order');
    } finally {
      setLoading(false);
    }
  };

  const applyCoupon = async (codeToUse?: string) => {
    const code = codeToUse || couponCode;
    if (!code.trim()) return;
    
    setApplyingCoupon(true);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code, totalAmount })
      });
      const data = await res.json();
      if (res.ok) {
        setCouponDiscount(data.discountAmount);
        setAppliedCoupon(data.code);
        if (!codeToUse) toast.success(`Coupon "${data.code}" applied!`);
      } else {
        if (codeToUse) {
          removeCoupon(true);
          toast.info(data.message || 'Coupon removed');
        } else {
          toast.error(data.message || 'Invalid coupon');
        }
      }
    } catch (error) {
      if (!codeToUse) toast.error('Failed to validate coupon');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const removeCoupon = (silent?: boolean) => {
    setCouponDiscount(0);
    setAppliedCoupon(null);
    setCouponCode('');
    if (silent !== true) {
      toast.info('Coupon removed');
    }
  };

  const freeDeliveryThreshold = settings?.freeDeliveryThreshold || 0;
  const isFreeDelivery = freeDeliveryThreshold > 0 && totalAmount >= freeDeliveryThreshold;
  
  const chargeInsideDhaka = settings?.deliveryChargeInsideDhaka || 60;
  const chargeOutsideDhaka = settings?.deliveryChargeOutsideDhaka || 120;
  
  const totalProductDiscount = items.reduce((sum, item) => {
    const itemBasePrice = item.basePrice || item.price;
    return sum + Math.max(0, itemBasePrice - item.price) * item.quantity;
  }, 0);

  const deliveryCharge = items.length > 0 ? (
    isFreeDelivery ? 0 : (form.watch('shippingRegion') === 'Inside Dhaka' ? chargeInsideDhaka : chargeOutsideDhaka)
  ) : 0;

  const totalAfterCoupon = Math.max(0, totalAmount + deliveryCharge - couponDiscount);
  const walletAmountToUse = useWallet && profile?.walletBalance 
    ? Math.min(profile.walletBalance, totalAfterCoupon) 
    : 0;

  const finalTotal = totalAfterCoupon - walletAmountToUse;

  const watchedFields = form.watch();
  const isFormValid = !!(
    watchedFields.fullName?.trim() && 
    watchedFields.phone?.trim() && 
    watchedFields.street?.trim() && 
    watchedFields.shippingRegion &&
    (watchedFields.paymentMethod !== 'Manual' || (selectedMethod?.id && (manualDetails.senderNumber || manualDetails.transactionId)))
  );

  const handleUpdateQuantity = (item: any, delta: number) => {
      if (item.quantity + delta === 0) {
          dispatch(removeFromCart({ productId: item.productId, color: item.color, size: item.size }));
          toast.info(`${item.name} removed from cart`);
      } else {
          dispatch(addToCart({ ...item, quantity: delta }));
      }
  };

  if (!isHydrated) return (
    <div className="container min-h-[60vh] flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  if (items.length === 0) return null;

  return (
    <div className="container px-4 md:px-6 py-12 mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Left Side: Order Summary */}
        <div className="hidden lg:block sticky top-24 self-start space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>অর্ডার লিস্ট</CardTitle>
              <CardDescription>আপনার কার্টে থাকা প্রোডাক্টগুলো।</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="max-h-[500px] overflow-y-auto space-y-4 pr-2 -mr-2">
                {items.map((item, index) => (
                  <div key={`${item.productId}-${item.color || 'no-color'}-${item.size || 'no-size'}-${index}`} className="flex gap-4 items-start relative group">
                    <div className="h-16 w-16 rounded-md border bg-muted flex-shrink-0 relative overflow-hidden">
                      {item.image && <img src={item.image} alt={item.name || 'Product'} className="h-full w-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex justify-between items-start gap-2 w-full min-w-0">
                        <div className="flex flex-col pr-4 min-w-0 flex-1">
                          <p className="text-sm font-bold truncate" title={item.name}>{item.name}</p>
                          {(item.color || item.size) && (
                            <p className="text-[10px] text-muted-foreground font-medium">
                              {[item.color, item.size].filter(Boolean).join(' / ')}
                            </p>
                          )}
                        </div>
                        <button 
                          onClick={() => {
                            dispatch(removeFromCart({ productId: item.productId, color: item.color, size: item.size }));
                            toast.info(`${item.name} removed from cart`);
                          }}
                          className="text-muted-foreground hover:text-destructive transition-colors p-1 -mt-1 -mr-1"
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border rounded-full bg-muted/50 scale-90 -ml-2">
                          <button 
                            type="button" 
                            onClick={() => handleUpdateQuantity(item, -1)}
                            className="h-7 w-7 flex items-center justify-center hover:bg-muted rounded-full transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                          <button 
                            type="button"
                            onClick={() => handleUpdateQuantity(item, 1)}
                            className="h-7 w-7 flex items-center justify-center hover:bg-muted rounded-full transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-primary">৳{Math.round(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex justify-between items-center pt-2">
                <span className="text-base font-bold">আইটেম টোটাল</span>
                <span className="text-xl font-black text-primary">৳{Math.round(totalAmount)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Delivery & Payment */}
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">চেকআউট</h1>
            <p className="text-muted-foreground mt-2">অর্ডারটি সম্পন্ন করতে আপনার তথ্যগুলো পূরণ করুন।</p>
          </div>

          <Form {...form}>
            <form id="checkout-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Truck className="h-6 w-6 text-primary" />
                    ডেলিভারি তথ্য
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-bold">আপনার নাম</FormLabel>
                        <FormControl>
                          <Input placeholder="আপনার পূর্ণ নাম লিখুন" {...field} className="h-12 focus-visible:ring-primary/20" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-bold">মোবাইল নম্বর</FormLabel>
                        <FormControl>
                          <Input placeholder="আপনার সচল মোবাইল নম্বর লিখুন" {...field} className="h-12 focus-visible:ring-primary/20" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="shippingRegion"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-sm font-bold">ডেলিভারি এলাকা</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex gap-4"
                          >
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="Inside Dhaka" />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                ঢাকার ভিতরে
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="Outside Dhaka" />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                ঢাকার বাইরে
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-bold">সম্পূর্ণ ঠিকানা</FormLabel>
                        <FormControl>
                          <Input placeholder="গ্রাম/বাসা নং, রোড নং, এলাকা, থানা, জেলা" {...field} className="h-12 focus-visible:ring-primary/20" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Detailed Summary Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Coupon Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Input 
                        placeholder="Coupon Code" 
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        disabled={!!appliedCoupon || applyingCoupon}
                        className="h-10 text-xs"
                      />
                      {appliedCoupon ? (
                        <Button 
                          type="button" 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => removeCoupon()}
                          className="h-10 px-3"
                        >
                          Remove
                        </Button>
                      ) : (
                        <Button 
                          type="button" 
                          size="sm" 
                          onClick={() => applyCoupon()} 
                          disabled={applyingCoupon || !couponCode}
                          className="h-10 px-4"
                        >
                          {applyingCoupon ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Apply'}
                        </Button>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>৳{Math.round(totalAmount + totalProductDiscount)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Product Discount</span>
                      <span>- ৳{Math.round(totalProductDiscount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Coupon Discount</span>
                      <span className={couponDiscount > 0 ? "text-green-600 font-bold" : ""}>
                        - ৳{Math.round(couponDiscount)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className={isFreeDelivery ? "text-green-600 font-black" : "text-primary font-bold"}>
                        {isFreeDelivery ? 'FREE' : `৳${deliveryCharge}`}
                      </span>
                    </div>
                    <Separator className="mt-4" />
                    <div className="flex justify-between text-lg font-black pt-2">
                      <span>Final Total</span>
                      <span className="text-primary">৳{Math.round(finalTotal)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex flex-col space-y-2"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0 border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                              <FormControl>
                                <RadioGroupItem value="COD" />
                              </FormControl>
                              <FormLabel className="font-bold flex-1 cursor-pointer">
                                Cash on Delivery (COD)
                                <p className="text-xs font-normal text-muted-foreground mt-1">Pay when you receive the product.</p>
                              </FormLabel>
                            </FormItem>
                            
                            {settings?.paymentConfig?.activeMethod === 'sslcommerz' && (
                              <FormItem className="flex items-center space-x-3 space-y-0 border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                                <FormControl>
                                  <RadioGroupItem value="Online" />
                                </FormControl>
                                <FormLabel className="font-bold flex-1 cursor-pointer">
                                  Online Payment (SSLCommerz)
                                  <p className="text-xs font-normal text-muted-foreground mt-1">Pay securely via Credit Card, bKash, or Rocket.</p>
                                </FormLabel>
                              </FormItem>
                            )}

                            {(settings?.manualPaymentConfig?.bkash?.active || 
                              settings?.manualPaymentConfig?.nagad?.active || 
                              settings?.manualPaymentConfig?.rocket?.active) && (
                              <FormItem className="flex items-center space-x-3 space-y-0 border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                                <FormControl>
                                  <RadioGroupItem value="Manual" />
                                </FormControl>
                                <FormLabel className="font-bold flex-1 cursor-pointer">
                                  Manual Payment (MFS)
                                  <p className="text-xs font-normal text-muted-foreground mt-1">Send money manually to complete order.</p>
                                </FormLabel>
                              </FormItem>
                            )}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch('paymentMethod') === 'Manual' && settings?.manualPaymentConfig && (
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {['bkash', 'nagad', 'rocket'].map((method) => {
                        const config = settings.manualPaymentConfig[method];
                        if (!config?.active) return null;
                        const isSelected = selectedMethod?.id === method;
                        return (
                          <div 
                            key={method} 
                            onClick={() => {
                              setSelectedMethod({ id: method, ...config });
                              setShowPaymentModal(true);
                            }}
                            className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center gap-2 hover:bg-muted/50 ${
                              isSelected ? 'border-primary bg-primary/5' : 'border-muted'
                            }`}
                          >
                            <p className="text-xs font-bold uppercase">{method}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {profile && profile.walletBalance > 0 && (
                    <div className="p-4 border rounded-lg bg-primary/5 border-primary/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <input 
                            type="checkbox" 
                            id="use-wallet" 
                            checked={useWallet}
                            onChange={(e) => setUseWallet(e.target.checked)}
                            className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <label htmlFor="use-wallet" className="font-bold cursor-pointer">
                            Use Token Balance
                            <p className="text-xs font-normal text-muted-foreground">Available: ৳{profile.walletBalance}</p>
                          </label>
                        </div>
                        {useWallet && <span className="text-sm font-black text-primary">-৳{walletAmountToUse}</span>}
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-2 border-t flex flex-col gap-3">
                  <Button 
                    type="submit"
                    className={`w-full h-14 rounded-full font-black uppercase tracking-widest text-sm transition-all ${
                      isFormValid && !syncData?.hasInsufficientStock
                      ? 'bg-primary shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95' 
                      : 'bg-muted text-muted-foreground cursor-not-allowed opacity-70'
                    }`}
                    disabled={loading || !isFormValid || syncData?.hasInsufficientStock}
                  >
                    {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle2 className="mr-2 h-5 w-5" />}
                    {syncData?.hasInsufficientStock ? 'Insufficient Stock' : 'Place Order Now'}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </div>
      </div>

      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl p-6 overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-lg font-black uppercase tracking-tight">
              Pay via {selectedMethod?.id}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-black uppercase tracking-widest opacity-50">Send Money To</span>
                <Badge variant="secondary">Personal Number</Badge>
              </div>
              <div className="flex items-center justify-between gap-3 mt-1">
                <p className="text-lg font-black tracking-widest bg-white dark:bg-zinc-800 px-3 py-1.5 rounded-lg border border-primary/10 flex-1 text-center select-all">
                  {selectedMethod?.number}
                </p>
              </div>
            </div>

            <div className="flex border-b border-slate-200 dark:border-zinc-800 mt-2">
              <button
                type="button"
                onClick={() => setPaymentDetailTab('phone')}
                className={`flex-1 pb-1.5 text-xs font-bold text-center border-b-2 transition-all ${
                  paymentDetailTab === 'phone' ? 'border-primary text-primary' : 'border-transparent text-slate-500'
                }`}
              >
                Phone Number
              </button>
              <button
                type="button"
                onClick={() => setPaymentDetailTab('trx')}
                className={`flex-1 pb-1.5 text-xs font-bold text-center border-b-2 transition-all ${
                  paymentDetailTab === 'trx' ? 'border-primary text-primary' : 'border-transparent text-slate-500'
                }`}
              >
                TrxID
              </button>
            </div>

            <div className="space-y-3 pt-1">
              {paymentDetailTab === 'phone' ? (
                <div className="space-y-1.5">
                  <Label className="text-xs">Send from Phone Number</Label>
                  <Input 
                    placeholder="e.g. 017XXXXXXXX" 
                    value={manualDetails.senderNumber}
                    onChange={(e) => setManualDetails({...manualDetails, senderNumber: e.target.value})}
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label className="text-xs">Transaction ID (TrxID)</Label>
                  <Input 
                    placeholder="e.g. 8N7A6D5C" 
                    value={manualDetails.transactionId}
                    onChange={(e) => setManualDetails({...manualDetails, transactionId: e.target.value.toUpperCase()})}
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex flex-row gap-3">
            <Button variant="outline" onClick={() => setShowPaymentModal(false)} className="flex-1">Cancel</Button>
            <Button 
              disabled={
                paymentDetailTab === 'phone'
                  ? !manualDetails.senderNumber.trim()
                  : !manualDetails.transactionId.trim()
              }
              onClick={async () => {
                const isValid = await form.trigger();
                if (isValid) {
                  setShowPaymentModal(false);
                  toast.success(`${selectedMethod?.id.toUpperCase()} details saved!`);
                  await form.handleSubmit(onSubmit)();
                } else {
                  setShowPaymentModal(false);
                  toast.error('Please complete delivery information first.');
                }
              }} 
              className="flex-1"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
