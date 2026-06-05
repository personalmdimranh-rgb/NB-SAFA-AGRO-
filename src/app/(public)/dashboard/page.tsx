'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { getFarmerDashboardSummary } from '@/app/actions/farmer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DollarSign, ShieldCheck, Wallet, RefreshCw, Calendar, TrendingUp, ShoppingCart, User as UserIcon, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import OrderTrackerModal from '@/components/user/OrderTrackerModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [onlineOrders, setOnlineOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [trackerOpen, setTrackerOpen] = useState(false);
  const [isOrderTracker, setIsOrderTracker] = useState(false);

  const loadData = async (showLoading = false) => {
    if (!session?.user?.id) return;
    try {
      if (showLoading || (!data && !onlineOrders.length)) setLoading(true);
      
      const role = (session.user as any).role;

      // 1. Fetch online e-commerce orders
      const ordersRes = await fetch('/api/orders');
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOnlineOrders(ordersData);
      }

      // 2. Fetch farmer summary if role is farmer
      if (role === 'farmer') {
        const res = await getFarmerDashboardSummary((session.user as any).id);
        setData(res);
      } else {
        setData({ isGeneralUser: true });
      }
    } catch (err: any) {
      toast.error('Failed to load dashboard: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      loadData();
    }
  }, [session?.user?.id]);

  if (loading && !data) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  // Loader fallback
  function Loader2({ className, ...props }: any) {
    return <RefreshCw className={`animate-spin ${className}`} {...props} />;
  }

  const role = (session?.user as any)?.role;
  const isFarmer = role === 'farmer';

  if (!isFarmer) {
    // Render General User (Customer) Dashboard
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">Welcome back, {session?.user?.name}!</h1>
            <p className="text-sm text-muted-foreground">Manage your online purchases, track shipments, and view profile settings.</p>
          </div>
          <Button onClick={() => loadData(true)} size="sm" variant="outline" className="border-primary/20 text-primary hover:bg-primary/5 h-8">
            <RefreshCw className="h-3.5 w-3.5 mr-1" /> Refresh Portal
          </Button>
        </div>

        {/* Customer Profile Summary */}
        <Card className="border-primary/15 bg-card/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-primary flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-primary" /> Account Profile Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="font-semibold text-muted-foreground block uppercase">Name</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-50">{session?.user?.name}</span>
            </div>
            <div>
              <span className="font-semibold text-muted-foreground block uppercase">Email Address</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-50">{session?.user?.email}</span>
            </div>
            <div>
              <span className="font-semibold text-muted-foreground block uppercase">Phone Number</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-50">{(session?.user as any)?.phone || 'N/A'}</span>
            </div>
          </CardContent>
        </Card>

        {/* E-Commerce Order History */}
        <Card className="border-border bg-card/70">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" /> Online Orders History
            </CardTitle>
            <CardDescription className="text-xs">
              List of all retail products ordered online from our shop website.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {onlineOrders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-xs">
                You haven't placed any online shop orders yet. Browse our store to make a purchase.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Grand Total</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Payment Status</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {onlineOrders.map((order: any) => (
                      <TableRow key={order._id}>
                        <TableCell className="font-bold text-xs text-primary hover:underline">
                          <button
                            onClick={() => {
                              setSelectedSale(order);
                              setIsOrderTracker(true);
                              setTrackerOpen(true);
                            }}
                          >
                            #{order.shortId || order._id.slice(-8).toUpperCase()}
                          </button>
                        </TableCell>
                        <TableCell className="whitespace-nowrap font-medium text-xs">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs max-w-[200px] truncate">
                          {order.items?.map((it: any) => `${it.name} (x${it.quantity})`).join(', ')}
                        </TableCell>
                        <TableCell className="text-xs font-bold">৳{(order.totalAmount ?? 0).toLocaleString()}</TableCell>
                        <TableCell className="text-xs font-medium uppercase">{order.paymentMethod}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`capitalize ${
                            order.paymentStatus === 'Paid' ? 'bg-green-500/10 text-green-700 border-green-500/20' : 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
                          }`}>
                            {order.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`capitalize whitespace-nowrap ${
                              order.status === 'Delivered' ? 'bg-primary/10 text-primary border-primary/20' :
                              order.status === 'Cancelled' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                              order.status === 'Order Placed' ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' :
                              'bg-blue-500/10 text-blue-600 border-blue-500/20'
                            }`}>
                              {order.status || 'Order Placed'}
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-[10px] text-primary hover:text-primary hover:bg-primary/5 font-bold gap-1 border border-primary/10 rounded-md"
                              onClick={() => {
                                setSelectedSale(order);
                                setIsOrderTracker(true);
                                setTrackerOpen(true);
                              }}
                            >
                              Track
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <OrderTrackerModal 
          isOpen={trackerOpen} 
          onOpenChange={setTrackerOpen} 
          sale={selectedSale} 
        />
      </div>
    );
  }

  // Render Agro Farmer Dashboard
  const { farmer, recentSales } = data;
  const creditLimit = farmer?.creditLimit ?? 0;
  const currentDues = farmer?.currentDues ?? 0;
  const availableCredit = Math.max(0, creditLimit - currentDues);

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
          <Button onClick={() => loadData(true)} size="sm" variant="outline" className="border-primary/20 text-primary hover:bg-primary/5 h-8">
            <RefreshCw className="h-3.5 w-3.5 mr-1" /> Refresh
          </Button>
        </div>
      </div>

      {/* Credit & Dues Widgets */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
        <Card className="border-primary/20 bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1.5 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-muted-foreground truncate">Current Dues</CardTitle>
            <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-base sm:text-xl font-bold text-rose-700 truncate">
              ৳{currentDues.toLocaleString()}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 truncate">Pending payments to clear</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1.5 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-muted-foreground truncate">Credit Limit</CardTitle>
            <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-base sm:text-xl font-bold text-zinc-700 truncate">
              ৳{creditLimit.toLocaleString()}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 truncate">Maximum allowed credit line</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5 backdrop-blur-sm col-span-2 md:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-1.5 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-muted-foreground truncate">Available Credit</CardTitle>
            <Wallet className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-base sm:text-xl font-bold text-primary truncate">
              ৳{availableCredit.toLocaleString()}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 truncate">Available credit to order</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs to show offline invoices & online orders */}
      <Tabs defaultValue="offline" className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-[400px] bg-muted">
          <TabsTrigger value="offline" className="font-bold">Distribution Invoices</TabsTrigger>
          <TabsTrigger value="online" className="font-bold">Online Shop Orders</TabsTrigger>
        </TabsList>
        
        {/* Offline Invoices (Sales Ledger) */}
        <TabsContent value="offline" className="mt-4">
          <Card className="border-border bg-card/70">
            <CardHeader>
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" /> Distribution Invoices History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentSales.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-xs">
                  No registered offline sales invoices found.
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
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={`capitalize ${
                                sale.status === 'delivery complete' ? 'bg-primary/10 text-primary border-primary/20' :
                                sale.status === 'cancel' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                                sale.status === 'pending' ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' :
                                'bg-blue-500/10 text-blue-600 border-blue-500/20'
                              }`}>
                                {sale.status || 'pending'}
                              </Badge>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-7 px-2 text-[10px] text-primary hover:text-primary hover:bg-primary/5 font-bold gap-1 border border-primary/10 rounded-md"
                                onClick={() => {
                                  setSelectedSale(sale);
                                  setIsOrderTracker(false);
                                  setTrackerOpen(true);
                                }}
                              >
                                Track
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Online Shop Orders */}
        <TabsContent value="online" className="mt-4">
          <Card className="border-border bg-card/70">
            <CardHeader>
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" /> Online Shop Orders History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {onlineOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-xs">
                  You haven't placed any online shop orders yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Grand Total</TableHead>
                        <TableHead>Payment Method</TableHead>
                        <TableHead>Payment Status</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {onlineOrders.map((order: any) => (
                        <TableRow key={order._id}>
                          <TableCell className="font-bold text-xs text-primary hover:underline">
                            <button
                              onClick={() => {
                                setSelectedSale(order);
                                setIsOrderTracker(true);
                                setTrackerOpen(true);
                              }}
                            >
                              #{order.shortId || order._id.slice(-8).toUpperCase()}
                            </button>
                          </TableCell>
                          <TableCell className="whitespace-nowrap font-medium text-xs">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs max-w-[200px] truncate">
                            {order.items?.map((it: any) => `${it.name} (x${it.quantity})`).join(', ')}
                          </TableCell>
                          <TableCell className="text-xs font-bold">৳{(order.totalAmount ?? 0).toLocaleString()}</TableCell>
                          <TableCell className="text-xs font-medium uppercase">{order.paymentMethod}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`capitalize ${
                              order.paymentStatus === 'Paid' ? 'bg-green-500/10 text-green-700 border-green-500/20' : 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
                            }`}>
                              {order.paymentStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={`capitalize whitespace-nowrap ${
                                order.status === 'Delivered' ? 'bg-primary/10 text-primary border-primary/20' :
                                order.status === 'Cancelled' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                                order.status === 'Order Placed' ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' :
                                'bg-blue-500/10 text-blue-600 border-blue-500/20'
                              }`}>
                                {order.status || 'Order Placed'}
                              </Badge>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-[10px] text-primary hover:text-primary hover:bg-primary/5 font-bold gap-1 border border-primary/10 rounded-md"
                                onClick={() => {
                                  setSelectedSale(order);
                                  setIsOrderTracker(true);
                                  setTrackerOpen(true);
                                }}
                              >
                                Track
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <OrderTrackerModal 
        isOpen={trackerOpen} 
        onOpenChange={setTrackerOpen} 
        sale={selectedSale} 
      />
    </div>
  );
}
