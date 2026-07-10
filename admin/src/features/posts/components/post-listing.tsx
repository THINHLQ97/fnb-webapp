'use client';

import { useEffect, useState, useTransition } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Icons } from '@/components/icons';
import { getPosts, deletePost, type PostFilters } from '../api/service';
import { PostFormDialog } from './post-form-dialog';

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: unknown;
  coverImage: string | null;
  status: 'DRAFT' | 'PUBLISHED';
  publishedAt: Date | null;
  updatedAt: Date;
  author: { name: string | null; email: string } | null;
};

export function PostListing() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Post | null>(null);

  const limit = 20;

  function loadData(filters?: Partial<PostFilters>) {
    startTransition(async () => {
      const result = await getPosts({
        page: filters?.page ?? page,
        limit,
        search: (filters?.search ?? search) || undefined,
      });
      setPosts(result.posts as unknown as Post[]);
      setTotal(result.total);
    });
  }

  useEffect(() => {
    loadData({ page: 1, search: '' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
    loadData({ page: 1, search: value });
  }

  function handleDelete(id: string) {
    if (!confirm('Xóa bài viết này? Thao tác này không thể hoàn tác.')) return;
    startTransition(async () => {
      await deletePost(id);
      loadData();
    });
  }

  function handleEdit(post: Post) {
    setEditing(post);
    setDialogOpen(true);
  }

  const totalPages = Math.ceil(total / limit);
  const dateFmt = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' });

  return (
    <div className='space-y-4'>
      <div className='flex items-center gap-2'>
        <Input
          placeholder='Tìm theo tiêu đề hoặc slug...'
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className='max-w-sm'
        />
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tiêu đề</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Tác giả</TableHead>
              <TableHead>Cập nhật</TableHead>
              <TableHead className='w-[80px]'></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending && posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className='text-center py-8 text-muted-foreground'>
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className='text-center py-8 text-muted-foreground'>
                  Chưa có bài viết nào
                </TableCell>
              </TableRow>
            ) : (
              posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className='font-medium max-w-xs truncate' title={post.title}>
                    {post.title}
                  </TableCell>
                  <TableCell className='font-mono text-xs text-muted-foreground'>{post.slug}</TableCell>
                  <TableCell>
                    <Badge variant={post.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                      {post.status === 'PUBLISHED' ? 'Đã đăng' : 'Nháp'}
                    </Badge>
                  </TableCell>
                  <TableCell>{post.author?.name ?? post.author?.email ?? '—'}</TableCell>
                  <TableCell className='text-sm text-muted-foreground'>
                    {dateFmt.format(new Date(post.updatedAt))}
                  </TableCell>
                  <TableCell>
                    <div className='flex gap-1'>
                      <Button variant='ghost' size='icon' onClick={() => handleEdit(post)}>
                        <Icons.settings className='h-4 w-4' />
                      </Button>
                      <Button variant='ghost' size='icon' onClick={() => handleDelete(post.id)}>
                        <Icons.trash className='h-4 w-4' />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className='flex items-center justify-between'>
          <p className='text-sm text-muted-foreground'>Tổng {total} bài viết</p>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              disabled={page <= 1}
              onClick={() => {
                setPage(page - 1);
                loadData({ page: page - 1 });
              }}
            >
              Trước
            </Button>
            <span className='flex items-center text-sm'>
              {page} / {totalPages}
            </span>
            <Button
              variant='outline'
              size='sm'
              disabled={page >= totalPages}
              onClick={() => {
                setPage(page + 1);
                loadData({ page: page + 1 });
              }}
            >
              Sau
            </Button>
          </div>
        </div>
      )}

      <PostFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditing(null);
        }}
        post={editing}
        onSuccess={() => {
          setDialogOpen(false);
          setEditing(null);
          loadData();
        }}
      />
    </div>
  );
}
