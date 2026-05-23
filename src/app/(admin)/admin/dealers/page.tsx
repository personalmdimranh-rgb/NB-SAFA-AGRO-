'use client';

import React, { useEffect, useState } from 'react';
import { getDealers, approveDealer, updateDealerSettings, registerDealer } from '@/app/actions/dealer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, ShieldAlert, Award, CreditCard, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

export default function DealersAdminPage() {
  const [dealers, setDealers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Register form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [shopName, setShopName] = useState('');
  const [district, setDistrict] = useState('');
  const [tradeLicense, setTradeLicense] = useState('');
  const [nidNumber, setNidNumber] = useState('');
  const [registering, setRegistering] = useState(false);

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

  const handleApprove = async (userId: string, dealerName: string) => {
    const result = await Swal.fire({
      title: 'Approve Dealer?',
      text: `Are you sure you want to approve ${dealerName} as a registered dealer?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: 'var(--color-primary, #10b981)',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, approve!'
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

  const handleUpdateSettings = async (dealerId: string, shopName: string, currentRate: number, currentLimit: number) => {
    const { value: formValues } = await Swal.fire({
      title: `Configure ${shopName}`,
      html:
        `<div>` +
        `<label style="display:block; text-align:left; font-size:12px; margin-bottom:4px; font-weight:bold;">Commission per bag (BDT)</label>` +
        `<input id="swal-input1" class="swal2-input" type="number" value="${currentRate}" style="margin: 0 0 10px 0; width:80%;">` +
        `<label style="display:block; text-align:left; font-size:12px; margin-bottom:4px; font-weight:bold;">Credit Limit (BDT)</label>` +
        `<input id="swal-input2" class="swal2-input" type="number" value="${currentLimit}" style="margin: 0; width:80%;">` +
        `</div>`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Save Settings',
      confirmButtonColor: 'var(--color-primary, #10b981)',
      preConfirm: () => {
        return [
          parseFloat((document.getElementById('swal-input1') as HTMLInputElement).value),
          parseFloat((document.getElementById('swal-input2') as HTMLInputElement).value)
        ];
      }
    });

    if (formValues) {
      const [commissionRate, creditLimit] = formValues;
      if (isNaN(commissionRate) || isNaN(creditLimit)) {
        toast.error('Please enter valid numeric settings');
        return;
      }

      try {
        await updateDealerSettings(dealerId, { commissionRate, creditLimit });
        toast.success('Dealer settings updated!');
        loadData();
      } catch (err: any) {
        toast.error('Failed to update settings: ' + err.message);
      }
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !shopName) {
      toast.error('Name, Email, Phone, and Shop Name are required.');
      return;
    }

    try {
      setRegistering(true);
      await registerDealer({
        name,
        email,
        phone,
        shopName,
        district,
        tradeLicense,
        nidNumber,
      });

      toast.success('Dealer account registered successfully (Pending approval).');
      // Reset form
      setName('');
      setEmail('');
      setPhone('');
      setShopName('');
      setDistrict('');
      setTradeLicense('');
      setNidNumber('');
      loadData();
    } catch (err: any) {
      toast.error('Registration failed: ' + err.message);
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Dealers Portal Management</h1>
        <p className="text-muted-foreground">Approve new dealer requests, configure credit limits, and set bag-wise commission rates</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Register Dealer Form */}
        <Card className="lg:col-span-4 border-primary/10 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-primary">
              <PlusCircle className="h-5 w-5 text-primary" /> Add New Dealer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-primary block mb-1">Dealer Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-primary block mb-1">Email</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-primary block mb-1">Phone</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-primary block mb-1">Shop Name</label>
                <Input value={shopName} onChange={(e) => setShopName(e.target.value)} required />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-primary block mb-1">District</label>
                <Input value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="e.g. Bogura" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-primary block mb-1">Trade License</label>
                <Input value={tradeLicense} onChange={(e) => setTradeLicense(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-primary block mb-1">NID Number</label>
                <Input value={nidNumber} onChange={(e) => setNidNumber(e.target.value)} />
              </div>

              <Button type="submit" disabled={registering} className="w-full bg-primary hover:bg-primary/95 text-white font-semibold">
                {registering ? 'Registering...' : 'Register Dealer'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Dealers List */}
        <Card className="lg:col-span-8 border-primary/10 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-primary flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> Dealer Database
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-10 text-muted-foreground">Loading dealers database...</div>
            ) : dealers.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">No dealers registered.</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dealer / Shop</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Commission Rate</TableHead>
                      <TableHead className="text-right">Wallet</TableHead>
                      <TableHead className="text-right">Credit Limit</TableHead>
                      <TableHead className="text-right">Dues</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dealers.map((d) => {
                      const u = d.userId || {};
                      return (
                        <TableRow key={d._id}>
                          <TableCell className="font-semibold text-xs text-primary">
                            {u.name || 'Unknown'}
                            <span className="block text-[10px] text-muted-foreground font-normal italic">
                              {d.shopName} ({d.address?.district || 'No District'})
                            </span>
                          </TableCell>
                          <TableCell className="text-xs">
                            {u.phone}
                            <span className="block text-[10px] text-muted-foreground">{u.email}</span>
                          </TableCell>
                          <TableCell>
                            {u.status === 'active' ? (
                              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">Active</Badge>
                            ) : (
                              <Badge className="bg-secondary/50 text-secondary-foreground hover:bg-secondary border-secondary/20">Pending Approval</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-bold text-xs">৳{d.commissionRate}/bag</TableCell>
                          <TableCell className="text-right text-primary font-bold text-xs">৳{d.commissionWallet.toLocaleString()}</TableCell>
                          <TableCell className="text-right font-bold text-xs text-zinc-600">৳{d.creditLimit.toLocaleString()}</TableCell>
                          <TableCell className={`text-right font-bold text-xs ${d.currentDues > d.creditLimit ? 'text-destructive font-black' : 'text-primary'}`}>
                            ৳{d.currentDues.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center gap-1">
                              {u.status === 'inactive' && (
                                <Button size="sm" onClick={() => handleApprove(u._id, u.name)} className="bg-primary hover:bg-primary/95 text-white h-7 px-2 text-xs">
                                  <UserCheck className="h-3.5 w-3.5 mr-1" /> Approve
                                </Button>
                              )}
                              <Button size="sm" variant="outline" onClick={() => handleUpdateSettings(d._id, d.shopName, d.commissionRate, d.creditLimit)} className="h-7 px-2 text-xs border-primary/30 text-primary hover:bg-primary/10">
                                Configure
                              </Button>
                            </div>
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
      </div>
    </div>
  );
}
