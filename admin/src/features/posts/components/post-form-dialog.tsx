'use client';

import { useEffect, useState, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createPost, updatePost } from '../api/service';

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: unknown;
  coverImage: string | null;
  status: 'DRAFT' | 'PUBLISHED';
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: Post | null;
  onSuccess: () => void;
};

function contentToString(content: unknown): string {
  if (typeof content === 'string') return content;
  if (content && typeof content === 'object') {
    try {
      return JSON.stringify(content, null, 2);
    } catch {
      return '';
    }
  }
  return '';
}

export function PostFormDialog({ open, onOpenChange, post, onSuccess }: Props) {
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setSlug(post.slug);
      setExcerpt(post.excerpt ?? '');
      setCoverImage(post.coverImage ?? '');
      setContent(contentToString(post.content));
      setStatus(post.status);
    } else {
      setTitle('');
      setSlug('');
      setExcerpt('');
      setCoverImage('');
      setContent('');
      setStatus('DRAFT');
    }
    setError(null);
  }, [post, open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const payload = {
          title: title.trim(),
          slug: slug.trim() || undefined,
          excerpt: excerpt.trim() || undefined,
          coverImage: coverImage.trim() || undefined,
          content: content.trim(),
          status,
        };
        if (post) {
          await updatePost(post.id, payload);
        } else {
          await createPost(payload);
        }
        onSuccess();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{post ? 'Sửa bài viết' : 'Thêm bài viết'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='title'>Tiêu đề *</Label>
            <Input
              id='title'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder='VD: 5 loại cà phê bạn nên thử một lần'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='slug'>Slug (tùy chọn, để trống sẽ tự sinh)</Label>
            <Input
              id='slug'
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder='5-loai-ca-phe-ban-nen-thu'
              className='font-mono text-sm'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='excerpt'>Mô tả ngắn</Label>
            <Textarea
              id='excerpt'
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              placeholder='Câu tóm tắt hiển thị ở trang blog list'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='coverImage'>Ảnh bìa (URL)</Label>
            <Input
              id='coverImage'
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              type='url'
              placeholder='https://...'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='content'>Nội dung *</Label>
            <Textarea
              id='content'
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              required
              placeholder='Nội dung bài viết. Cách nhau bằng dòng trống để tạo đoạn văn mới.'
            />
            <p className='text-xs text-muted-foreground'>
              Mỗi đoạn văn cách nhau 1 dòng trống. Sẽ nâng cấp lên rich-text editor sau.
            </p>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='status'>Trạng thái</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as 'DRAFT' | 'PUBLISHED')}>
              <SelectTrigger id='status'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='DRAFT'>Nháp — chưa hiển thị</SelectItem>
                <SelectItem value='PUBLISHED'>Đã đăng — hiển thị trên web</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <p className='rounded bg-red-50 p-2 text-sm text-red-700'>{error}</p>
          )}

          <div className='flex justify-end gap-2'>
            <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type='submit' isLoading={isPending}>
              {post ? 'Cập nhật' : 'Thêm'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
