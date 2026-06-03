'use client';

import { ProfileForm } from '@/components/user/ProfileForm';

export default function AdminProfilePage() {
  return (
    <div className="flex flex-col space-y-6 max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-primary">My Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your personal information and address</p>
        </div>
      </div>
      <ProfileForm />
    </div>
  );
}
