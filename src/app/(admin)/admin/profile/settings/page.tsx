'use client';

import { PasswordChangeForm } from '@/components/user/PasswordChangeForm';

export default function AdminSettingsPage() {
  return (
    <div className="flex flex-col space-y-6 max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-primary">Account Settings</h1>
          <p className="text-sm text-muted-foreground">Change your account password and update security details</p>
        </div>
      </div>
      <PasswordChangeForm />
    </div>
  );
}
