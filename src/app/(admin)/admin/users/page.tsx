'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Pagination } from '@/components/ui/pagination';
import { 
  MoreHorizontal, 
  Loader2, 
  User as UserIcon, 
  Eye,
  ShieldAlert, 
  ShieldCheck,
  UserCog,
  Trash2,
  ArrowRight,
  Search,
  Store,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: string;
  image?: string;
  phone?: string;
  addresses?: any[];
  createdAt: string;
  lastActive?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  shopName?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAssignAdminOpen, setIsAssignAdminOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, page: 1 });

  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const isSuperAdmin = (session?.user as any)?.role === 'super_admin';

  const currentPage = parseInt(searchParams.get('page') || '1') || 1;
  const searchVal = (searchParams.get('search') || '') as string;
  const roleVal = (searchParams.get('role') || '') as string;

  const [searchInput, setSearchInput] = useState<string>(searchVal);
  const [roleInput, setRoleInput] = useState<string>(roleVal);

  useEffect(() => {
    setSearchInput(searchVal);
    setRoleInput(roleVal);
  }, [searchVal, roleVal]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const q = new URLSearchParams({
        page: String(currentPage),
        search: searchVal,
        role: roleVal,
        limit: '20'
      });
      const response = await fetch(`/api/admin/users?${q.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data.users || []);
      setPagination(data.pagination || { total: 0, totalPages: 1, page: 1 });
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchVal, roleVal]);

  const updateFilters = (newFilters: { page?: number; search?: string; role?: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newFilters.page !== undefined) {
      if (newFilters.page > 1) params.set('page', String(newFilters.page));
      else params.delete('page');
    }
    if (newFilters.search !== undefined) {
      if (newFilters.search) {
        params.set('search', newFilters.search);
        params.delete('page');
      } else {
        params.delete('search');
      }
    }
    if (newFilters.role !== undefined) {
      if (newFilters.role) {
        params.set('role', newFilters.role);
        params.delete('page');
      } else {
        params.delete('role');
      }
    }

    router.push(`/admin/users?${params.toString()}`);
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    const result = await Swal.fire({
      title: 'Change User Role?',
      text: `Are you sure you want to change this user's role to ${newRole}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, change it!',
      customClass: {
        popup: 'rounded-3xl',
        confirmButton: 'rounded-xl font-bold px-6 py-3',
        cancelButton: 'rounded-xl font-bold px-6 py-3'
      }
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (response.ok) {
        toast.success(`User role updated to ${newRole}`);
        fetchUsers();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update role');
      }
    } catch (error) {
      toast.error('Error updating user role');
    }
  };

  const handleAssignAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail) return;

    setIsAssigning(true);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail }),
      });

      if (response.ok) {
        toast.success(`Successfully assigned Admin role to ${adminEmail}`);
        setAdminEmail('');
        setIsAssignAdminOpen(false);
        fetchUsers();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to assign admin');
      }
    } catch (error) {
      toast.error('Error assigning admin');
    } finally {
      setIsAssigning(false);
    }
  };
 
  const handleDeleteUser = async (userId: string, userName: string) => {
    const result = await Swal.fire({
      title: 'Delete User?',
      text: `Are you sure you want to permanently delete user "${userName}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete permanently!',
      customClass: {
        popup: 'rounded-3xl',
        confirmButton: 'rounded-xl font-bold px-6 py-3',
        cancelButton: 'rounded-xl font-bold px-6 py-3'
      }
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        toast.success(`User "${userName}" deleted successfully`);
        fetchUsers();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to delete user');
      }
    } catch (error) {
      toast.error('Error deleting user');
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900">Users Management</h1>
          <p className="text-muted-foreground text-sm font-medium">Manage and view all registered customers and staff.</p>
        </div>
        <div className="flex items-center gap-3">
          {isSuperAdmin && (
            <Button 
              onClick={() => setIsAssignAdminOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full px-6 h-11 shadow-lg shadow-blue-200 border-none transition-all hover:scale-105 active:scale-95"
            >
              <ShieldCheck className="mr-2 h-4 w-4" />
              Assign Admin
            </Button>
          )}
          <div className="bg-primary/10 px-5 py-2.5 rounded-full border border-primary/20">
            <span className="text-primary font-bold text-sm">{pagination.total} Total Users</span>
          </div>
        </div>
      </div>

      {/* Search and Filters Section */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border shadow-sm">
        <div className="relative w-full md:max-w-md flex items-center">
          <Input
            placeholder="Search by name, email, or mobile..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                updateFilters({ search: searchInput });
              }
            }}
            className="pr-10 border-primary/20 rounded-xl"
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={() => updateFilters({ search: searchInput })}
            className="absolute right-1 text-muted-foreground hover:text-primary h-8 w-8 p-0"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Filter by Role:</span>
          <Select
            value={roleInput || 'all'}
            onValueChange={(val) => {
              const resolvedVal = (val === 'all' ? '' : val) || '';
              setRoleInput(resolvedVal);
              updateFilters({ role: resolvedVal });
            }}
          >
            <SelectTrigger className="w-full md:w-[180px] border-primary/20 rounded-xl">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="user">User / Farmer</SelectItem>
              <SelectItem value="dealer">Dealer</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="director">Director</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-2xl border shadow-sm overflow-hidden bg-white">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[80px]">Avatar</TableHead>
              <TableHead className="font-bold">Name &amp; Details</TableHead>
              <TableHead className="font-bold">Email</TableHead>
              <TableHead className="font-bold">Orders</TableHead>
              <TableHead className="font-bold">Role</TableHead>
              <TableHead className="font-bold">Joined</TableHead>
              <TableHead className="text-right font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground font-medium">Loading user data...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-48 text-center">
                  <p className="text-muted-foreground">No users found.</p>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user._id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    {user.image && user.image !== '' ? (
                      <div className="relative h-10 w-10 rounded-full overflow-hidden border">
                        <img 
                          src={user.image} 
                          alt={user.name} 
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as any).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;
                          }}
                        />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                        <UserIcon className="h-5 w-5" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <Link
                        href={`/admin/users/${user._id}`}
                        className="font-semibold text-slate-900 hover:text-primary transition-colors flex items-center gap-1 group w-fit"
                      >
                        {user.name}
                        <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      </Link>
                      {user.phone && user.phone !== 'N/A' && (
                        <span className="text-[11px] text-muted-foreground font-mono font-medium">{user.phone}</span>
                      )}
                      {user.role === 'dealer' && user.shopName && (
                        <span className="text-[11px] font-bold text-primary">{user.shopName}</span>
                      )}
                      {user.addresses && user.addresses.length > 0 && (
                        <span className="text-[10px] text-muted-foreground truncate max-w-[200px] mt-0.5">
                          {[user.addresses[0].street, user.addresses[0].city, user.addresses[0].state].filter(Boolean).join(', ')}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600">{user.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-700">{user.totalOrders} Orders</span>
                      <span className="text-[10px] text-muted-foreground font-medium">৳{user.totalSpent.toLocaleString()}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={user.role === 'admin' ? 'default' : 'outline'}
                      className={`
                        capitalize px-3 py-0.5 rounded-full font-bold text-[10px] tracking-wider
                        ${user.role === 'admin' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                      `}
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel className="text-[10px] font-black uppercase text-muted-foreground px-2 py-1.5">User Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild className="cursor-pointer">
                            <Link href={`/admin/users/${user._id}`} className="flex items-center">
                              <Eye className="mr-2 h-4 w-4" /> View Profile
                            </Link>
                          </DropdownMenuItem>
                          {user.role !== 'dealer' && (
                            <DropdownMenuItem asChild className="cursor-pointer text-primary font-bold">
                              <Link href={`/admin/dealers?register=true&name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}&phone=${encodeURIComponent(user.phone && user.phone !== 'N/A' ? user.phone : '')}`} className="flex items-center">
                                <Store className="mr-2 h-4 w-4" /> Make Dealer
                              </Link>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuGroup>

                        <DropdownMenuSeparator />
                        
                        <DropdownMenuGroup>
                          <DropdownMenuLabel className="text-[10px] font-black uppercase text-muted-foreground px-2 py-1.5">Management</DropdownMenuLabel>
                          
                          {user.role === 'user' ? (
                            <DropdownMenuItem 
                              onClick={() => handleUpdateRole(user._id, 'admin')}
                              className="cursor-pointer text-blue-600 font-bold"
                            >
                              <ShieldCheck className="mr-2 h-4 w-4" /> Make Admin
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              onClick={() => handleUpdateRole(user._id, 'user')}
                              className="cursor-pointer text-slate-600 font-bold"
                            >
                              <UserCog className="mr-2 h-4 w-4" /> Make User
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive cursor-pointer font-medium">
                            <ShieldAlert className="mr-2 h-4 w-4" /> Suspend User
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteUser(user._id, user.name)}
                            className="text-destructive cursor-pointer font-bold bg-red-50 hover:bg-red-100 mt-1"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete User
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Component */}
      {!loading && pagination.totalPages > 1 && (
        <div className="pt-2">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={(page) => updateFilters({ page })}
          />
        </div>
      )}

      {/* Assign Admin Modal */}
      <Dialog open={isAssignAdminOpen} onOpenChange={setIsAssignAdminOpen}>
        <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
          <div className="bg-blue-600 p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-400/20 rounded-full -ml-12 -mb-12 blur-xl" />
            
            <DialogHeader className="relative z-10">
              <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm border border-white/30">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <DialogTitle className="text-2xl font-black tracking-tight text-white">Assign Admin Access</DialogTitle>
              <p className="text-blue-100 text-sm font-medium mt-1">Grant administrative privileges to a user by email.</p>
            </DialogHeader>
          </div>

          <form onSubmit={handleAssignAdmin} className="p-8 space-y-6 bg-white">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full h-14 px-5 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-bold text-slate-700"
                />
              </div>
              <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100 mt-2">
                <div className="h-4 w-4 rounded-full bg-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-700 font-bold leading-normal">
                  NOTE: When this user logs in with Google using this email, they will automatically be granted Admin status.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 pt-2">
              <Button 
                type="button"
                variant="outline"
                onClick={() => setIsAssignAdminOpen(false)}
                className="flex-1 h-14 rounded-2xl font-bold border-2 hover:bg-slate-50"
              >
                CANCEL
              </Button>
              <Button 
                type="submit" 
                disabled={isAssigning}
                className="flex-[2] h-14 rounded-2xl font-black bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200 border-none group"
              >
                {isAssigning ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    PROCESSING...
                  </>
                ) : (
                  <>
                    CONFIRM ASSIGN
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

