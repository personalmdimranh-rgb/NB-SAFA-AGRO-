'use client';

import { ProfileForm } from '@/components/user/ProfileForm';

export default function DealerProfilePage() {
  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Profile Information</h1>
          <p className="text-sm text-muted-foreground">Manage your personal and shop details</p>
        </div>
      </div>
      <ProfileForm />
    </div>
  );
}
