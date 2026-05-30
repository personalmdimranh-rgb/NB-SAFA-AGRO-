'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { getFarmerDashboardSummary } from '@/app/actions/farmer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DollarSign, ShieldCheck, Wallet, RefreshCw, Calendar, TrendingUp, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export default function FarmerDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!session?.user?.id) return;
    try {
      setLoading(true);
      const res = await getFarmerDashboardSummary((session.user as any).id);
      setData(res);
    } catch (err: any) {
      toast.error('Failed to load dashboard: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [session]);

  if (loading) {
    return <div className="text-center py-20 text-muted-foreground">Loading your dashboard...</div>;
  }

  if (!data) {
    return (
      <div className="text-center py-20 text-rose-500">
        Farmer account details not found. Please contact administration.
      </div>
    );
  }

  const { farmer, recentSales } = data;
  const availableCredit = Math.max(0, farmer.creditLimit - farmer.currentDues);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">Welcome, {session?.user?.name}!</h1>
          <p className="text-sm text-muted-foreground">Farmer Profile: <span className="font-bold text-primary">{farmer.name}</span></p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => router.push('/dashboard/order-new')} 
            size="sm" 
            className="bg-primary hover:bg-primary/95 text-white h-8 font-semibold gap-1.5"
          >
            <ShoppingCart className="h-4 w-4" /> Place New Order
          </Button>
          <Button onClick={loadData} size="sm" variant="outline" className="border-primary/20 text-primary hover:bg-primary/5 h-8">
            <RefreshCw className="h-3.5 w-3.5 mr-1" /> Refresh
          </Button>
        </div>
      </div>

      {/* Credit & Dues Widgets */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-primary/20 bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Current Dues</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-rose-700">
              ৳{farmer.currentDues.toLocaleString()}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Pending payments to clear</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Credit Limit</CardTitle>
            <ShieldCheck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-zinc-700">
              ৳{farmer.creditLimit.toLocaleString()}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Maximum allowed credit line</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Available Credit</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-primary">
              ৳{availableCredit.toLocaleString()}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Available credit for placing orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="border-border bg-card/70">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" /> Recent Invoices History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentSales.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-xs">
              You haven't placed any orders yet. Click "Place New Order" to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items Ordered</TableHead>
                    <TableHead>Subtotal</TableHead>
                    <TableHead>Grand Total</TableHead>
                    <TableHead>Due Balance</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Order Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentSales.map((sale: any) => (
                    <TableRow key={sale._id}>
                      <TableCell className="font-bold text-xs text-zinc-900">{sale.invoiceNumber}</TableCell>
                      <TableCell className="whitespace-nowrap font-medium text-xs">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {new Date(sale.date).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs max-w-[200px] truncate">
                        {sale.items.map((it: any) => `${it.productName} (x${it.quantity})`).join(', ')}
                      </TableCell>
                      <TableCell className="text-xs font-semibold">৳{(sale.subtotal ?? 0).toLocaleString()}</TableCell>
                      <TableCell className="text-xs font-bold text-primary">৳{(sale.grandTotal ?? 0).toLocaleString()}</TableCell>
                      <TableCell className="text-xs font-bold text-rose-700">৳{(sale.dueAmount ?? 0).toLocaleString()}</TableCell>
                      <TableCell>
                        {sale.paymentStatus === 'paid' && (
                          <Badge className="bg-primary/10 text-primary">Paid</Badge>
                        )}
                        {sale.paymentStatus === 'partially-paid' && (
                          <Badge className="bg-amber-50 text-amber-700">Partial</Badge>
                        )}
                        {sale.paymentStatus === 'unpaid' && (
                          <Badge className="bg-rose-50 text-rose-700">Unpaid</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`capitalize ${
                          sale.status === 'delivery complete' ? 'bg-primary/10 text-primary border-primary/20' :
                          sale.status === 'cancel' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                          sale.status === 'pending' ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' :
                          'bg-blue-500/10 text-blue-600 border-blue-500/20'
                        }`}>
                          {sale.status || 'pending'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
