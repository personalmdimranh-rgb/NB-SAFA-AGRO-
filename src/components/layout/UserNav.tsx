'use client';

import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SignOutButton() {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-xs font-semibold hover:bg-accent hover:text-accent-foreground text-muted-foreground p-1 h-auto flex items-center transition-all"
      onClick={() => signOut({ callbackUrl: '/' })}
    >
      <LogOut className="h-3.5 w-3.5 mr-1" /> Log Out
    </Button>
  );
}
