'use client';

import React, { useEffect, useState } from 'react';
import { createResolution, getResolutions } from '@/app/actions/director';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Notebook } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

export default function ResolutionsPage() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const canPostResolution = ['super_admin', 'admin', 'director', 'manager'].includes(role);

  const [resolutions, setResolutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingResolution, setSubmittingResolution] = useState(false);

  // Board Resolution Form
  const [resTitle, setResTitle] = useState('');
  const [resContent, setResContent] = useState('');
  const [resFileUrl, setResFileUrl] = useState('');
  const [resMeetingDate, setResMeetingDate] = useState('');
  const [resAgenda, setResAgenda] = useState('');
  const [resAttendees, setResAttendees] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const resList = await getResolutions();
      setResolutions(resList);
    } catch (err: any) {
      toast.error('Failed to load board resolutions: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateResolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resTitle || !resContent) {
      toast.error('Resolution Title and Content are required');
      return;
    }

    try {
      setSubmittingResolution(true);
      await createResolution(
        resTitle,
        resContent,
        resFileUrl || undefined,
        resMeetingDate || undefined,
        resAgenda || undefined,
        resAttendees || undefined
      );
      toast.success('Board notice posted successfully!');
      setResTitle('');
      setResContent('');
      setResFileUrl('');
      setResMeetingDate('');
      setResAgenda('');
      setResAttendees('');
      loadData();
    } catch (err: any) {
      toast.error('Failed to post notice: ' + err.message);
    } finally {
      setSubmittingResolution(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-muted-foreground">Loading Board Resolutions...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Board Resolutions & Notices</h1>
        <p className="text-muted-foreground">Document administrative decisions, publish board minutes, and post general notices.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Resolutions list */}
        <div className={canPostResolution ? 'md:col-span-6' : 'md:col-span-12'}>
          <Card className="border-border bg-card/70 h-full">
            <CardHeader>
              <CardTitle className="text-md font-bold text-primary flex items-center gap-1.5">
                <Notebook className="h-4.5 w-4.5 text-primary" /> Board Resolutions Noticeboard
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
              {resolutions.length === 0 ? (
                <div className="text-xs text-muted-foreground text-center py-12">No notices posted.</div>
              ) : (
                resolutions.map((res) => (
                  <div key={res._id} className="p-3 border rounded-lg bg-muted/50 space-y-2 border-border">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-bold text-primary">{res.title}</h4>
                      <span className="text-[9px] text-muted-foreground font-semibold">
                        Posted: {new Date(res.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground whitespace-pre-wrap">{res.content}</p>
                    
                    {res.meetingDate && (
                      <div className="text-[10px] text-primary font-semibold bg-primary/10 p-1.5 rounded">
                        <strong>Meeting Date:</strong> {new Date(res.meetingDate).toLocaleDateString()}
                      </div>
                    )}
                    
                    {res.agenda && (
                      <div className="text-[10px] text-muted-foreground border-l-2 border-primary pl-2">
                        <strong>Agenda:</strong> {res.agenda}
                      </div>
                    )}

                    {res.attendees && (
                      <div className="text-[10px] text-muted-foreground border-l-2 border-accent pl-2">
                        <strong>Attendees:</strong> {res.attendees}
                      </div>
                    )}

                    {res.fileUrl && (
                      <a href={res.fileUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary font-bold hover:underline block">
                        Download Board Minute Attachment
                      </a>
                    )}
                    <span className="block text-[9px] text-muted-foreground text-right italic">
                      Posted by: {res.recordedBy?.name || 'Admin'}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Board Resolution Poster */}
        {canPostResolution && (
          <Card className="md:col-span-6 border-border bg-card/70">
            <CardHeader>
              <CardTitle className="text-md font-bold text-primary flex items-center gap-1.5">
                <Notebook className="h-4.5 w-4.5 text-primary" /> Create Resolution & Notice
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateResolution} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-primary block mb-1">Notice / Resolution Title</label>
                  <Input value={resTitle} onChange={(e) => setResTitle(e.target.value)} placeholder="e.g. Annual General Board Meeting Q3" required className="border-border" />
                </div>

                <div>
                  <label className="text-xs font-semibold text-primary block mb-1">Content / Board Minute Summary</label>
                  <Textarea value={resContent} onChange={(e) => setResContent(e.target.value)} placeholder="Enter details..." required className="border-border h-28" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-primary block mb-1">Meeting Date (Optional)</label>
                    <Input type="date" value={resMeetingDate} onChange={(e) => setResMeetingDate(e.target.value)} className="border-border" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-primary block mb-1">Document Attachment Link (Optional)</label>
                    <Input value={resFileUrl} onChange={(e) => setResFileUrl(e.target.value)} placeholder="e.g. https://nbsafaagro.com/docs/resolution-q3.pdf" className="border-border" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-primary block mb-1">Agenda (Optional)</label>
                  <Input value={resAgenda} onChange={(e) => setResAgenda(e.target.value)} placeholder="e.g. Capitalization, Maize procurement" className="border-border" />
                </div>

                <div>
                  <label className="text-xs font-semibold text-primary block mb-1">Attendees (Optional)</label>
                  <Input value={resAttendees} onChange={(e) => setResAttendees(e.target.value)} placeholder="e.g. Imtiaz, Imran, Karim" className="border-border" />
                </div>

                <Button type="submit" disabled={submittingResolution} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                  {submittingResolution ? 'Posting...' : 'Post Resolution'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
