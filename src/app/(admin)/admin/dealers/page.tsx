/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Pagination } from '@/components/ui/pagination';
import { getDealers, approveDealer, registerDealer, deleteDealer, updateDealer } from '@/app/actions/dealer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { divisions, bdDivisions, bdLocations } from '@/lib/bd-locations';
import { Users, UserCheck, PlusCircle, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

export default function DealersAdminPage() {
  const [dealers, setDealers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDealerId, setEditingDealerId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [shopName, setShopName] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [division, setDivision] = useState('');
  const [district, setDistrict] = useState('');
  const [thana, setThana] = useState('');
  const [tradeLicense, setTradeLicense] = useState('');
  const [nidNumber, setNidNumber] = useState('');
  const [commissionRate, setCommissionRate] = useState('0');
  const [creditLimit, setCreditLimit] = useState('0');

  const availableDistricts = division ? bdDivisions[division] || [] : [];
  const availableThanas = district ? bdLocations[district] || [] : [];

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const pageSize = 20;
  const totalPages = Math.ceil(dealers.length / pageSize) || 1;
  const paginatedDealers = dealers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const loadData = async () => {
    await Promise.resolve();
    try {
      setLoading(true);
      const list = await getDealers();
      setDealers(list);
    } catch (err: any) {
      toast.error('Failed to load dealers: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const registerParam = searchParams.get('register');
    if (registerParam === 'true') {
      const paramName = searchParams.get('name') || '';
      const paramEmail = searchParams.get('email') || '';
      const paramPhone = searchParams.get('phone') || '';
      setName(paramName);
      setEmail(paramEmail);
      setPhone(paramPhone);
      setModalOpen(true);
    }
  }, [searchParams]);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setShopName('');
    setAddressLine('');
    setDivision('');
    setDistrict('');
    setThana('');
    setTradeLicense('');
    setNidNumber('');
    setCommissionRate('0');
    setCreditLimit('0');
    setEditingDealerId(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (dealer: any) => {
    const u = dealer.userId || {};
    setEditingDealerId(dealer._id);
    setName(u.name || '');
    setEmail(u.email || '');
    setPhone(u.phone || '');
    setShopName(dealer.shopName || '');
    
    // Check if user has addresses
    const userAddress = u.addresses?.[0] || {};
    const districtVal = dealer.address?.district || userAddress.state || '';
    const resolvedDivision = userAddress.division || Object.keys(bdDivisions).find(div => 
      bdDivisions[div].includes(districtVal)
    ) || '';
    
    setDivision(resolvedDivision);
    setDistrict(districtVal);
    setThana(dealer.address?.thana || userAddress.city || '');
    setAddressLine(dealer.address?.village || userAddress.street || '');
    
    setTradeLicense(dealer.tradeLicense || '');
    setNidNumber(dealer.nidNumber || '');
    setCommissionRate(String(dealer.commissionRate || 0));
    setCreditLimit(String(dealer.creditLimit || 0));
    setModalOpen(true);
  };

  const handleApprove = async (userId: string, dealerName: string) => {
    const result = await Swal.fire({
      title: 'Approve Dealer?',
      text: `Are you sure you want to approve ${dealerName} as a registered dealer?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: 'var(--color-primary, #10b981)',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, approve!',
    });
    if (!result.isConfirmed) return;
    try {
      await approveDealer(userId);
      toast.success(`${dealerName} approved successfully!`);
      loadData();
    } catch (err: any) {
      toast.error('Approval failed: ' + err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !shopName || !addressLine || !division || !district || !thana) {
      toast.error('Name, Email, Phone, Shop Name, and Address fields are required.');
      return;
    }
    try {
      setSubmitting(true);
      if (editingDealerId) {
        await updateDealer(editingDealerId, {
          name,
          email,
          phone,
          shopName,
          addressLine,
          division,
          district,
          thana,
          tradeLicense,
          nidNumber,
          commissionRate: parseFloat(commissionRate) || 0,
          creditLimit: parseFloat(creditLimit) || 0,
        });
        toast.success('Dealer profile updated successfully.');
      } else {
        await registerDealer({
          name,
          email,
          phone,
          shopName,
          addressLine,
          division,
          district,
          thana,
          tradeLicense,
          nidNumber,
        });
        toast.success('Dealer account registered successfully (Pending approval).');
      }
      setModalOpen(false);
      resetForm();
      loadData();
    } catch (err: any) {
      toast.error((editingDealerId ? 'Update' : 'Registration') + ' failed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (dealer: any) => {
    const u = dealer.userId || {};
    const result = await Swal.fire({
      title: 'Remove Dealer?',
      html: `<p class="text-sm text-gray-600">This will permanently remove <strong>${u.name || dealer.shopName}</strong> and their user account from the system.</p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Remove!',
    });
    if (!result.isConfirmed) return;
    try {
      await deleteDealer(dealer._id);
      toast.success('Dealer removed successfully.');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove dealer');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Dealers Portal Management</h1>
          <p className="text-muted-foreground text-sm">Approve requests, configure credit limits, and set commission rates</p>
        </div>
        <Button
          onClick={openAddModal}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2 shadow-md"
          id="add-dealer-btn"
        >
          <PlusCircle className="h-4 w-4" />
          Add Dealer
        </Button>
      </div>

      {/* Full-width Dealers Table */}
      <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-primary flex items-center gap-2">
            <Users className="h-5 w-5" /> Dealer Database
            <span className="ml-auto text-xs font-normal text-muted-foreground">{dealers.length} registered</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-16 text-muted-foreground">Loading dealers database...</div>
          ) : dealers.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="font-medium">No dealers registered yet.</p>
              <p className="text-xs mt-1">Click &quot;Add Dealer&quot; to register the first dealer.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">#</TableHead>
                    <TableHead>Dealer / Shop</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Commission</TableHead>
                    <TableHead className="text-right">Wallet</TableHead>
                    <TableHead className="text-right">Credit Limit</TableHead>
                    <TableHead className="text-right">Dues</TableHead>
                    <TableHead className="text-center w-[60px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedDealers.map((d, index) => {
                    const u = d.userId || {};
                    return (
                      <TableRow key={d._id}>
                        <TableCell className="text-xs text-muted-foreground">{(currentPage - 1) * pageSize + index + 1}</TableCell>
                        <TableCell className="font-semibold text-sm text-primary">
                          {u.name || 'Unknown'}
                          <span className="block text-[10px] text-muted-foreground font-normal italic">
                            {d.shopName} · {d.address?.district || 'No District'}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs">
                          {u.phone}
                          <span className="block text-[10px] text-muted-foreground">{u.email}</span>
                        </TableCell>
                        <TableCell>
                          {u.status === 'active' ? (
                            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 text-[10px]">Active</Badge>
                          ) : (
                            <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 text-[10px]">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-bold text-xs">৳{d.commissionRate}/bag</TableCell>
                        <TableCell className="text-right text-primary font-bold text-xs">৳{d.commissionWallet.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-bold text-xs">৳{d.creditLimit.toLocaleString()}</TableCell>
                        <TableCell className={`text-right font-bold text-xs ${d.currentDues > d.creditLimit ? 'text-destructive' : 'text-primary'}`}>
                          ৳{d.currentDues.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-muted" id={`dealer-action-${d._id}`}>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              {u.status === 'inactive' && (
                                <DropdownMenuItem className="cursor-pointer text-xs gap-2" onClick={() => handleApprove(u._id, u.name)}>
                                  <UserCheck className="h-3.5 w-3.5 text-primary" /> Approve
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem className="cursor-pointer text-xs gap-2" onClick={() => openEditModal(d)}>
                                <Edit className="h-3.5 w-3.5 text-primary" /> Edit Profile
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="cursor-pointer text-xs gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                                onClick={() => handleDelete(d)}
                              >
                                <Trash2 className="h-3.5 w-3.5" /> Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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

      {/* Add / Edit Dealer Modal */}
      <Dialog open={modalOpen} onOpenChange={(o) => { if (!o) { setModalOpen(false); resetForm(); } else setModalOpen(true); }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-primary flex items-center gap-2">
              <PlusCircle className="h-5 w-5" /> {editingDealerId ? 'Edit Dealer Profile' : 'Register New Dealer'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-semibold text-primary uppercase tracking-wide block mb-1">Dealer Name *</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Full name" className="border-primary/20" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-primary uppercase tracking-wide block mb-1">Email *</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="email@example.com" className="border-primary/20" />
              </div>
              <div>
                <label className="text-xs font-semibold text-primary uppercase tracking-wide block mb-1">Phone *</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="01XXXXXXXXX" className="border-primary/20" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-primary uppercase tracking-wide block mb-1">Shop Name *</label>
              <Input value={shopName} onChange={(e) => setShopName(e.target.value)} required placeholder="Business / shop name" className="border-primary/20" />
            </div>

            {/* Address Line (Village / Road / House) */}
            <div>
              <label className="text-xs font-semibold text-primary uppercase tracking-wide block mb-1">Address Line (Road / House / Area) *</label>
              <Input value={addressLine} onChange={(e) => setAddressLine(e.target.value)} required placeholder="House #, Road #, Area" className="border-primary/20" />
            </div>

            {/* Division, District, Thana Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-primary uppercase tracking-wide block mb-1">Division *</label>
                <Select
                  value={division}
                  onValueChange={(val) => {
                    setDivision(val || '');
                    setDistrict('');
                    setThana('');
                  }}
                >
                  <SelectTrigger className="border-primary/20">
                    <SelectValue placeholder="Select Division" />
                  </SelectTrigger>
                  <SelectContent>
                    {divisions.map((div) => (
                      <SelectItem key={div} value={div}>
                        {div}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold text-primary uppercase tracking-wide block mb-1">District *</label>
                <Select
                  value={district}
                  disabled={!division}
                  onValueChange={(val) => {
                    setDistrict(val || '');
                    setThana('');
                  }}
                >
                  <SelectTrigger className="border-primary/20">
                    <SelectValue placeholder="Select District" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDistricts.map((dist) => (
                      <SelectItem key={dist} value={dist}>
                        {dist}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold text-primary uppercase tracking-wide block mb-1">Thana *</label>
                <Select
                  value={thana}
                  disabled={!district}
                  onValueChange={(val) => setThana(val || '')}
                >
                  <SelectTrigger className="border-primary/20">
                    <SelectValue placeholder="Select Thana" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableThanas.map((th) => (
                      <SelectItem key={th} value={th}>
                        {th}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1">Trade License</label>
                <Input value={tradeLicense} onChange={(e) => setTradeLicense(e.target.value)} placeholder="License No" className="border-primary/20" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1">NID Number</label>
                <Input value={nidNumber} onChange={(e) => setNidNumber(e.target.value)} placeholder="NID Number" className="border-primary/20" />
              </div>
            </div>

            {editingDealerId && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-dashed border-primary/20">
                <div>
                  <label className="text-xs font-semibold text-primary uppercase tracking-wide block mb-1">Commission Rate (৳/bag)</label>
                  <Input type="number" step="0.01" value={commissionRate} onChange={(e) => setCommissionRate(e.target.value)} required className="border-primary/20 font-mono font-bold" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-primary uppercase tracking-wide block mb-1">Credit Limit (৳)</label>
                  <Input type="number" step="0.01" value={creditLimit} onChange={(e) => setCreditLimit(e.target.value)} required className="border-primary/20 font-mono font-bold" />
                </div>
              </div>
            )}

            <DialogFooter className="gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => { setModalOpen(false); resetForm(); }} className="border-primary/20">
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                {submitting ? 'Saving...' : editingDealerId ? 'Save Changes' : 'Register Dealer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
