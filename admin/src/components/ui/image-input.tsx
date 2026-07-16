'use client';

import { useRef, useState } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Icons } from '@/components/icons';

const MAX_BYTES = 500 * 1024; // 500 KB

function bytesToKb(n: number): string {
  return `${Math.round(n / 1024)} KB`;
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Không đọc được file'));
    reader.readAsDataURL(file);
  });
}

type Props = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  helperText?: string;
  aspect?: 'square' | 'wide';
};

export function ImageInput({ value, onChange, label, helperText, aspect = 'wide' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [urlDraft, setUrlDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('File phải là ảnh (jpg, png, webp, ...)');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(
        `Ảnh nặng ${bytesToKb(file.size)} — vượt giới hạn 500 KB. ` +
          'Hãy nén ảnh (VD: tinypng.com) hoặc dán URL ảnh online ở bên dưới.'
      );
      return;
    }

    setBusy(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      onChange(dataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi đọc file');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function applyUrl() {
    const url = urlDraft.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url) && !url.startsWith('data:image/')) {
      setError('URL phải bắt đầu bằng http:// hoặc https://');
      return;
    }
    setError(null);
    onChange(url);
    setUrlDraft('');
  }

  function clear() {
    onChange('');
    setUrlDraft('');
    setError(null);
  }

  const previewClass =
    aspect === 'square'
      ? 'h-24 w-24 rounded-md object-cover'
      : 'h-28 w-full max-w-md rounded-md object-cover';

  return (
    <div className='space-y-2'>
      {label && <p className='text-sm font-medium'>{label}</p>}

      {value ? (
        <div className='flex items-start gap-3'>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt='preview' className={previewClass} />
          <div className='flex flex-1 flex-col gap-2'>
            <p className='text-xs text-muted-foreground break-all line-clamp-2'>
              {value.startsWith('data:') ? 'Ảnh nội bộ (base64)' : value}
            </p>
            <div className='flex gap-2'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => inputRef.current?.click()}
                disabled={busy}
              >
                Đổi ảnh
              </Button>
              <Button type='button' variant='outline' size='sm' onClick={clear}>
                Xóa
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className='space-y-2'>
          <Button
            type='button'
            variant='outline'
            onClick={() => inputRef.current?.click()}
            disabled={busy}
          >
            <Icons.upload className='mr-2 h-4 w-4' />
            {busy ? 'Đang đọc...' : 'Chọn ảnh từ máy'}
          </Button>
          <div className='flex gap-2'>
            <Input
              type='url'
              value={urlDraft}
              onChange={(e) => setUrlDraft(e.target.value)}
              placeholder='Hoặc dán URL ảnh: https://...'
              className='text-sm'
            />
            <Button type='button' variant='outline' onClick={applyUrl} disabled={!urlDraft.trim()}>
              Dùng URL
            </Button>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type='file'
        accept='image/*'
        onChange={handleFile}
        className='hidden'
      />

      {error && <p className='text-xs text-red-600'>{error}</p>}
      {helperText && !error && (
        <p className='text-xs text-muted-foreground'>{helperText}</p>
      )}
    </div>
  );
}
