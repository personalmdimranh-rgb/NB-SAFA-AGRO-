'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { getDealerDashboardSummary } from '@/app/actions/dealer';
import { logSale } from '@/app/actions/sales';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingBag, ArrowRightCircle, Plus, Trash2, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

interface OrderItem {
  productName: string;
  productType?: string;
  quantity: number;
  unitPrice: number;
}

export default function DealerPlaceOrder() {
  const { data: session } = useSession();
  const [dealer, setDealer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [items, setItems] = useState<OrderItem[]>([
    { productName: 'Premium Silage Bag (40kg)', productType: 'bag', quantity: 100, unitPrice: 380 }
  ]);
  const [paidAmount, setPaidAmount] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank-transfer' | 'bkash' | 'nagad'>('bank-transfer');
  const [distributionDistrict, setDistributionDistrict] = useState('');

  const loadProfile = async () => {
    if (!session?.user?.id) return;
    try {
      setLoading(true);
      const res = await getDealerDashboardSummary((session.user as any).id);
      setDealer(res.dealer);
      setDistributionDistrict(res.dealer.address?.district || '');
    } catch (err: any) {
      toast.error('Failed to load dealer profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [session]);

  const handleAddItem = () => {
    setItems([...items, { productName: 'Premium Silage Bag (40kg)', productType: 'bag', quantity: 50, unitPrice: 380 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, field: keyof OrderItem, value: any) => {
    const updated = [...items];
    if (field === 'quantity') {
      updated[index].quantity = parseInt(value) || 0;
    } else {
      updated[index].productName = value;
    }
    setItems(updated);
  };

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const totalQuantity = items.reduce((sum, qty) => sum + qty.quantity, 0);
  const commissionApplied = totalQuantity * (dealer?.commissionRate || 0);
  const grandTotal = Math.max(0, subtotal - commissionApplied);
  const paidVal = parseFloat(paidAmount) || 0;
  const dueAmount = Math.max(0, grandTotal - paidVal);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealer) return;

    if (totalQuantity <= 0) {
      toast.error('Order quantity must be greater than 0');
      return;
    }

    // Credit Line Check
    const remainingLimit = dealer.creditLimit - dealer.currentDues;
    if (dueAmount > remainingLimit) {
      Swal.fire({
        title: 'Credit Limit Blocked',
        html: `Your remaining credit is <strong>৳${remainingLimit.toLocaleString()} BDT</strong>.<br/>This order creates dues of <strong>৳${dueAmount.toLocaleString()} BDT</strong>.<br/><br/><span style="color:#d33; font-weight:bold;">Order blocked because it exceeds your credit limit!</span>`,
        icon: 'error'
      });
      return;
    }

    const confirmResult = await Swal.fire({
      title: 'Submit Order Request?',
      html: `Order total: ৳${grandTotal.toLocaleString()} BDT.<br/>Dues logged: ৳${dueAmount.toLocaleString()} BDT.<br/>Commission applied: ৳${commissionApplied.toLocaleString()} BDT.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: 'var(--color-primary, #10b981)',
      confirmButtonText: 'Yes, submit order'
    });

    if (!confirmResult.isConfirmed) return;

    try {
      setSubmitting(true);
      const res = await logSale({
        buyerType: 'dealer',
        buyerId: dealer._id,
        items: items.map(item => ({
          ...item,
          totalPrice: item.quantity * item.unitPrice
        })),
        discount: 0,
        paidAmount: paidVal,
        paymentMethod,
        distributionDistrict: distributionDistrict || 'Unknown',
      });

      if (res.success) {
        Swal.fire({
          title: 'Order Placed!',
          text: `Your order has been recorded as Invoice ${res.sale?.invoiceNumber}.`,
          icon: 'success'
        });
        setItems([{ productName: 'Premium Silage Bag (40kg)', productType: 'bag', quantity: 100, unitPrice: 380 }]);
        setPaidAmount('0');
        loadProfile();
      }
    } catch (err: any) {
      toast.error('Failed to submit order: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-muted-foreground">Loading order system...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">Place Silage Order</h1>
        <p className="text-sm text-muted-foreground font-semibold">
          Current Commission Rate: <span className="text-primary">৳{dealer.commissionRate} per bag</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-12">
        {/* Items List */}
        <Card className="lg:col-span-8 border-border bg-card/70">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-foreground flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" /> Items List
              </span>
              <Button type="button" variant="outline" size="sm" onClick={handleAddItem} className="border-primary/20 text-primary h-8">
                <Plus className="h-4 w-4 mr-1" /> Add Product
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                <div className="md:col-span-6">
                  <label className="text-[10px] font-bold text-primary mb-0.5 block">Product Item</label>
                  <Input
                    value={item.productName}
                    onChange={(e) => handleUpdateItem(index, 'productName', e.target.value)}
                    className="border-border h-9"
                    required
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="text-[10px] font-bold text-primary mb-0.5 block">Quantity (Bags)</label>
                  <Input
                    type="number"
                    value={item.quantity || ''}
                    onChange={(e) => handleUpdateItem(index, 'quantity', e.target.value)}
                    placeholder="0"
                    className="border-border h-9"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-primary mb-0.5 block">Price (BDT)</label>
                  <div className="h-9 flex items-center pl-1 font-semibold text-zinc-700 text-xs">
                    ৳{item.unitPrice}/bag
                  </div>
                </div>
                <div className="md:col-span-1 text-center">
                  <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem(index)} className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 h-9 w-9">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
              <div>
                <label className="text-xs font-semibold text-primary mb-1 block">Payment Method</label>
                <Select value={paymentMethod} onValueChange={(val: any) => setPaymentMethod(val)}>
                  <SelectTrigger className="border-border">
                    <SelectValue placeholder="Select Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank-transfer">Bank Direct Transfer</SelectItem>
                    <SelectItem value="cash">Cash Settlement</SelectItem>
                    <SelectItem value="bkash">bKash Merchant</SelectItem>
                    <SelectItem value="nagad">Nagad Merchant</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold text-primary mb-1 block">Distribution District</label>
                <Input
                  value={distributionDistrict}
                  onChange={(e) => setDistributionDistrict(e.target.value)}
                  placeholder="e.g. Bogura"
                  className="border-border"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoice Checkout Summary */}
        <Card className="lg:col-span-4 border-border bg-card/70">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-foreground">Checkout Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 border-b pb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal Price</span>
                <span className="font-semibold text-zinc-800">৳{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-primary font-semibold">Dealer Commission</span>
                <span className="font-semibold text-primary">-৳{commissionApplied.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-base font-bold border-t pt-2 mt-2 text-foreground">
                <span>Grand Total</span>
                <span>৳{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-3 border-b pb-4">
              <div className="flex justify-between text-sm items-center">
                <span className="text-primary font-semibold">Payment Amount</span>
                <Input
                  type="number"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  className="w-28 text-right border-border h-8 font-semibold"
                />
              </div>
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-muted-foreground">Remaining Dues Logged</span>
                <span className="text-rose-700 font-bold">৳{dueAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Credit check */}
            <div className="p-3 bg-zinc-50 rounded-lg space-y-1.5 border border-zinc-100">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1">
                <ShieldAlert className="h-4 w-4 text-primary" /> Credit Limit Check
              </h4>
              <div className="text-[11px] grid grid-cols-2 gap-1 text-muted-foreground">
                <span>Remaining Limit:</span>
                <span className="font-semibold text-right text-zinc-700">৳{(dealer.creditLimit - dealer.currentDues).toLocaleString()}</span>
                <span>Project Dues:</span>
                <span className="font-semibold text-right text-zinc-700">৳{dueAmount.toLocaleString()}</span>
                <span>Verification:</span>
                <span className={`font-bold text-right ${dueAmount > (dealer.creditLimit - dealer.currentDues) ? 'text-rose-600' : 'text-primary'}`}>
                  {dueAmount > (dealer.creditLimit - dealer.currentDues) ? 'Exceeded' : 'Approved'}
                </span>
              </div>
            </div>

            <Button type="submit" disabled={submitting} className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-2">
              {submitting ? 'Submitting Request...' : 'Submit Order Request'}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
