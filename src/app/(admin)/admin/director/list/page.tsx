'use client';

import React, { useEffect, useState } from 'react';
import { getDirectorSummary } from '@/app/actions/director';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Coins, Mail, Phone, Award } from 'lucide-react';
import { toast } from 'sonner';

export default function DirectorListPage() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const sum = await getDirectorSummary();
      setSummary(sum);
    } catch (err: any) {
      toast.error('Failed to load directors list: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return <div className="text-center py-20 text-muted-foreground">Loading Director Directory...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">All Directors List</h1>
        <p className="text-muted-foreground">Directory of farm shareholders, total capital contributions, and equity distribution.</p>
      </div>

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
                <TableRow>
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
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No directors found in the system.
                    </TableCell>
                  </TableRow>
                ) : (
                  summary.directorDetails.map((d: any) => (
                    <TableRow key={d.email} className="hover:bg-muted/30">
                      <TableCell className="font-semibold text-primary">{d.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5" /> {d.email}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5" /> {d.phone || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell className="font-bold text-right">
                        ৳{(d.invested ?? 0).toLocaleString()} BDT
                      </TableCell>
                      <TableCell className="font-extrabold text-primary text-right">
                        <span className="inline-flex items-center gap-1 bg-primary/10 px-2.5 py-0.5 rounded-full text-xs">
                          <Award className="h-3.5 w-3.5 text-primary" /> {(d.equity ?? 0).toFixed(2)}%
                        </span>
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
