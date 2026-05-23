/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import { createTransaction, getLedgerBalances, getTransactions } from '@/app/actions/accounts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DollarSign, ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Calendar, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

export default function AccountsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [balances, setBalances] = useState({ cashBalance: 0, bankBalance: 0, totalBalance: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');

  // Form states
  const [type, setType] = useState<'income' | 'expense' | 'transfer'>('income');
  const [source, setSource] = useState<'cash' | 'bank'>('cash');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [bankName, setBankName] = useState('');
  const [accountNo, setAccountNo] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [txs, bals] = await Promise.all([getTransactions(), getLedgerBalances()]);
      setTransactions(txs);
      setBalances(bals);
    } catch (err: any) {
      toast.error('Failed to load accounts data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid category and amount');
      return;
    }

    // SwAlert Confirmation
    const result = await Swal.fire({
      title: 'Confirm Transaction',
      text: `Are you sure you want to log this ${type} of ${amount} BDT?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: 'var(--color-primary, #10b981)',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, log it!'
    });

    if (!result.isConfirmed) return;

    try {
      setSubmitting(true);
      const response = await createTransaction({
        type,
        source,
        category,
        amount: parseFloat(amount),
        description,
        date,
        bankDetails: source === 'bank' ? { bankName, accountNo } : undefined,
      });

      if (response.success) {
        toast.success('Transaction logged successfully!');
        // Reset form
        setCategory('');
        setAmount('');
        setDescription('');
        setBankName('');
        setAccountNo('');
        loadData();
      }
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTxs = transactions.filter((tx) => {
    if (filterType === 'all') return true;
    return tx.type === filterType;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Financial Ledger</h1>
          <p className="text-muted-foreground">Manage cash & bank transaction flows for Shafa Agro</p>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cash Ledger Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              ৳{balances.cashBalance.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">In-hand physical cash reserves</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Bank Accounts Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              ৳{balances.bankBalance.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Sum of all linked bank accounts</p>
          </CardContent>
        </Card>

        <Card className="border-primary/30 bg-primary/5 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Net Balances</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary font-extrabold">
              ৳{balances.totalBalance.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total operational liquidity</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Transaction Logger Form */}
        <Card className="lg:col-span-4 border-primary/20 bg-card/70">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-primary">
              <PlusCircle className="h-5 w-5 text-primary" /> Log Transaction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-primary block mb-1">
                  Type
                </label>
                <Select value={type} onValueChange={(val: any) => setType(val)}>
                  <SelectTrigger className="w-full border-primary/20">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="transfer">Cash ↔ Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-primary block mb-1">
                  Source / Account
                </label>
                <Select value={source} onValueChange={(val: any) => setSource(val)}>
                  <SelectTrigger className="w-full border-primary/20">
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash In-Hand</SelectItem>
                    <SelectItem value="bank">Bank Account</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {source === 'bank' && (
                <div className="grid grid-cols-2 gap-2 border p-2 rounded-lg bg-muted/50">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">Bank Name</label>
                    <Input
                      placeholder="e.g. Dutch Bangla"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="h-8 border-primary/20 text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">Account No</label>
                    <Input
                      placeholder="e.g. 122.100.123"
                      value={accountNo}
                      onChange={(e) => setAccountNo(e.target.value)}
                      className="h-8 border-primary/20 text-xs"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-primary block mb-1">
                  Category
                </label>
                <Select value={category} onValueChange={(val: any) => setCategory(val || '')}>
                  <SelectTrigger className="w-full border-primary/20">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {type === 'income' && (
                      <>
                        <SelectItem value="Silage Sale">Silage Sale</SelectItem>
                        <SelectItem value="Due Collection">Due Collection</SelectItem>
                        <SelectItem value="Investment">Director Investment</SelectItem>
                        <SelectItem value="Other Income">Other Income</SelectItem>
                      </>
                    )}
                    {type === 'expense' && (
                      <>
                        <SelectItem value="Raw Materials">Raw Materials (Silage)</SelectItem>
                        <SelectItem value="Salary">Employee Salary</SelectItem>
                        <SelectItem value="Dividend">Dividend Released</SelectItem>
                        <SelectItem value="Rent">Rent & Utilities</SelectItem>
                        <SelectItem value="Other Expense">Other Expense</SelectItem>
                      </>
                    )}
                    {type === 'transfer' && (
                      <SelectItem value="Liquidity Transfer">Internal Transfer</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-primary block mb-1">
                  Amount (BDT)
                </label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="border-primary/20"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-primary block mb-1">
                  Date
                </label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="border-primary/20"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-primary block mb-1">
                  Description
                </label>
                <Input
                  placeholder="Memo/Notes"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="border-primary/20"
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                {submitting ? 'Submitting...' : 'Log Transaction'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Ledger Transaction History */}
        <Card className="lg:col-span-8 border-primary/20 bg-card/70">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold text-primary">
              General Ledger Records
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Filter:</span>
              <Select value={filterType} onValueChange={(val: any) => setFilterType(val || 'all')}>
                <SelectTrigger className="w-[120px] h-8 border-primary/20">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Records</SelectItem>
                  <SelectItem value="income">Incomes</SelectItem>
                  <SelectItem value="expense">Expenses</SelectItem>
                  <SelectItem value="transfer">Transfers</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-10 text-muted-foreground">Loading ledger transactions...</div>
            ) : filteredTxs.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">No transactions recorded.</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTxs.map((tx) => (
                      <TableRow key={tx._id}>
                        <TableCell className="whitespace-nowrap font-medium text-xs">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {new Date(tx.date).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          {tx.type === 'income' && (
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                              <ArrowUpRight className="h-3 w-3 mr-1 inline" /> Income
                            </Badge>
                          )}
                          {tx.type === 'expense' && (
                            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20">
                              <ArrowDownLeft className="h-3 w-3 mr-1 inline" /> Expense
                            </Badge>
                          )}
                          {tx.type === 'transfer' && (
                            <Badge variant="outline" className="bg-secondary/50 text-secondary-foreground border-secondary hover:bg-secondary">
                              <ArrowLeftRight className="h-3 w-3 mr-1 inline" /> Transfer
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="capitalize text-xs font-semibold">
                          {tx.source}
                          {tx.source === 'bank' && tx.bankDetails?.bankName && (
                            <span className="block text-[10px] text-muted-foreground">
                              {tx.bankDetails.bankName}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs font-medium">{tx.category}</TableCell>
                        <TableCell className={`text-right font-bold text-xs ${
                          tx.type === 'income' ? 'text-primary' : tx.type === 'expense' ? 'text-destructive' : 'text-muted-foreground'
                        }`}>
                          ৳{tx.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                          {tx.description}
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
    </div>
  );
}
