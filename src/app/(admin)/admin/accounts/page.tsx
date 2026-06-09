/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Pagination } from '@/components/ui/pagination';
import { createTransaction, getLedgerBalances, getTransactions, deleteTransaction, updateTransaction } from '@/app/actions/accounts';
import { collectDue } from '@/app/actions/sales';
import { getDealers } from '@/app/actions/dealer';
import { getFarmers } from '@/app/actions/farmer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { DollarSign, ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Calendar, PlusCircle, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function AccountsPage() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [transactions, setTransactions] = useState<any[]>([]);
  const [balances, setBalances] = useState({ cashBalance: 0, bankBalance: 0, totalBalance: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');

  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const pageSize = 20;

  const [addOpen, setAddOpen] = useState(false);

  // Create Form states
  const [type, setType] = useState<'income' | 'expense' | 'transfer'>('income');
  const [source, setSource] = useState<'cash' | 'bank'>('cash');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [bankName, setBankName] = useState('');
  const [accountNo, setAccountNo] = useState('');

  // Due collection dropdown lists & selected states
  const [dealersList, setDealersList] = useState<any[]>([]);
  const [farmersList, setFarmersList] = useState<any[]>([]);
  const [buyerType, setBuyerType] = useState<'dealer' | 'farmer'>('dealer');
  const [buyerId, setBuyerId] = useState('');

  // Edit modal states
  const [editOpen, setEditOpen] = useState(false);
  const [editTx, setEditTx] = useState<any>(null);
  const [editType, setEditType] = useState<'income' | 'expense' | 'transfer'>('income');
  const [editSource, setEditSource] = useState<'cash' | 'bank'>('cash');
  const [editCategory, setEditCategory] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editBankName, setEditBankName] = useState('');
  const [editAccountNo, setEditAccountNo] = useState('');
  const [updating, setUpdating] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [txs, bals, dealersData, farmersData] = await Promise.all([
        getTransactions(),
        getLedgerBalances(),
        getDealers().catch(() => []),
        getFarmers().catch(() => []),
      ]);
      setTransactions(txs);
      setBalances(bals);
      setDealersList(dealersData);
      setFarmersList(farmersData);
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
    if (role === 'manager') {
      toast.error("You don't have permission");
      return;
    }
    if (!category || !amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid category and amount');
      return;
    }

    if (category === 'Due Collection' && !buyerId) {
      toast.error('Please select a dealer or farmer to collect dues from.');
      return;
    }

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
      let response;

      if (category === 'Due Collection' && buyerId) {
        const paymentMethod = source === 'cash' ? 'cash' : 'bank-transfer';
        response = await collectDue({
          buyerType,
          buyerId,
          amount: parseFloat(amount),
          paymentMethod,
          date,
          description: description || undefined,
          bankDetails: source === 'bank' ? { bankName, accountNo } : undefined,
        });
      } else {
        response = await createTransaction({
          type,
          source,
          category,
          amount: parseFloat(amount),
          description,
          date,
          bankDetails: source === 'bank' ? { bankName, accountNo } : undefined,
        });
      }

      if (response.success) {
        toast.success('Transaction logged successfully!');
        setCategory('');
        setAmount('');
        setDescription('');
        setBankName('');
        setAccountNo('');
        setBuyerId('');
        setBuyerType('dealer');
        setAddOpen(false);
        loadData();
      }
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (tx: any) => {
    setEditTx(tx);
    setEditType(tx.type);
    setEditSource(tx.source);
    setEditCategory(tx.category);
    setEditAmount(String(tx.amount));
    setEditDescription(tx.description || '');
    setEditDate(new Date(tx.date).toISOString().split('T')[0]);
    setEditBankName(tx.bankDetails?.bankName || '');
    setEditAccountNo(tx.bankDetails?.accountNo || '');
    setEditOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'manager') {
      toast.error("You don't have permission");
      return;
    }
    if (!editCategory || !editAmount || parseFloat(editAmount) <= 0) {
      toast.error('Please enter a valid category and amount');
      return;
    }

    try {
      setUpdating(true);
      const response = await updateTransaction(editTx._id, {
        type: editType,
        source: editSource,
        category: editCategory,
        amount: parseFloat(editAmount),
        description: editDescription,
        date: editDate,
        bankDetails: editSource === 'bank' ? { bankName: editBankName, accountNo: editAccountNo } : undefined,
      });

      if (response.success) {
        toast.success('Transaction updated successfully!');
        setEditOpen(false);
        loadData();
      }
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (tx: any) => {
    if (role === 'manager') {
      toast.error("You don't have permission");
      return;
    }
    const result = await Swal.fire({
      title: 'Delete Transaction?',
      html: `<p class="text-sm text-gray-600">This will permanently remove the <strong>${tx.type}</strong> entry of <strong>৳${tx.amount.toLocaleString()}</strong> (${tx.category}).</p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Delete it!',
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) return;

    try {
      await deleteTransaction(tx._id);
      toast.success('Transaction deleted successfully!');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete transaction');
    }
  };

  const filteredTxs = transactions.filter((tx) => {
    if (filterType === 'all') return true;
    return tx.type === filterType;
  });

  const totalPages = Math.ceil(filteredTxs.length / pageSize) || 1;
  const paginatedTxs = filteredTxs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Financial Ledger</h1>
          <p className="text-muted-foreground">Manage cash &amp; bank transaction flows for NB Safa Agro</p>
        </div>
        <Button
          onClick={() => setAddOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2"
        >
          <PlusCircle className="h-4 w-4" /> Add Transaction
        </Button>
      </div>

      {/* Balance Cards */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
        <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1.5 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium truncate">Cash Ledger Balance</CardTitle>
            <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-base sm:text-2xl font-bold text-primary truncate">
              ৳{balances.cashBalance.toLocaleString()}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 truncate">In-hand physical cash reserves</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-1.5 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium truncate">Bank Accounts Balance</CardTitle>
            <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-base sm:text-2xl font-bold text-primary truncate">
              ৳{balances.bankBalance.toLocaleString()}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 truncate">Sum of all linked bank accounts</p>
          </CardContent>
        </Card>

        <Card className="border-primary/30 bg-primary/5 backdrop-blur-sm col-span-2 md:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-1.5 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium truncate">Total Net Balances</CardTitle>
            <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary shrink-0" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-base sm:text-2xl font-black text-primary truncate">
              ৳{balances.totalBalance.toLocaleString()}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 truncate">Total operational liquidity</p>
          </CardContent>
        </Card>
      </div>

      {/* Log Transaction Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary">
              <PlusCircle className="h-5 w-5 text-primary" /> Log Transaction
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
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
                      <SelectItem value="Rent">Rent &amp; Utilities</SelectItem>
                      <SelectItem value="Other Expense">Other Expense</SelectItem>
                    </>
                  )}
                  {type === 'transfer' && (
                    <SelectItem value="Liquidity Transfer">Internal Transfer</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {type === 'income' && category === 'Due Collection' && (
              <div className="space-y-2 border p-3 rounded-lg bg-primary/5 border-primary/10">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-primary mb-1 block">Buyer Type</label>
                    <Select value={buyerType} onValueChange={(val: any) => { setBuyerType(val); setBuyerId(''); }}>
                      <SelectTrigger className="h-8 border-primary/20 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dealer">Dealer</SelectItem>
                        <SelectItem value="farmer">Farmer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-primary mb-1 block">
                      Select {buyerType === 'dealer' ? 'Dealer' : 'Farmer'}
                    </label>
                    <Select value={buyerId} onValueChange={(val: any) => setBuyerId(val)}>
                      <SelectTrigger className="h-8 border-primary/20 text-xs w-full">
                        {buyerId ? (
                          <span data-slot="select-value" className="flex flex-1 text-left truncate text-slate-800">
                            {buyerType === 'dealer'
                              ? (() => {
                                  const selectedDealer = dealersList.find(d => d._id === buyerId);
                                  return selectedDealer
                                    ? `${selectedDealer.userId?.name || 'Unknown'} (${selectedDealer.shopName})`
                                    : 'Select Dealer';
                                })()
                              : (() => {
                                  const selectedFarmer = farmersList.find(f => f._id === buyerId);
                                  return selectedFarmer ? selectedFarmer.name : 'Select Farmer';
                                })()
                            }
                          </span>
                        ) : (
                          <SelectValue placeholder={`Select ${buyerType === 'dealer' ? 'Dealer' : 'Farmer'}`} />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        {buyerType === 'dealer' ? (
                          dealersList.map((d) => (
                            <SelectItem key={d._id} value={d._id}>
                              {d.userId?.name || 'Unknown'} ({d.shopName}) {d.currentDues > 0 ? `· ৳${d.currentDues.toLocaleString()}` : ''}
                            </SelectItem>
                          ))
                        ) : (
                          farmersList.map((f) => (
                            <SelectItem key={f._id} value={f._id}>
                              {f.name} {f.currentDues > 0 ? `· ৳${f.currentDues.toLocaleString()}` : ''}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {buyerId && (
                  <div className="text-[11px] text-rose-700 font-semibold px-1 mt-1">
                    Current Outstanding Dues: ৳
                    {buyerType === 'dealer'
                      ? (dealersList.find(d => d._id === buyerId)?.currentDues || 0).toLocaleString()
                      : (farmersList.find(f => f._id === buyerId)?.currentDues || 0).toLocaleString()
                    }
                  </div>
                )}
              </div>
            )}

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

            <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddOpen(false)}
                className="w-full sm:flex-1 h-10 font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full sm:flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                {submitting ? 'Submitting...' : 'Log Transaction'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Ledger Transaction History */}
      <Card className="w-full border-primary/20 bg-card/70">
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
                      <TableHead className="w-[40px]">#</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-center w-[60px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTxs.map((tx, index) => (
                      <TableRow key={tx._id}>
                        <TableCell className="text-xs text-muted-foreground font-medium">
                          {(currentPage - 1) * pageSize + index + 1}
                        </TableCell>
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
                            <>
                              <span className="block text-[10px] text-muted-foreground font-semibold">
                                {tx.bankDetails.bankName}
                              </span>
                              {tx.bankDetails.accountNo && (
                                <span className="block text-[9px] text-muted-foreground/80">
                                  A/C: {tx.bankDetails.accountNo}
                                </span>
                              )}
                            </>
                          )}
                        </TableCell>
                        <TableCell className="text-xs font-medium">{tx.category}</TableCell>
                        <TableCell className={`text-right font-bold text-xs ${
                          tx.type === 'income' ? 'text-primary' : tx.type === 'expense' ? 'text-destructive' : 'text-muted-foreground'
                        }`}>
                          ৳{tx.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">
                          {tx.description}
                        </TableCell>
                        <TableCell className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 hover:bg-muted"
                                id={`tx-action-${tx._id}`}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-36">
                              <DropdownMenuItem
                                className="cursor-pointer text-xs gap-2"
                                onClick={() => handleOpenEdit(tx)}
                              >
                                <Edit className="h-3.5 w-3.5 text-primary" />
                                <span>Edit</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="cursor-pointer text-xs gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                                onClick={() => handleDelete(tx)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            {totalPages > 1 && (
              <div className="pt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => {
                    const params = new URLSearchParams(searchParams.toString());
                    if (page > 1) params.set('page', String(page));
                    else params.delete('page');
                    router.push(`${pathname}?${params.toString()}`);
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>

      {/* Edit Transaction Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary">
              <Edit className="h-5 w-5" /> Edit Transaction
            </DialogTitle>
          </DialogHeader>
          {editTx && (
            <form onSubmit={handleUpdate} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-primary block mb-1">Type</label>
                  <Select value={editType} onValueChange={(val: any) => setEditType(val)}>
                    <SelectTrigger className="w-full border-primary/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="transfer">Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-primary block mb-1">Source</label>
                  <Select value={editSource} onValueChange={(val: any) => setEditSource(val)}>
                    <SelectTrigger className="w-full border-primary/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="bank">Bank</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {editSource === 'bank' && (
                <div className="grid grid-cols-2 gap-2 border p-2 rounded-lg bg-muted/50">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">Bank Name</label>
                    <Input
                      placeholder="e.g. Dutch Bangla"
                      value={editBankName}
                      onChange={(e) => setEditBankName(e.target.value)}
                      className="h-8 border-primary/20 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">Account No</label>
                    <Input
                      placeholder="e.g. 122.100.123"
                      value={editAccountNo}
                      onChange={(e) => setEditAccountNo(e.target.value)}
                      className="h-8 border-primary/20 text-xs"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-primary block mb-1">Category</label>
                <Input
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="border-primary/20"
                  placeholder="e.g. Silage Sale"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-primary block mb-1">Amount (BDT)</label>
                  <Input
                    type="number"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="border-primary/20"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-primary block mb-1">Date</label>
                  <Input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="border-primary/20"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-primary block mb-1">Description</label>
                <Input
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="border-primary/20"
                  placeholder="Memo/Notes"
                />
              </div>

              <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditOpen(false)}
                  className="w-full sm:flex-1 h-10 font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updating}
                  className="w-full sm:flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
