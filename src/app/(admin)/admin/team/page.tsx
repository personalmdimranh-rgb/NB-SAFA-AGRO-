'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash, Loader2, Award, User, Link as LinkIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { 
  createTeamMember, 
  updateTeamMember, 
  deleteTeamMember, 
  getTeamMembers 
} from '@/app/actions/team';

const PRESET_IMAGES = [
  "https://i.ibb.co.com/zTBvBXws/lawyer-1.jpg",
  "https://i.ibb.co.com/9HmBM6CH/lawyer-2.jpg",
  "https://i.ibb.co.com/jZvGmbv6/lawyer-3.jpg",
  "https://i.ibb.co.com/MyKFRdNP/lawyer-4.jpg",
  "https://i.ibb.co.com/7dHGRPKj/lawyer-5.jpg",
  "https://i.ibb.co.com/mCychrjx/lawyer-6.jpg",
  "https://i.ibb.co.com/67txMdTT/lawyer-7.jpg",
  "https://i.ibb.co.com/TB0xjWKk/lawyer-8.jpg",
  "https://i.ibb.co.com/PzjtJT3K/lawyer-9.jpg",
  "https://i.ibb.co.com/DDnRCVN7/lawyer-10.jpg",
  "https://i.ibb.co.com/8Dj17xYJ/lawyer-11.jpg",
  "https://i.ibb.co.com/0Rq1zXkM/lawyer-12.jpg"
];

const teamMemberSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  role: z.string().min(2, { message: 'Role must be at least 2 characters.' }),
  desc: z.string().optional(),
  bio: z.string().optional(),
  image: z.string().url({ message: 'Please select an image or enter a valid URL.' }),
  facebook: z.string().url({ message: 'Please enter a valid Facebook URL.' }).or(z.literal('')).optional(),
  twitter: z.string().url({ message: 'Please enter a valid Twitter URL.' }).or(z.literal('')).optional(),
  linkedin: z.string().url({ message: 'Please enter a valid LinkedIn URL.' }).or(z.literal('')).optional(),
  order: z.number(),
});

type TeamMemberFormValues = z.infer<typeof teamMemberSchema>;

export default function AdminTeamPage() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const isReadOnly = role === 'manager';

  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState('');

  const form = useForm<TeamMemberFormValues>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: {
      name: '',
      role: '',
      desc: '',
      bio: '',
      image: PRESET_IMAGES[0],
      facebook: '',
      twitter: '',
      linkedin: '',
      order: 0,
    },
  });

  const fetchMembers = async () => {
    try {
      const data = await getTeamMembers();
      setMembers(data);
    } catch (error) {
      toast.error('Failed to fetch team members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const onSubmit = async (values: TeamMemberFormValues) => {
    setSubmitting(true);
    try {
      if (editingMember) {
        await updateTeamMember(editingMember._id, values);
        toast.success('Team member updated successfully');
      } else {
        await createTeamMember(values);
        toast.success('Team member created successfully');
      }
      setOpen(false);
      fetchMembers();
      form.reset();
      setEditingMember(null);
      setCustomImageUrl('');
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (member: any) => {
    setEditingMember(member);
    form.reset({
      name: member.name,
      role: member.role,
      desc: member.desc || '',
      bio: member.bio || '',
      image: member.image || PRESET_IMAGES[0],
      facebook: member.facebook || '',
      twitter: member.twitter || '',
      linkedin: member.linkedin || '',
      order: member.order ?? 0,
    });
    if (!PRESET_IMAGES.includes(member.image)) {
      setCustomImageUrl(member.image);
    } else {
      setCustomImageUrl('');
    }
    setOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete team member "${name}". This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#10b981', // emerald-500
      cancelButtonColor: '#ef4444', // red-500
      confirmButtonText: 'Yes, delete!',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'rounded-3xl',
        confirmButton: 'rounded-xl font-bold px-6 py-3',
        cancelButton: 'rounded-xl font-bold px-6 py-3'
      }
    });

    if (result.isConfirmed) {
      try {
        await deleteTeamMember(id);
        toast.success('Team member deleted successfully');
        fetchMembers();
      } catch (error) {
        toast.error('Failed to delete team member');
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900">Team Members Management</h1>
          <p className="text-muted-foreground text-sm font-medium">Manage corporate leadership and agricultural specialists.</p>
        </div>
        {!isReadOnly && (
          <Button onClick={() => {
            setEditingMember(null);
            form.reset({
              name: '',
              role: '',
              desc: '',
              bio: '',
              image: PRESET_IMAGES[0],
              facebook: '',
              twitter: '',
              linkedin: '',
              order: 0,
            });
            setCustomImageUrl('');
            setOpen(true);
          }} className="rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/95 shadow-md">
            <Plus className="mr-2 h-4 w-4" /> Add Team Member
          </Button>
        )}
      </div>

      <Dialog open={open} onOpenChange={(val) => {
        setOpen(val);
        if (!val) {
          setEditingMember(null);
          form.reset();
          setCustomImageUrl('');
        }
      }}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">{editingMember ? 'Edit' : 'Add'} Team Member</DialogTitle>
            <DialogDescription className="font-semibold text-xs text-muted-foreground">
              {editingMember 
                ? "Update member profile details and social links." 
                : "Create a profile for a new team member."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-xs uppercase tracking-wider">Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Member name" className="rounded-xl border-muted-foreground/20 focus-visible:ring-primary" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-xs uppercase tracking-wider">Role/Designation</FormLabel>
                      <FormControl>
                        <Input placeholder="Founder, Nutritionist, etc." className="rounded-xl border-muted-foreground/20 focus-visible:ring-primary" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-xs uppercase tracking-wider">Sort Order</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          className="rounded-xl border-muted-foreground/20 focus-visible:ring-primary" 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription className="text-[10px] font-semibold">Lower number values appear first (e.g. 1, 2, 3).</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="linkedin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-xs uppercase tracking-wider">LinkedIn Link</FormLabel>
                      <FormControl>
                        <Input placeholder="https://linkedin.com/in/..." className="rounded-xl border-muted-foreground/20 focus-visible:ring-primary" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="facebook"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-xs uppercase tracking-wider">Facebook Link</FormLabel>
                      <FormControl>
                        <Input placeholder="https://facebook.com/..." className="rounded-xl border-muted-foreground/20 focus-visible:ring-primary" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="twitter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-xs uppercase tracking-wider">Twitter/X Link</FormLabel>
                      <FormControl>
                        <Input placeholder="https://twitter.com/..." className="rounded-xl border-muted-foreground/20 focus-visible:ring-primary" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="desc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-xs uppercase tracking-wider">Short Highlight</FormLabel>
                    <FormControl>
                      <Input placeholder="Brief 1-sentence bio overview." className="rounded-xl border-muted-foreground/20 focus-visible:ring-primary" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-xs uppercase tracking-wider">Detailed Bio Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Expanded history, certifications, or experience info." className="rounded-xl min-h-[80px] border-muted-foreground/20 focus-visible:ring-primary" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="font-bold text-xs uppercase tracking-wider">Select Profile Image</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        <div className="grid grid-cols-6 gap-2 border p-3 rounded-2xl bg-muted/20">
                          {PRESET_IMAGES.map((imgUrl, i) => (
                            <button
                              type="button"
                              key={i}
                              aria-label={`Preset Profile Image ${i + 1}`}
                              aria-pressed={field.value === imgUrl && !customImageUrl}
                              onClick={() => {
                                field.onChange(imgUrl);
                                setCustomImageUrl('');
                              }}
                              className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all hover:scale-105 active:scale-95 ${
                                field.value === imgUrl && !customImageUrl
                                  ? 'border-primary ring-2 ring-primary/20 scale-105'
                                  : 'border-border'
                              }`}
                            >
                              <img src={imgUrl} alt="" className="h-full w-full object-cover" />
                            </button>
                          ))}
                        </div>
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Or Use Custom Image URL:</span>
                          <Input
                            placeholder="https://example.com/custom-profile-image.jpg"
                            value={customImageUrl}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCustomImageUrl(val);
                              field.onChange(val || PRESET_IMAGES[0]);
                            }}
                            className="rounded-xl border-muted-foreground/20 focus-visible:ring-primary"
                          />
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-4 border-t gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-xl font-bold">Cancel</Button>
                <Button type="submit" disabled={submitting} className="rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/95 shadow-md">
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingMember ? 'Update' : 'Create'} Member
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-[80px] font-black uppercase text-[10px] tracking-wider">Photo</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-wider">Name</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-wider">Role</TableHead>
              <TableHead className="w-[100px] text-center font-black uppercase text-[10px] tracking-wider">Order</TableHead>
              <TableHead className="w-[120px] text-center font-black uppercase text-[10px] tracking-wider">Updated By</TableHead>
              <TableHead className="w-[150px] text-center font-black uppercase text-[10px] tracking-wider">Socials</TableHead>
              {!isReadOnly && <TableHead className="w-[120px] text-right font-black uppercase text-[10px] tracking-wider">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={isReadOnly ? 6 : 7} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-xs text-muted-foreground font-semibold">Loading members data...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isReadOnly ? 6 : 7} className="h-40 text-center font-semibold text-sm text-muted-foreground">
                  No team members added.
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => (
                <TableRow key={member._id} className="hover:bg-muted/10">
                  <TableCell>
                    <div className="h-10 w-10 overflow-hidden rounded-xl border bg-muted flex items-center justify-center">
                      {member.image ? (
                        <img src={member.image} alt={member.name} className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-slate-800">{member.name}</TableCell>
                  <TableCell className="font-semibold text-xs text-primary">{member.role}</TableCell>
                  <TableCell className="text-center font-bold text-xs text-slate-500">{member.order}</TableCell>
                  <TableCell className="text-center font-semibold text-xs text-slate-600">{member.updatedBy || 'System'}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
                      {member.linkedin ? <LinkIcon className="h-3.5 w-3.5 text-blue-500" /> : <span className="opacity-20">•</span>}
                      {member.facebook ? <LinkIcon className="h-3.5 w-3.5 text-sky-600" /> : <span className="opacity-20">•</span>}
                      {member.twitter ? <LinkIcon className="h-3.5 w-3.5 text-cyan-500" /> : <span className="opacity-20">•</span>}
                    </div>
                  </TableCell>
                  {!isReadOnly && (
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEdit(member)}
                        className="rounded-full h-8 w-8 text-slate-700 hover:bg-muted"
                        aria-label={`Edit ${member.name}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-full h-8 w-8 text-destructive hover:bg-destructive/10" 
                        onClick={() => handleDelete(member._id, member.name)}
                        aria-label={`Delete ${member.name}`}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
