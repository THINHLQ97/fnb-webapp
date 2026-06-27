'use client';

import { useSession } from 'next-auth/react';
import { UserAvatarProfile } from '@/components/user-avatar-profile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ProfileViewPage() {
  const { data: session } = useSession();
  const user = session?.user;

  if (!user) return null;

  return (
    <div className='flex w-full flex-col p-4'>
      <Card className='mx-auto max-w-md'>
        <CardHeader>
          <CardTitle>Hồ sơ</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center gap-4'>
            <UserAvatarProfile className='h-16 w-16 rounded-full' user={user} />
            <div>
              <p className='text-lg font-semibold'>{user.name || 'Chưa đặt tên'}</p>
              <p className='text-muted-foreground text-sm'>{user.email}</p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-muted-foreground text-sm'>Vai trò:</span>
            <Badge variant='outline'>{user.role}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
