'use client';

import React, { useEffect, useState } from 'react';
import { getFarmers, createFarmer, updateFarmer } from '@/app/actions/farmer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, PlusCircle, PenTool, Phone, MapPin, Eye } from 'lucide-react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

export default function FarmersPage() {
  const [farmers, setFarmers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [village, setVillage] = useState('');
  const [thana, setThana] = useState('');
  const [district, setDistrict] = useState('');
  const [cattleCount, setCattleCount] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [editingFarmerId, setEditingFarmerId] = useState<string | null>(null);

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

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      toast.error('Name and Phone are required');
      return;
    }

    try {
      setSubmitting(true);
      if (editingFarmerId) {
        // Update
        await updateFarmer(editingFarmerId, {
          name,
          phone,
          village,
          thana,
          district,
          cattleCount: parseInt(cattleCount) || 0,
          creditLimit: parseFloat(creditLimit) || 0,
        });
        toast.success('Farmer profile updated successfully!');
      } else {
        // Create
        await createFarmer({
          name,
          phone,
          village,
          thana,
          district,
          cattleCount: parseInt(cattleCount) || 0,
          creditLimit: parseFloat(creditLimit) || 0,
        });
        toast.success('Farmer profile registered successfully!');
      }

      // Reset
      setName('');
      setPhone('');
      setVillage('');
      setThana('');
      setDistrict('');
      setCattleCount('');
      setCreditLimit('');
      setEditingFarmerId(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (farmer: any) => {
    setEditingFarmerId(farmer._id);
    setName(farmer.name);
    setPhone(farmer.phone);
    setVillage(farmer.address?.village || '');
    setThana(farmer.address?.thana || '');
    setDistrict(farmer.address?.district || '');
    setCattleCount(String(farmer.cattleCount));
    setCreditLimit(String(farmer.creditLimit));
  };

  const handleCancelEdit = () => {
    setEditingFarmerId(null);
    setName('');
    setPhone('');
    setVillage('');
    setThana('');
    setDistrict('');
    setCattleCount('');
    setCreditLimit('');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Farmer CRM & Credit Limits</h1>
        <p className="text-muted-foreground">Register retail farmers, track cattle size, view distribution counts and set credit boundaries</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Form */}
        <Card className="lg:col-span-4 border-primary/10 bg-white/70">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-primary">
              <PlusCircle className="h-5 w-5 text-primary" />
              {editingFarmerId ? 'Modify Farmer Profile' : 'Register Retail Farmer'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-primary block mb-1">Farmer Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required className="border-primary/10" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-primary block mb-1">Phone Number</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} required className="border-primary/10" />
              </div>

              <div className="grid grid-cols-3 gap-2 border p-2 rounded-lg bg-zinc-50/50">
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground block mb-0.5">Village</label>
                  <Input value={village} onChange={(e) => setVillage(e.target.value)} className="h-8 text-xs border-primary/10" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground block mb-0.5">Thana</label>
                  <Input value={thana} onChange={(e) => setThana(e.target.value)} className="h-8 text-xs border-primary/10" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground block mb-0.5">District</label>
                  <Input value={district} onChange={(e) => setDistrict(e.target.value)} className="h-8 text-xs border-primary/10" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-primary block mb-1">Cattle Count</label>
                  <Input type="number" value={cattleCount} onChange={(e) => setCattleCount(e.target.value)} placeholder="0" className="border-primary/10" />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-primary block mb-1">Credit Limit</label>
                  <Input type="number" value={creditLimit} onChange={(e) => setCreditLimit(e.target.value)} placeholder="0.00" className="border-primary/10" />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={submitting} className="flex-1 bg-primary hover:bg-primary/95 text-white font-semibold">
                  {submitting ? 'Saving...' : editingFarmerId ? 'Update Profile' : 'Register Profile'}
                </Button>
                {editingFarmerId && (
                  <Button type="button" variant="outline" onClick={handleCancelEdit} className="border-zinc-200">
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Database Grid */}
        <Card className="lg:col-span-8 border-primary/10 bg-white/70">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-primary flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> Farmers Database
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-10 text-muted-foreground">Loading farmers database...</div>
            ) : farmers.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">No farmers registered in database.</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Farmer Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="text-center">Cattle Count</TableHead>
                      <TableHead className="text-center">Purchases</TableHead>
                      <TableHead className="text-right">Credit Limit</TableHead>
                      <TableHead className="text-right">Outstanding Dues</TableHead>
                      <TableHead className="text-center">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {farmers.map((f) => (
                      <TableRow key={f._id}>
                        <TableCell className="font-semibold text-xs text-primary">
                          {f.name}
                          <span className="block text-[10px] text-muted-foreground font-normal flex items-center gap-0.5">
                            <Phone className="h-2.5 w-2.5" /> {f.phone}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          <span className="flex items-center gap-0.5">
                            <MapPin className="h-3 w-3 text-destructive" />
                            {f.address?.village || 'N/A'}, {f.address?.district || 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell className="text-center font-bold text-xs">{f.cattleCount} heads</TableCell>
                        <TableCell className="text-center text-xs">
                          {f.purchaseCount} orders
                          <span className="block text-[10px] text-muted-foreground font-semibold">({f.totalPurchasedQty} bags)</span>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-xs">৳{f.creditLimit.toLocaleString()}</TableCell>
                        <TableCell className={`text-right font-bold text-xs ${f.currentDues > f.creditLimit ? 'text-destructive' : 'text-primary'}`}>
                          ৳{f.currentDues.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(f)} className="h-7 px-2 border-primary/10 hover:bg-primary/10 text-primary text-xs">
                            <PenTool className="h-3.5 w-3.5 mr-1" /> Edit
                          </Button>
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
