'use client';

import React, { useEffect, useState } from 'react';
import { getPersonalDirectorDashboardData } from '@/app/actions/director';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Coins, Calendar, DollarSign, Wallet, RefreshCw, Award, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format, isValid } from 'date-fns';
import OrderTrackerModal from '@/components/user/OrderTrackerModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function DirectorDashboard() {
  const [data, setData] = useState<any>(null);
  const [onlineOrders, setOnlineOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [trackerOpen, setTrackerOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Fetch online orders
      const ordersRes = await fetch('/api/orders');
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOnlineOrders(ordersData);
      }

      const res = await getPersonalDirectorDashboardData();
      setData(res);
    } catch (err: any) {
      toast.error('Failed to load director dashboard: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center py-20 text-muted-foreground text-sm">
          Loading your personal investment dashboard...
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 text-rose-500 text-sm">
        Failed to load dashboard data.
      </div>
    );
  }

  const joinDateRaw = data.joiningDate ? new Date(data.joiningDate) : null;
  const formattedJoinDate = joinDateRaw && isValid(joinDateRaw) 
    ? format(joinDateRaw, "dd MMMM yyyy") 
    : "N/A";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">Director Dashboard</h1>
          <p className="text-sm text-muted-foreground">Monitor your personal capitalization holdings, dividends, and equity statistics.</p>
        </div>
        <Button onClick={loadData} size="sm" variant="outline" className="border-primary/20 text-primary hover:bg-primary/5 h-8">
          <RefreshCw className="h-3.5 w-3.5 mr-1" /> Refresh Portal
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card className="border-primary/20 bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1.5 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-muted-foreground truncate">Joining Date</CardTitle>
            <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-base sm:text-xl font-bold text-foreground truncate">
              {formattedJoinDate}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 sm:mt-1 truncate">Registered board entry date</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1.5 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-muted-foreground truncate">Total Invested</CardTitle>
            <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-base sm:text-xl font-bold text-primary truncate">
              ৳{(data.totalInvestment ?? 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 sm:mt-1 truncate">Total capital contribution</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1.5 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-muted-foreground truncate">Dividends Received</CardTitle>
            <Wallet className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-base sm:text-xl font-bold text-emerald-600 truncate">
              ৳{(data.dividendReceived ?? 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 sm:mt-1 truncate">Approved & released payouts</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5 backdrop-blur-sm col-span-2 md:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-1.5 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-muted-foreground truncate">Pending Payouts</CardTitle>
            <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-base sm:text-xl font-bold text-amber-600 truncate">
              ৳{(data.dividendPending ?? 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 sm:mt-1 truncate">Awaiting release approval</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Investment logs and online e-commerce shop orders */}
      <Tabs defaultValue="investment" className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-[400px] bg-muted">
          <TabsTrigger value="investment" className="font-bold">Equity & Dividends</TabsTrigger>
          <TabsTrigger value="online" className="font-bold">Online Shop Orders</TabsTrigger>
        </TabsList>

        {/* Equity & Dividends Section */}
        <TabsContent value="investment" className="mt-4 space-y-6">
          {/* Investment Records Table */}
          <Card className="border-border bg-card/70">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                <Coins className="h-5 w-5 text-primary" /> Capital Contribution Log
              </CardTitle>
              <CardDescription className="text-xs">Individual shares and logged investments registered to your account.</CardDescription>
            </CardHeader>
            <CardContent>
              {data.investments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-xs">No registered investment records.</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs font-bold uppercase">Date</TableHead>
                        <TableHead className="text-xs font-bold uppercase">Payment Method</TableHead>
                        <TableHead className="text-xs font-bold uppercase">Notes</TableHead>
                        <TableHead className="text-xs font-bold uppercase text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.investments.map((inv: any) => {
                        const invDate = inv.date ? new Date(inv.date) : new Date();
                        return (
                          <TableRow key={inv._id}>
                            <TableCell className="text-xs font-medium whitespace-nowrap">
                              {isValid(invDate) ? format(invDate, "dd MMM yyyy") : "N/A"}
                            </TableCell>
                            <TableCell className="text-xs capitalize font-medium">
                              {inv.paymentMethod || 'Bank Transfer'}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground max-w-[250px] truncate" title={inv.notes}>
                              {inv.notes || '—'}
                            </TableCell>
                            <TableCell className="text-xs font-bold text-right">
                              ৳{(inv.investmentAmount ?? 0).toLocaleString()} BDT
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dividend Payout History Table */}
          <Card className="border-border bg-card/70">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                <Coins className="h-5 w-5 text-primary" /> Dividend Payout History
              </CardTitle>
              <CardDescription className="text-xs">All profits declared and allocated to your equity balance.</CardDescription>
            </CardHeader>
            <CardContent>
              {data.dividends.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-xs">No dividends declared or received yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs font-bold uppercase">Date</TableHead>
                        <TableHead className="text-xs font-bold uppercase">Details</TableHead>
                        <TableHead className="text-xs font-bold uppercase">Status</TableHead>
                        <TableHead className="text-xs font-bold uppercase text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.dividends.map((div: any) => {
                        const divDate = div.date ? new Date(div.date) : new Date();
                        return (
                          <TableRow key={div._id}>
                            <TableCell className="text-xs font-medium whitespace-nowrap">
                              {isValid(divDate) ? format(divDate, "dd MMM yyyy") : "N/A"}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground max-w-[300px] truncate" title={div.description}>
                              {div.description || '—'}
                            </TableCell>
                            <TableCell className="text-xs font-medium">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                                div.status === 'released' ? 'bg-primary/10 text-primary' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {div.status || 'released'}
                              </span>
                            </TableCell>
                            <TableCell className="text-xs font-bold text-primary text-right">
                              ৳{(div.amount ?? 0).toLocaleString()} BDT
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Online Shop Orders History */}
        <TabsContent value="online" className="mt-4">
          <Card className="border-border bg-card/70">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" /> Online Shop Orders History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {onlineOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-xs">You haven't placed any online shop orders yet.</div>
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
