/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import { getFarmers, createFarmer, updateFarmer, deleteFarmer } from '@/app/actions/farmer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
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
import { Users, PlusCircle, Phone, MapPin, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

export default function FarmersPage() {
  const [farmers, setFarmers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFarmerId, setEditingFarmerId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [division, setDivision] = useState('');
  const [district, setDistrict] = useState('');
  const [thana, setThana] = useState('');
  const [cattleCount, setCattleCount] = useState('');
  const [creditLimit, setCreditLimit] = useState('');

  const availableDistricts = division ? bdDivisions[division] || [] : [];
  const availableThanas = district ? bdLocations[district] || [] : [];

  const loadData = async () => {
    await Promise.resolve();
    try {
      setLoading(true);
      const list = await getFarmers();
      setFarmers(list);
    } catch (err: any) {
      toast.error('Failed to load farmers: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const resetForm = () => {
    setName('');
    setPhone('');
    setAddressLine('');
    setDivision('');
    setDistrict('');
    setThana('');
    setCattleCount('');
    setCreditLimit('');
    setEditingFarmerId(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (farmer: any) => {
    setEditingFarmerId(farmer._id);
    setName(farmer.name);
    setPhone(farmer.phone);
    
    // Find division from district
    const resolvedDivision = Object.keys(bdDivisions).find(div => 
      bdDivisions[div].includes(farmer.address?.district || '')
    ) || '';
    
    setDivision(resolvedDivision);
    setDistrict(farmer.address?.district || '');
    setThana(farmer.address?.thana || '');
    setAddressLine(farmer.address?.village || '');
    
    setCattleCount(String(farmer.cattleCount || 0));
    setCreditLimit(String(farmer.creditLimit || 0));
    setModalOpen(true);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !addressLine || !division || !district || !thana) {
      toast.error('Name, Phone and Address fields are required.');
      return;
    }
    try {
      setSubmitting(true);
      if (editingFarmerId) {
        await updateFarmer(editingFarmerId, {
          name,
          phone,
          addressLine,
          division,
          district,
          thana,
          cattleCount: parseInt(cattleCount) || 0,
          creditLimit: parseFloat(creditLimit) || 0,
        });
        toast.success('Farmer profile updated!');
      } else {
        await createFarmer({
          name,
          phone,
          addressLine,
          division,
          district,
          thana,
          cattleCount: parseInt(cattleCount) || 0,
          creditLimit: parseFloat(creditLimit) || 0,
        });
        toast.success('Farmer registered successfully!');
      }
      setModalOpen(false);
      resetForm();
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (farmer: any) => {
    const result = await Swal.fire({
      title: 'Delete Farmer Profile?',
      html: `<p class="text-sm text-gray-600">This will permanently remove <strong>${farmer.name}</strong> from the database.</p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Delete!',
    });
    if (!result.isConfirmed) return;
    try {
      await deleteFarmer(farmer._id);
      toast.success(`${farmer.name}'s profile removed.`);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Farmer CRM &amp; Credit Limits</h1>
          <p className="text-muted-foreground text-sm">Register retail farmers, track cattle size, manage credit boundaries</p>
        </div>
        <Button
          onClick={openAddModal}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2 shadow-md"
          id="add-farmer-btn"
        >
          <PlusCircle className="h-4 w-4" />
          Add Farmer
        </Button>
      </div>

      {/* Full-width Table Card */}
      <Card className="border-primary/10 bg-card/70">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-primary flex items-center gap-2">
            <Users className="h-5 w-5" /> Farmers Database
            <span className="ml-auto text-xs font-normal text-muted-foreground">{farmers.length} registered</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-16 text-muted-foreground">Loading farmers database...</div>
          ) : farmers.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="font-medium">No farmers registered yet.</p>
              <p className="text-xs mt-1">Click &quot;Add Farmer&quot; to register the first farmer.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">#</TableHead>
                    <TableHead>Farmer Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-center">Cattle</TableHead>
                    <TableHead className="text-center">Purchases</TableHead>
                    <TableHead className="text-right">Credit Limit</TableHead>
                    <TableHead className="text-right">Dues</TableHead>
                    <TableHead className="text-center w-[60px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {farmers.map((f, index) => (
                    <TableRow key={f._id}>
                      <TableCell className="text-xs text-muted-foreground">{index + 1}</TableCell>
                      <TableCell className="font-semibold text-sm text-primary">{f.name}</TableCell>
                      <TableCell className="text-xs">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-muted-foreground" /> {f.phone}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-destructive/60" />
                          {[f.address?.village, f.address?.thana, f.address?.district].filter(Boolean).join(', ') || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell className="text-center font-bold text-xs">{f.cattleCount}</TableCell>
                      <TableCell className="text-center text-xs">
                        <span>{f.purchaseCount} orders</span>
                        <span className="block text-[10px] text-muted-foreground">({f.totalPurchasedQty || 0} bags)</span>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-xs">৳{(f.creditLimit || 0).toLocaleString()}</TableCell>
                      <TableCell className={`text-right font-bold text-xs ${(f.currentDues || 0) > (f.creditLimit || 0) ? 'text-destructive' : 'text-primary'}`}>
                        ৳{(f.currentDues || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7" id={`farmer-action-${f._id}`}>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-36">
                            <DropdownMenuItem className="cursor-pointer text-xs gap-2" onClick={() => openEditModal(f)}>
                              <Edit className="h-3.5 w-3.5 text-primary" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="cursor-pointer text-xs gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                              onClick={() => handleDelete(f)}
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Delete
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
        </CardContent>
      </Card>

      {/* Add / Edit Farmer Modal */}
      <Dialog open={modalOpen} onOpenChange={(o) => { if (!o) { setModalOpen(false); resetForm(); } else setModalOpen(true); }}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-primary flex items-center gap-2">
              <PlusCircle className="h-5 w-5" />
              {editingFarmerId ? 'Edit Farmer Profile' : 'Register New Farmer'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-primary uppercase tracking-wide block mb-1">Farmer Name *</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Full name" className="border-primary/20" />
            </div>
            <div>
              <label className="text-xs font-semibold text-primary uppercase tracking-wide block mb-1">Phone Number *</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="01XXXXXXXXX" className="border-primary/20" />
            </div>

            {/* Address Line */}
            <div>
              <label className="text-xs font-semibold text-primary uppercase tracking-wide block mb-1">Address Line (Road / House / Area) *</label>
              <Input value={addressLine} onChange={(e) => setAddressLine(e.target.value)} required placeholder="House #, Road #, Area" className="border-primary/20" />
            </div>

            {/* Division, District, Thana Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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
                  <SelectTrigger className="border-primary/20 h-9 text-xs">
                    <SelectValue placeholder="Division" />
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
                  <SelectTrigger className="border-primary/20 h-9 text-xs">
                    <SelectValue placeholder="District" />
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
                  <SelectTrigger className="border-primary/20 h-9 text-xs">
                    <SelectValue placeholder="Thana" />
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-primary uppercase tracking-wide block mb-1">Cattle Count</label>
                <Input type="number" value={cattleCount} onChange={(e) => setCattleCount(e.target.value)} placeholder="0" className="border-primary/20" />
              </div>
              <div>
                <label className="text-xs font-semibold text-primary uppercase tracking-wide block mb-1">Credit Limit (৳)</label>
                <Input type="number" value={creditLimit} onChange={(e) => setCreditLimit(e.target.value)} placeholder="0.00" className="border-primary/20" />
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => { setModalOpen(false); resetForm(); }} className="border-primary/20">
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                {submitting ? 'Saving...' : editingFarmerId ? 'Update Profile' : 'Register Farmer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
