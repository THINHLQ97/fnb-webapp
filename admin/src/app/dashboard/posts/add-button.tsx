'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { PostFormDialog } from '@/features/posts/components/post-form-dialog';

export function AddPostButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Icons.add className='mr-2 h-4 w-4' />
        Thêm bài viết
      </Button>
      <PostFormDialog
        open={open}
        onOpenChange={setOpen}
        post={null}
        onSuccess={() => {
          setOpen(false);
          window.location.reload();
        }}
      />
    </>
  );
}
