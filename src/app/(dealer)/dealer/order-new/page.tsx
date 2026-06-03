'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { getDealerDashboardSummary } from '@/app/actions/dealer';
import { logSale } from '@/app/actions/sales';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingBag, ArrowRightCircle, Plus, Trash2, ShieldAlert, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { contactConfig } from '@/lib/contact-config';
import { bdLocations, bdDivisions, divisions } from '@/lib/bd-locations';

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
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank-transfer' | 'bkash' | 'nagad' | 'cod' | 'due' | 'wallet'>('bank-transfer');
  const [estimatedPaymentDate, setEstimatedPaymentDate] = useState('');
  const [paymentNumber, setPaymentNumber] = useState('');
  const [transactionNumber, setTransactionNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [mfsVerificationType, setMfsVerificationType] = useState<'number' | 'trx'>('number');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [distributionDistrict, setDistributionDistrict] = useState('');

  // Shipping details states
  const [phone, setPhone] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [division, setDivision] = useState('');
  const [district, setDistrict] = useState('');
  const [thana, setThana] = useState('');

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedText(null), 2000);
  };

  const loadProfile = async () => {
    if (!session?.user?.id) return;
    try {
      setLoading(true);
      const res = await getDealerDashboardSummary((session.user as any).id);
      setDealer(res.dealer);
      const userAddr = res.dealer.userId?.addresses?.[0];
      setPhone(res.dealer.userId?.phone || '');
      setAddressLine(userAddr?.street || res.dealer.address?.village || '');
      setDivision(userAddr?.division || '');
      setDistrict(userAddr?.state || res.dealer.address?.district || '');
      setThana(userAddr?.city || res.dealer.address?.thana || '');
      setDistributionDistrict(userAddr?.state || res.dealer.address?.district || '');
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
  const grandTotal = subtotal;
  const paidVal = parseFloat(paidAmount) || 0;
  const dueAmount = Math.max(0, grandTotal - paidVal);
  const isPaymentExcessive = paidVal > grandTotal || (paymentMethod === 'wallet' && paidVal > (dealer?.commissionWallet || 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealer) return;

    if (!phone || phone.trim() === '') {
      toast.error('Please enter a valid mobile number.');
      return;
    }
    if (phone.startsWith('G-')) {
      toast.error('Please enter your actual mobile number.');
      return;
    }
    if (!addressLine || addressLine.trim() === '') {
      toast.error('Please enter your shipping address line (village/road/street).');
      return;
    }
    if (!division) {
      toast.error('Please select your division.');
      return;
    }
    if (!district) {
      toast.error('Please select your district.');
      return;
    }
    if (!thana) {
      toast.error('Please select your thana/upazila.');
      return;
    }

    if (totalQuantity <= 0) {
      toast.error('Order quantity must be greater than 0');
      return;
    }

    if (paymentMethod === 'wallet' && paidVal > (dealer.commissionWallet || 0)) {
      toast.error(`Payment amount cannot exceed your available wallet balance of ৳${(dealer.commissionWallet || 0).toLocaleString()} BDT.`);
      return;
    }

    if (paidVal > grandTotal) {
      toast.error('Payment amount cannot be greater than the Grand Total BDT.');
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

    if (paymentMethod === 'due' && !estimatedPaymentDate) {
      toast.error('Please specify an estimated payment date.');
      return;
    }

    if ((paymentMethod === 'bkash' || paymentMethod === 'nagad')) {
      if (mfsVerificationType === 'number' && !paymentNumber) {
        toast.error('Please enter your Payment Number for verification.');
        return;
      }
      if (mfsVerificationType === 'trx' && !transactionNumber) {
        toast.error('Please enter the Transaction ID (TxnID) for verification.');
        return;
      }
    }

    if (paymentMethod === 'bank-transfer') {
      if (!bankName) {
        toast.error('Please enter the Bank Name.');
        return;
      }
      if (!transactionNumber) {
        toast.error('Please enter the Transaction ID / Ref.');
        return;
      }
    }

    const confirmResult = await Swal.fire({
      title: 'Submit Order Request?',
      html: `Order total: ৳${grandTotal.toLocaleString()} BDT.<br/>Dues logged: ৳${dueAmount.toLocaleString()} BDT.<br/>Commission to be earned: ৳${commissionApplied.toLocaleString()} BDT.`,
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
        estimatedPaymentDate: paymentMethod === 'due' ? estimatedPaymentDate : undefined,
        paymentNumber: (['bkash', 'nagad'].includes(paymentMethod) && mfsVerificationType === 'number') ? paymentNumber : undefined,
        transactionNumber: (['bkash', 'nagad'].includes(paymentMethod) && mfsVerificationType === 'trx') 
          ? transactionNumber 
          : (paymentMethod === 'bank-transfer' ? transactionNumber : undefined),
        bankName: paymentMethod === 'bank-transfer' ? bankName : undefined,
        phone,
        addressLine,
        division,
        thana,
        district,
        distributionDistrict: district,
        orderType: 'by-user',
      });

      if (res.success) {
        Swal.fire({
          title: 'Order Placed!',
          text: `Your order has been recorded as Invoice ${res.sale?.invoiceNumber}.`,
          icon: 'success'
        });
        setItems([{ productName: 'Premium Silage Bag (40kg)', productType: 'bag', quantity: 100, unitPrice: 380 }]);
        setPaidAmount('0');
        setEstimatedPaymentDate('');
        setPaymentNumber('');
        setTransactionNumber('');
        setBankName('');
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

            {/* Shipping details */}
            <div className="border-t pt-4 space-y-4">
              <h3 className="text-sm font-bold text-primary">Shipping Address & Contact Info</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-600 mb-1 block">Mobile Number <span className="text-rose-500">*</span></label>
                  <Input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 017XXXXXXXX"
                    className="border-border"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-600 mb-1 block">Address Line (Village/Road/Street) <span className="text-rose-500">*</span></label>
                  <Input
                    type="text"
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    placeholder="e.g. Ward 3, Green Road"
                    className="border-border"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-600 mb-1 block">Division <span className="text-rose-500">*</span></label>
                  <Select
                    value={division}
                    onValueChange={(val) => {
                      setDivision(val || '');
                      setDistrict('');
                      setThana('');
                    }}
                  >
                    <SelectTrigger className="border-border">
                      <SelectValue placeholder="Select Division" />
                    </SelectTrigger>
                    <SelectContent>
                      {divisions.map((div) => (
                        <SelectItem key={div} value={div}>{div}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-600 mb-1 block">District <span className="text-rose-500">*</span></label>
                  <Select
                    value={district}
                    disabled={!division}
                    onValueChange={(val) => {
                      setDistrict(val || '');
                      setThana('');
                    }}
                  >
                    <SelectTrigger className="border-border">
                      <SelectValue placeholder="Select District" />
                    </SelectTrigger>
                    <SelectContent>
                      {division && bdDivisions[division] ? (
                        bdDivisions[division].map((dist) => (
                          <SelectItem key={dist} value={dist}>{dist}</SelectItem>
                        ))
                      ) : (
                        <SelectItem value="_empty" disabled>Select Division first</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-600 mb-1 block">Thana / Upazila <span className="text-rose-500">*</span></label>
                  <Select
                    value={thana}
                    disabled={!district}
                    onValueChange={(val) => setThana(val || '')}
                  >
                    <SelectTrigger className="border-border">
                      <SelectValue placeholder="Select Thana" />
                    </SelectTrigger>
                    <SelectContent>
                      {district && bdLocations[district] ? (
                        bdLocations[district].map((th) => (
                          <SelectItem key={th} value={th}>{th}</SelectItem>
                        ))
                      ) : (
                        <SelectItem value="_empty" disabled>Select District first</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
              <div>
                <label className="text-xs font-semibold text-primary mb-1 block">Payment Method</label>
                <Select value={paymentMethod} onValueChange={(val: any) => {
                  setPaymentMethod(val);
                  if (val === 'due' || val === 'cod') {
                    setPaidAmount('0');
                  }
                }}>
                  <SelectTrigger className="border-border">
                    <SelectValue placeholder="Select Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank-transfer">Bank Direct Transfer</SelectItem>
                    <SelectItem value="cash">Cash Settlement</SelectItem>
                    <SelectItem value="cod">Cash on Delivery (COD)</SelectItem>
                    <SelectItem value="due">Due / Credit</SelectItem>
                    <SelectItem value="bkash">bKash</SelectItem>
                    <SelectItem value="nagad">Nagad</SelectItem>
                    <SelectItem value="wallet">Commission Wallet (Balance: ৳{(dealer?.commissionWallet || 0).toLocaleString()})</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Dynamic payment info fields */}
            {paymentMethod === 'due' && (
              <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/10">
                <label className="text-xs font-semibold text-primary mb-1 block">Estimated Payment Date</label>
                <Input
                  type="date"
                  value={estimatedPaymentDate}
                  onChange={(e) => setEstimatedPaymentDate(e.target.value)}
                  className="border-border"
                  required
                />
              </div>
            )}

            {(paymentMethod === 'bkash' || paymentMethod === 'nagad') && (
              <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/10 space-y-3">
                <div className="text-xs text-muted-foreground leading-relaxed flex flex-col gap-1.5">
                  <span className="font-bold text-primary capitalize">{paymentMethod} Guideline:</span> 
                  <div className="flex items-center bg-white p-2 rounded border w-fit">
                    <span className="flex items-center gap-1.5">
                      Send money to: <strong className="text-zinc-900 font-bold">{contactConfig.bkashNagadNumber}</strong>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="h-5 w-5 text-primary hover:bg-primary/5 shrink-0 inline-flex"
                        onClick={() => copyToClipboard(contactConfig.bkashNagadNumber, 'number')}
                      >
                        {copiedText === 'number' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </span>
                  </div>
                </div>

                <div className="flex gap-4 items-center border-t pt-2">
                  <span className="text-[11px] font-bold text-zinc-700">Verification Via:</span>
                  <label className="flex items-center gap-1.5 text-xs text-zinc-700 cursor-pointer">
                    <input
                      type="radio"
                      name="mfsVerificationType"
                      value="number"
                      checked={mfsVerificationType === 'number'}
                      onChange={() => setMfsVerificationType('number')}
                      className="accent-primary"
                    />
                    Payment Number
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-zinc-700 cursor-pointer">
                    <input
                      type="radio"
                      name="mfsVerificationType"
                      value="trx"
                      checked={mfsVerificationType === 'trx'}
                      onChange={() => setMfsVerificationType('trx')}
                      className="accent-primary"
                    />
                    Transaction ID
                  </label>
                </div>

                <div>
                  {mfsVerificationType === 'number' ? (
                    <div>
                      <label className="text-[10px] font-bold text-primary mb-0.5 block">Payment Number (Account)</label>
                      <Input
                        type="text"
                        placeholder="01XXXXXXXXX"
                        value={paymentNumber}
                        onChange={(e) => setPaymentNumber(e.target.value)}
                        className="border-border h-9"
                        required
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="text-[10px] font-bold text-primary mb-0.5 block">Transaction ID (TxnID)</label>
                      <Input
                        type="text"
                        placeholder="e.g. TRX123456"
                        value={transactionNumber}
                        onChange={(e) => setTransactionNumber(e.target.value)}
                        className="border-border h-9"
                        required
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {paymentMethod === 'bank-transfer' && (
              <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/10 space-y-3">
                <div className="text-xs text-muted-foreground leading-relaxed flex flex-col gap-1.5">
                  <span className="font-bold text-primary">Bank details:</span> 
                  <div className="text-xs text-muted-foreground leading-relaxed space-y-1.5 bg-white p-2.5 rounded border">
                    <div>
                      Bank Name: <strong className="text-zinc-900 font-semibold">{contactConfig.bankDetails.bankName}</strong>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span>Account Name: <strong className="text-zinc-900 font-semibold">{contactConfig.bankDetails.accountName}</strong></span>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="h-5 w-5 text-primary hover:bg-primary/5 shrink-0 inline-flex align-middle"
                        onClick={() => copyToClipboard(contactConfig.bankDetails.accountName, 'bank_acc_name')}
                      >
                        {copiedText === 'bank_acc_name' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span>Account: <strong className="text-zinc-900 font-semibold">{contactConfig.bankDetails.accountNo}</strong></span>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="h-5 w-5 text-primary hover:bg-primary/5 shrink-0 inline-flex align-middle"
                        onClick={() => copyToClipboard(contactConfig.bankDetails.accountNo, 'bank')}
                      >
                        {copiedText === 'bank' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span>Routing Number: <strong className="text-zinc-900 font-semibold">{contactConfig.bankDetails.routingNo}</strong></span>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="h-5 w-5 text-primary hover:bg-primary/5 shrink-0 inline-flex align-middle"
                        onClick={() => copyToClipboard(contactConfig.bankDetails.routingNo, 'bank_routing')}
                      >
                        {copiedText === 'bank_routing' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-primary mb-0.5 block">Your Bank Name</label>
                    <Input
                      type="text"
                      placeholder="e.g. Islami Bank, DBBL, etc."
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="border-border h-9"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-primary mb-0.5 block">Transaction ID / Ref</label>
                    <Input
                      type="text"
                      placeholder="e.g. TXN987654"
                      value={transactionNumber}
                      onChange={(e) => setTransactionNumber(e.target.value)}
                      className="border-border h-9"
                      required
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invoice Checkout Summary */}
        <Card className="lg:col-span-4 border-border bg-card/70 lg:sticky lg:top-6 h-fit">
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
                <span className="text-primary font-semibold">Estimated Commission (To Wallet)</span>
                <span className="font-semibold text-primary">৳{commissionApplied.toLocaleString()}</span>
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
                <span className={`font-bold text-right ${isPaymentExcessive || dueAmount > (dealer.creditLimit - dealer.currentDues) ? 'text-rose-600' : 'text-primary'}`}>
                  {isPaymentExcessive ? 'Invalid Amount' : (dueAmount > (dealer.creditLimit - dealer.currentDues) ? 'Exceeded' : 'Approved')}
                </span>
              </div>
            </div>

            <Button type="submit" disabled={submitting || isPaymentExcessive} className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-2">
              {submitting ? 'Submitting Request...' : 'Submit Order Request'}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
