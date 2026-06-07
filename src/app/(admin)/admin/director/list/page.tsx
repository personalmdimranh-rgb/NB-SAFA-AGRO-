'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { registerDirector, deleteDirector, updateDirector } from '@/app/actions/director';
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
import { Badge } from '@/components/ui/badge';
import { divisions, bdDivisions, bdLocations } from '@/lib/bd-locations';
import {
  Users, Coins, TrendingUp, PlusCircle, Loader2, RefreshCw,
  Mail, Phone, Award, MoreVertical, Trash2, Eye, Pencil,
} from 'lucide-react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import Link from 'next/link';

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

// We also need userIds for delete — fetch from users API
interface DirectorUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
}

export default function DirectorListPage() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;

  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [directorUsers, setDirectorUsers] = useState<DirectorUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingDirector, setEditingDirector] = useState<{
    name: string; email: string; phone: string;
    invested: number; weightedInvested: number; equity: number;
    userId?: string; status?: string;
  } | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editStatus, setEditStatus] = useState<'active' | 'inactive'>('active');
  const [editAddressLine, setEditAddressLine] = useState('');
  const [editDivision, setEditDivision] = useState('');
  const [editDistrict, setEditDistrict] = useState('');
  const [editThana, setEditThana] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [division, setDivision] = useState('');
  const [district, setDistrict] = useState('');
  const [thana, setThana] = useState('');

  const availableDistricts = division ? bdDivisions[division] || [] : [];
  const availableThanas = district ? bdLocations[district] || [] : [];

  const canManage = ['admin', 'super_admin'].includes(role || '');

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch summary data
      const res = await fetch('/api/admin/director');
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to load directors');
      }
      const data = await res.json();
      setSummary(data);

      const usersRes = await fetch('/api/admin/users?role=director&limit=100');
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        const usersArray = Array.isArray(usersData) ? usersData : (usersData.users || []);
        setDirectorUsers(usersArray);
      }
    } catch (err: any) {
      toast.error('Failed to load directors: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setAddressLine('');
    setDivision('');
    setDistrict('');
    setThana('');
  };

  const openAddModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (director: (typeof mergedDirectors)[0]) => {
    setEditingDirector(director);
    setEditName(director.name);
    setEditPhone(director.phone || '');
    setEditStatus((director.status as 'active' | 'inactive') || 'active');
    setEditAddressLine('');
    setEditDivision('');
    setEditDistrict('');
    setEditThana('');
    setEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDirector?.userId) return;
    if (!editName || !editPhone) {
      toast.error('Name and Phone are required.');
      return;
    }
    try {
      setEditSubmitting(true);
      await updateDirector(editingDirector.userId, {
        name: editName,
        phone: editPhone,
        status: editStatus,
        addressLine: editAddressLine,
        division: editDivision,
        district: editDistrict,
        thana: editThana,
      });
      toast.success(`✅ Director "${editName}" updated successfully!`);
      setEditModalOpen(false);
      setEditingDirector(null);
      loadData();
    } catch (err: any) {
      toast.error('Update failed: ' + err.message);
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) {
      toast.error('Name, Email, and Phone are required.');
      return;
    }
    try {
      setSubmitting(true);
      await registerDirector({
        name,
        email,
        phone,
        password: password || undefined,
        addressLine,
        division,
        district,
        thana,
      });
      toast.success(`✅ Director "${name}" registered successfully!`);
      setModalOpen(false);
      resetForm();
      loadData();
    } catch (err: any) {
      toast.error('Registration failed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (userId: string, directorName: string) => {
    const result = await Swal.fire({
      title: 'Remove Director?',
      html: `<p class="text-sm text-gray-600">This will permanently remove <strong>${directorName}</strong> and all their investment records from the system.</p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Remove!',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'rounded-3xl',
        confirmButton: 'rounded-xl font-bold px-6 py-3',
        cancelButton: 'rounded-xl font-bold px-6 py-3',
      },
    });

    if (!result.isConfirmed) return;

    try {
      await deleteDirector(userId);
      toast.success(`Director "${directorName}" removed successfully.`);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove director');
    }
  };

  // Merge summary details with user IDs
  const mergedDirectors = summary?.directorDetails.map((d) => {
    const userRecord = directorUsers.find(
      (u) => u.email.toLowerCase() === d.email.toLowerCase()
    );
    return { ...d, userId: userRecord?._id, status: userRecord?.status };
  }) ?? [];

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">All Directors List</h1>
          <p className="text-muted-foreground text-sm">
            Directory of farm shareholders, total capital contributions, and equity distribution.
          </p>
        </div>
        <div className="flex items-center gap-3">
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
          {canManage && (
            <Button
              onClick={openAddModal}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2 shadow-md"
              id="add-director-btn"
            >
              <PlusCircle className="h-4 w-4" />
              Add Director
            </Button>
          )}
        </div>
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
                  <p className="text-2xl font-black text-primary mt-1">
                    ৳{summary.totalInvestmentsSum.toLocaleString()}
                  </p>
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
                  <p
                    className={`text-2xl font-black mt-1 ${
                      summary.profitBeforeDividends >= 0 ? 'text-green-600' : 'text-red-500'
                    }`}
                  >
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
            <span className="ml-auto text-xs font-normal text-muted-foreground">
              {mergedDirectors.length} registered
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-xs font-bold uppercase w-10">#</TableHead>
                  <TableHead className="text-xs font-bold uppercase">Name</TableHead>
                  <TableHead className="text-xs font-bold uppercase">Email</TableHead>
                  <TableHead className="text-xs font-bold uppercase">Phone</TableHead>
                  <TableHead className="text-xs font-bold uppercase text-right">Total Invested</TableHead>
                  <TableHead className="text-xs font-bold uppercase text-right">Equity Share</TableHead>
                  <TableHead className="text-xs font-bold uppercase text-center w-16">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mergedDirectors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-10 w-10 text-muted-foreground/40" />
                        <p className="font-medium">No directors found in the system.</p>
                        {canManage && (
                          <p className="text-xs">
                            Click{' '}
                            <button onClick={openAddModal} className="text-primary font-semibold underline">
                              Add Director
                            </button>{' '}
                            to register the first director.
                          </p>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  mergedDirectors.map((d, idx) => (
                    <TableRow key={d.email} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="text-muted-foreground text-xs font-mono">{idx + 1}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          {d.userId ? (
                            <Link
                              href={`/admin/users/${d.userId}`}
                              className="font-semibold text-primary text-sm hover:underline hover:text-primary/80"
                            >
                              {d.name}
                            </Link>
                          ) : (
                            <span className="font-semibold text-primary text-sm">{d.name}</span>
                          )}
                          {d.status && (
                            <Badge
                              className={`text-[9px] font-bold px-1.5 w-fit ${
                                d.status === 'active'
                                  ? 'bg-green-100 text-green-700 border-green-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}
                            >
                              {d.status === 'active' ? 'Active' : 'Inactive'}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5 flex-shrink-0" /> {d.email}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5 flex-shrink-0" /> {d.phone || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell className="font-bold text-right">
                        ৳{(d.invested ?? 0).toLocaleString()} BDT
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          className="inline-flex items-center gap-1 bg-primary/10 text-primary border-primary/20 px-2.5 py-0.5 rounded-full text-xs font-bold"
                          variant="outline"
                        >
                          <Award className="h-3.5 w-3.5" /> {(d.equity ?? 0).toFixed(2)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 hover:bg-muted"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            {d.userId ? (
                              <DropdownMenuItem asChild className="cursor-pointer text-xs gap-2">
                                <Link href={`/admin/users/${d.userId}`} className="flex items-center">
                                  <Eye className="h-3.5 w-3.5 text-primary" /> View Profile
                                </Link>
                              </DropdownMenuItem>
                            ) : null}
                            {canManage && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="cursor-pointer text-xs gap-2 text-blue-600 focus:text-blue-700 focus:bg-blue-50"
                                  onClick={() => openEditModal(d)}
                                >
                                  <Pencil className="h-3.5 w-3.5" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="cursor-pointer text-xs gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                                  onClick={() => {
                                    if (d.userId) {
                                      handleDelete(d.userId, d.name);
                                    } else {
                                      toast.error(`Cannot delete director user: User record not found for email ${d.email}`);
                                    }
                                  }}
                                >
                                  <Trash2 className="h-3.5 w-3.5" /> Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Director Modal */}
      <Dialog
        open={editModalOpen}
        onOpenChange={(o) => {
          if (!o) { setEditModalOpen(false); setEditingDirector(null); }
        }}
      >
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-primary flex items-center gap-2">
              <Pencil className="h-5 w-5" /> Edit Director
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleUpdate} className="space-y-4 pt-2">
            {/* Name */}
            <div>
              <label className="text-xs font-semibold text-primary uppercase tracking-wide block mb-1">
                Full Name *
              </label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                placeholder="Director's full name"
                className="border-primary/20"
              />
            </div>

            {/* Phone & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-primary uppercase tracking-wide block mb-1">
                  Phone *
                </label>
                <Input
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  required
                  placeholder="01XXXXXXXXX"
                  className="border-primary/20"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-primary uppercase tracking-wide block mb-1">
                  Status
                </label>
                <Select
                  value={editStatus}
                  onValueChange={(val) => setEditStatus(val as 'active' | 'inactive')}
                >
                  <SelectTrigger className="border-primary/20">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Address Line */}
            <div>
              <label className="text-xs font-semibold text-primary uppercase tracking-wide block mb-1">
                Address Line
              </label>
              <Input
                value={editAddressLine}
                onChange={(e) => setEditAddressLine(e.target.value)}
                placeholder="House #, Road #, Area"
                className="border-primary/20"
              />
            </div>

            {/* Division / District / Thana */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-primary uppercase tracking-wide block mb-1">
                  Division
                </label>
                <Select
                  value={editDivision}
                  onValueChange={(val) => {
                    setEditDivision(val || '');
                    setEditDistrict('');
                    setEditThana('');
                  }}
                >
                  <SelectTrigger className="border-primary/20">
                    <SelectValue placeholder="Division" />
                  </SelectTrigger>
                  <SelectContent>
                    {divisions.map((div) => (
                      <SelectItem key={div} value={div}>{div}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-semibold text-primary uppercase tracking-wide block mb-1">
                  District
                </label>
                <Select
                  value={editDistrict}
                  disabled={!editDivision}
                  onValueChange={(val) => {
                    setEditDistrict(val || '');
                    setEditThana('');
                  }}
                >
                  <SelectTrigger className="border-primary/20">
                    <SelectValue placeholder="District" />
                  </SelectTrigger>
                  <SelectContent>
                    {(editDivision ? bdDivisions[editDivision] || [] : []).map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-semibold text-primary uppercase tracking-wide block mb-1">
                  Thana
                </label>
                <Select
                  value={editThana}
                  disabled={!editDistrict}
                  onValueChange={(val) => setEditThana(val || '')}
                >
                  <SelectTrigger className="border-primary/20">
                    <SelectValue placeholder="Thana" />
                  </SelectTrigger>
                  <SelectContent>
                    {(editDistrict ? bdLocations[editDistrict] || [] : []).map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => { setEditModalOpen(false); setEditingDirector(null); }}
                className="w-full sm:flex-1 h-10 font-semibold border-primary/20"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={editSubmitting}
                className="w-full sm:flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                {editSubmitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...</>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Director Modal */}
      <Dialog
        open={modalOpen}
        onOpenChange={(o) => {
          if (!o) { setModalOpen(false); resetForm(); } else setModalOpen(true);
        }}
      >
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-primary flex items-center gap-2">
              <PlusCircle className="h-5 w-5" /> Register New Director / Investor
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {/* Name */}
            <div>
              <label className="text-xs font-semibold text-primary uppercase tracking-wide block mb-1">
                Full Name *
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Director's full name"
                className="border-primary/20"
              />
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-primary uppercase tracking-wide block mb-1">
                  Email *
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="email@example.com"
                  className="border-primary/20"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-primary uppercase tracking-wide block mb-1">
                  Phone *
                </label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="01XXXXXXXXX"
                  className="border-primary/20"
                />
              </div>
            </div>

            {/* Password (optional) */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-1">
                Password{' '}
                <span className="normal-case font-normal text-muted-foreground/70">
                  (leave blank to auto-generate)
                </span>
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="border-primary/20"
              />
            </div>

            {/* Address Line */}
            <div>
              <label className="text-xs font-semibold text-primary uppercase tracking-wide block mb-1">
                Address Line
              </label>
              <Input
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                placeholder="House #, Road #, Area"
                className="border-primary/20"
              />
            </div>

            {/* Division / District / Thana */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-primary uppercase tracking-wide block mb-1">
                  Division
                </label>
                <Select
                  value={division}
                  onValueChange={(val) => {
                    setDivision(val || '');
                    setDistrict('');
                    setThana('');
                  }}
                >
                  <SelectTrigger className="border-primary/20">
                    <SelectValue placeholder="Division" />
                  </SelectTrigger>
                  <SelectContent>
                    {divisions.map((div) => (
                      <SelectItem key={div} value={div}>{div}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-semibold text-primary uppercase tracking-wide block mb-1">
                  District
                </label>
                <Select
                  value={district}
                  disabled={!division}
                  onValueChange={(val) => {
                    setDistrict(val || '');
                    setThana('');
                  }}
                >
                  <SelectTrigger className="border-primary/20">
                    <SelectValue placeholder="District" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDistricts.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-semibold text-primary uppercase tracking-wide block mb-1">
                  Thana
                </label>
                <Select
                  value={thana}
                  disabled={!district}
                  onValueChange={(val) => setThana(val || '')}
                >

                  <SelectTrigger className="border-primary/20">
                    <SelectValue placeholder="Thana" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableThanas.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 font-medium">
              ℹ️ The director will be registered with <strong>Active</strong> status and can log in immediately.
              You can log investments separately from the <strong>Director Equity Board</strong>.
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => { setModalOpen(false); resetForm(); }}
                className="w-full sm:flex-1 h-10 font-semibold border-primary/20"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full sm:flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                {submitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Registering...</>
                ) : (
                  'Register Director'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
