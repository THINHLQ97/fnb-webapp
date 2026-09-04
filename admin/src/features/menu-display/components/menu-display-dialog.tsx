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
import { ImageInput } from '@/components/ui/image-input';
import { saveMenuDisplay, clearMenuDisplay } from '../api/service';
import type { MenuDisplayItem } from '../api/service';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: MenuDisplayItem | null;
  onSuccess: (id: string, patch: Partial<MenuDisplayItem>) => void;
};

export function MenuDisplayDialog({ open, onOpenChange, item, onSuccess }: Props) {
  const [isPending, startTransition] = useTransition();
  const [highlight, setHighlight] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [image, setImage] = useState('');
  const [tag, setTag] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      setHighlight(item.highlight);
      setFeatured(item.featured);
      setImage(item.image ?? '');
      setTag(item.tag ?? '');
      setDescription(item.description ?? '');
    }
    setError(null);
  }, [item, open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!item) return;
    setError(null);
    startTransition(async () => {
      try {
        await saveMenuDisplay(item.id, {
          highlight,
          featured,
          image: image.trim() || undefined,
          tag: tag.trim() || undefined,
          description: description.trim() || undefined,
        });
        onSuccess(item.id, {
          highlight,
          featured,
          image: image.trim() || null,
          tag: tag.trim() || null,
          description: description.trim() || null,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lỗi khi lưu');
      }
    });
  }

  function handleClear() {
    if (!item) return;
    if (!confirm('Xóa phần trình bày trên menu của món này?')) return;
    startTransition(async () => {
      try {
        await clearMenuDisplay(item.id);
        onSuccess(item.id, {
          highlight: false,
          featured: false,
          image: null,
          tag: null,
          description: null,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lỗi khi xóa');
      }
    });
  }

  const hasDisplay =
    !!item && (item.highlight || item.featured || !!item.image || !!item.tag || !!item.description);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Trình bày trên menu</DialogTitle>
        </DialogHeader>

        {item && (
          <div className='rounded bg-muted/50 p-3 text-sm'>
            <p className='font-medium'>{item.name}</p>
            <p className='text-xs text-muted-foreground'>{item.category}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='flex items-center gap-2'>
            <input
              type='checkbox'
              id='featured'
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
            />
            <Label htmlFor='featured'>Ghim lên đầu menu (Featured)</Label>
          </div>

          <div className='flex items-center gap-2'>
            <input
              type='checkbox'
              id='highlight'
              checked={highlight}
              onChange={(e) => setHighlight(e.target.checked)}
            />
            <Label htmlFor='highlight'>Đánh dấu &quot;Best seller&quot;</Label>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='tag'>Nhãn tùy chỉnh (tag)</Label>
            <Input
              id='tag'
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder='VD: MỚI, GIẢM 20%, HOT'
              maxLength={20}
            />
          </div>

          <ImageInput
            value={image}
            onChange={setImage}
            label='Ảnh món'
            helperText='Để trống thì menu website hiển thị ô ảnh trống. Ảnh tối đa 500 KB.'
            aspect='square'
          />

          <div className='space-y-2'>
            <Label htmlFor='description'>Mô tả hiển thị trên website</Label>
            <Textarea
              id='description'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder='VD: Trà hoa cúc, đào tươi, thơm dịu'
            />
          </div>

          {error && <p className='rounded bg-red-50 p-2 text-sm text-red-700'>{error}</p>}

          <div className='flex justify-between gap-2'>
            {hasDisplay && (
              <Button type='button' variant='outline' onClick={handleClear} disabled={isPending}>
                Xóa trình bày
              </Button>
            )}
            <div className='flex gap-2 ml-auto'>
              <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button type='submit' isLoading={isPending}>
                Lưu
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
