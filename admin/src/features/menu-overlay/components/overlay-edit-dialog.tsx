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
import { saveOverride, clearOverride } from '../api/service';
import type { MenuOverlayItem } from '../api/service';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: MenuOverlayItem | null;
  onSuccess: (kiotvietId: number, override: MenuOverlayItem['override']) => void;
};

export function OverlayEditDialog({ open, onOpenChange, item, onSuccess }: Props) {
  const [isPending, startTransition] = useTransition();
  const [highlight, setHighlight] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [customImage, setCustomImage] = useState('');
  const [tag, setTag] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      setHighlight(item.override.highlight);
      setFeatured(item.override.featured);
      setCustomImage(item.override.customImage ?? '');
      setTag(item.override.tag ?? '');
      setNote(item.override.note ?? '');
    }
    setError(null);
  }, [item, open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!item) return;
    setError(null);
    startTransition(async () => {
      try {
        await saveOverride(item.kiotvietId, {
          highlight,
          featured,
          customImage: customImage.trim() || undefined,
          tag: tag.trim() || undefined,
          note: note.trim() || undefined,
        });
        onSuccess(item.kiotvietId, {
          id: item.override.id ?? 'saved',
          highlight,
          featured,
          customImage: customImage.trim() || null,
          tag: tag.trim() || null,
          note: note.trim() || null,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lỗi khi lưu');
      }
    });
  }

  function handleClear() {
    if (!item) return;
    if (!confirm('Xóa overlay cho sản phẩm này?')) return;
    startTransition(async () => {
      try {
        await clearOverride(item.kiotvietId);
        onSuccess(item.kiotvietId, {
          id: null,
          highlight: false,
          featured: false,
          customImage: null,
          tag: null,
          note: null,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lỗi khi xóa');
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Sửa overlay</DialogTitle>
        </DialogHeader>

        {item && (
          <div className='rounded bg-muted/50 p-3 text-sm'>
            <p className='font-medium'>{item.name}</p>
            <p className='text-xs text-muted-foreground'>
              Mã {item.code} · {item.categoryName}
            </p>
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
            value={customImage}
            onChange={setCustomImage}
            label='Ảnh đè (thay ảnh KiotViet)'
            helperText='Để trống sẽ dùng ảnh mặc định từ KiotViet. Ảnh tối đa 500 KB.'
            aspect='square'
          />

          <div className='space-y-2'>
            <Label htmlFor='note'>Ghi chú nội bộ</Label>
            <Textarea
              id='note'
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder='Không hiển thị ra web'
            />
          </div>

          {error && <p className='rounded bg-red-50 p-2 text-sm text-red-700'>{error}</p>}

          <div className='flex justify-between gap-2'>
            {item?.override.id && (
              <Button type='button' variant='outline' onClick={handleClear} disabled={isPending}>
                Xóa overlay
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
