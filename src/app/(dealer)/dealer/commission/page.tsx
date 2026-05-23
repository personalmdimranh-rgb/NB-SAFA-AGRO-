'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { getDealerDashboardSummary } from '@/app/actions/dealer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Coins, Award, DollarSign, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function DealerCommission() {
  const { data: session } = useSession();
  const [sales, setSales] = useState<any[]>([]);
  const [dealer, setDealer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!session?.user?.id) return;
      try {
        setLoading(true);
        const res = await getDealerDashboardSummary((session.user as any).id);
        setSales(res.recentSales);
        setDealer(res.dealer);
      } catch (err: any) {
        toast.error('Failed to load commission wallet data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [session]);

  if (loading) {
    return <div className="text-center py-20 text-muted-foreground">Loading your commission account...</div>;
  }

  const commissionAccruedList = sales.filter((sale) => sale.commissionApplied > 0);
  const totalEarnedCommissions = commissionAccruedList.reduce((sum, sale) => sum + sale.commissionApplied, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">My Commission Wallet</h1>
        <p className="text-sm text-muted-foreground">Track commission wallet balances accrued from Maize Silage bag purchases</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Commission Wallet Balance</CardTitle>
            <Coins className="h-4.5 w-4.5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              ৳{dealer.commissionWallet.toLocaleString()}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Available balance in your account wallet</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Commission Rate</CardTitle>
            <Award className="h-4.5 w-4.5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              ৳{dealer.commissionRate}/bag
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Commission earned per silage bag ordered</p>
          </CardContent>
        </Card>

        <Card className="border-primary/30 bg-primary/5 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Cumulative Commissions</CardTitle>
            <DollarSign className="h-4.5 w-4.5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              ৳{totalEarnedCommissions.toLocaleString()}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Sum of all earned commissions</p>
          </CardContent>
        </Card>
      </div>

      {/* Commission Ledger */}
      <Card className="border-primary/20 bg-card/70">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" /> Commission Accrual History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {commissionAccruedList.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-xs">No commissions accrued yet. Place silage orders to earn commissions.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Accrual Date</TableHead>
                    <TableHead className="text-center">Silage Bags Ordered</TableHead>
                    <TableHead className="text-right">Commission Rate</TableHead>
                    <TableHead className="text-right font-semibold">Accrued Commission</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissionAccruedList.map((sale) => {
                    // count total bag quantities
                    const qty = sale.items.reduce((sum: number, it: any) => sum + it.quantity, 0);
                    return (
                      <TableRow key={sale._id}>
                        <TableCell className="font-bold text-xs text-foreground">{sale.invoiceNumber}</TableCell>
                        <TableCell className="whitespace-nowrap font-medium text-xs">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {new Date(sale.date).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-center font-semibold text-xs">{qty} bags</TableCell>
                        <TableCell className="text-right text-xs">৳{dealer.commissionRate}/bag</TableCell>
                        <TableCell className="text-right font-bold text-xs text-primary">৳{sale.commissionApplied.toLocaleString()}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
