'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Coins, Mail, Phone, Award, TrendingUp, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DirectorDetail {
  name: string;
  email: string;
  phone: string;
  invested: number;
  weightedInvested: number;
  equity: number;
}

interface SummaryData {
  totalInvestmentsSum: number;
  directorDetails: DirectorDetail[];
  profitBeforeDividends: number;
  totalDividends: number;
  retainedEarnings: number;
  totalDirectors: number;
}

export default function DirectorListPage() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/director');
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to load directors');
      }
      const data = await res.json();
      setSummary(data);
    } catch (err: any) {
      toast.error('Failed to load directors list: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-muted-foreground">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="font-medium">Loading Director Directory...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">All Directors List</h1>
          <p className="text-muted-foreground">Directory of farm shareholders, total capital contributions, and equity distribution.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 border-primary/30 hover:bg-primary/5"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-border bg-card">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Total Directors</p>
                  <p className="text-3xl font-black text-primary mt-1">{summary.totalDirectors}</p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Total Capital</p>
                  <p className="text-2xl font-black text-primary mt-1">৳{summary.totalInvestmentsSum.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-green-100 flex items-center justify-center">
                  <Coins className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Net Profit</p>
                  <p className={`text-2xl font-black mt-1 ${summary.profitBeforeDividends >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    ৳{summary.profitBeforeDividends.toLocaleString()}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Director Table */}
      <Card className="border-border bg-card/70">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-primary flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" /> Shareholder Directory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-xs font-bold uppercase">#</TableHead>
                  <TableHead className="text-xs font-bold uppercase">Name</TableHead>
                  <TableHead className="text-xs font-bold uppercase">Email</TableHead>
                  <TableHead className="text-xs font-bold uppercase">Phone</TableHead>
                  <TableHead className="text-xs font-bold uppercase text-right">Total Invested</TableHead>
                  <TableHead className="text-xs font-bold uppercase text-right">Equity Share</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!(summary?.directorDetails?.length) ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-10 w-10 text-muted-foreground/40" />
                        <p className="font-medium">No directors found in the system.</p>
                        <p className="text-xs">Register directors from the User Management page.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  summary.directorDetails.map((d, idx) => (
                    <TableRow key={d.email} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="text-muted-foreground font-mono text-sm">{idx + 1}</TableCell>
                      <TableCell className="font-semibold text-primary">{d.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5 flex-shrink-0" /> {d.email}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5 flex-shrink-0" /> {d.phone || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell className="font-bold text-right">
                        ৳{(d.invested ?? 0).toLocaleString()} BDT
                      </TableCell>
                      <TableCell className="font-extrabold text-primary text-right">
                        <Badge
                          className="inline-flex items-center gap-1 bg-primary/10 text-primary border-primary/20 px-2.5 py-0.5 rounded-full text-xs font-bold"
                          variant="outline"
                        >
                          <Award className="h-3.5 w-3.5" /> {(d.equity ?? 0).toFixed(2)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
