'use client';

import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useState } from 'react';
import { Icons } from '@/components/icons';
import { Button } from './button';
import { ImageInput } from './image-input';

const MAX_IMAGE_BYTES = 500 * 1024;

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

export function RichEditor({ value, onChange, placeholder }: Props) {
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [pendingImage, setPendingImage] = useState('');

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-primary underline underline-offset-2' },
      }),
      Image.configure({
        HTMLAttributes: { class: 'rounded-md my-3 max-w-full h-auto' },
      }),
      Placeholder.configure({
        placeholder: placeholder ?? 'Bắt đầu viết nội dung...',
      }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class:
          'min-h-[300px] w-full rounded-b-md border border-t-0 border-input bg-background px-4 py-3 text-sm outline-none prose-style',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // Coi editor rỗng thật (<p></p>) là chuỗi rỗng
      onChange(html === '<p></p>' ? '' : html);
    },
  });

  // Đồng bộ giá trị bên ngoài (VD: khi mở dialog edit bài cũ)
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value && value !== current && value !== '<p></p>') {
      editor.commands.setContent(value);
    } else if (!value && current !== '<p></p>' && current !== '') {
      editor.commands.clearContent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  if (!editor) {
    return (
      <div className='min-h-[300px] rounded-md border border-input bg-muted/30 px-4 py-3 text-sm text-muted-foreground'>
        Đang tải editor...
      </div>
    );
  }

  function handleAddLink() {
    const prev = editor?.getAttributes('link').href as string | undefined;
    const url = window.prompt('URL liên kết (để trống để xóa link):', prev ?? '');
    if (url === null) return;
    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  }

  function insertImage() {
    if (!pendingImage) return;
    editor?.chain().focus().setImage({ src: pendingImage }).run();
    setPendingImage('');
    setShowImageDialog(false);
  }

  return (
    <div className='rich-editor'>
      <Toolbar editor={editor} onAddLink={handleAddLink} onAddImage={() => setShowImageDialog(true)} />
      <EditorContent editor={editor} />

      {showImageDialog && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
          <div className='w-full max-w-md rounded-lg bg-background p-5 shadow-xl'>
            <h3 className='mb-3 text-lg font-semibold'>Chèn ảnh vào bài</h3>
            <ImageInput
              value={pendingImage}
              onChange={setPendingImage}
              helperText={`Ảnh sẽ được nhúng inline (base64) tối đa ${MAX_IMAGE_BYTES / 1024} KB, hoặc dán URL ảnh online.`}
            />
            <div className='mt-4 flex justify-end gap-2'>
              <Button type='button' variant='outline' onClick={() => setShowImageDialog(false)}>
                Hủy
              </Button>
              <Button type='button' onClick={insertImage} disabled={!pendingImage}>
                Chèn
              </Button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .prose-style h2 {
          font-size: 1.4rem;
          font-weight: 700;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
        }
        .prose-style h3 {
          font-size: 1.15rem;
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 0.4rem;
        }
        .prose-style p {
          margin: 0.6rem 0;
        }
        .prose-style ul,
        .prose-style ol {
          margin: 0.6rem 0;
          padding-left: 1.5rem;
        }
        .prose-style ul {
          list-style: disc;
        }
        .prose-style ol {
          list-style: decimal;
        }
        .prose-style li {
          margin: 0.2rem 0;
        }
        .prose-style blockquote {
          border-left: 3px solid var(--border);
          padding-left: 1rem;
          margin: 0.8rem 0;
          color: var(--muted-foreground);
          font-style: italic;
        }
        .prose-style code {
          background: var(--muted);
          padding: 0.1rem 0.3rem;
          border-radius: 0.2rem;
          font-family: var(--font-mono), monospace;
          font-size: 0.9em;
        }
        .prose-style a {
          color: var(--primary);
          text-decoration: underline;
        }
        .prose-style p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: var(--muted-foreground);
          pointer-events: none;
          height: 0;
        }
      `}</style>
    </div>
  );
}

function Toolbar({
  editor,
  onAddLink,
  onAddImage,
}: {
  editor: Editor;
  onAddLink: () => void;
  onAddImage: () => void;
}) {
  const btn = (active: boolean) =>
    `inline-flex h-8 w-8 items-center justify-center rounded-sm text-sm hover:bg-muted ${
      active ? 'bg-muted' : ''
    }`;

  return (
    <div className='flex flex-wrap items-center gap-1 rounded-t-md border border-input bg-muted/30 p-1'>
      <button
        type='button'
        title='Đậm (Ctrl+B)'
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={btn(editor.isActive('bold'))}
      >
        <Icons.bold className='h-4 w-4' />
      </button>
      <button
        type='button'
        title='Nghiêng (Ctrl+I)'
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={btn(editor.isActive('italic'))}
      >
        <Icons.italic className='h-4 w-4' />
      </button>

      <div className='mx-1 h-5 w-px bg-border' />

      <button
        type='button'
        title='Tiêu đề lớn (H2)'
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={btn(editor.isActive('heading', { level: 2 }))}
      >
        <span className='text-sm font-bold'>H2</span>
      </button>
      <button
        type='button'
        title='Tiêu đề nhỏ (H3)'
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={btn(editor.isActive('heading', { level: 3 }))}
      >
        <span className='text-sm font-bold'>H3</span>
      </button>

      <div className='mx-1 h-5 w-px bg-border' />

      <button
        type='button'
        title='Danh sách chấm'
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={btn(editor.isActive('bulletList'))}
      >
        <span className='text-sm'>•</span>
      </button>
      <button
        type='button'
        title='Danh sách số'
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={btn(editor.isActive('orderedList'))}
      >
        <span className='text-xs font-mono'>1.</span>
      </button>
      <button
        type='button'
        title='Trích dẫn'
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={btn(editor.isActive('blockquote'))}
      >
        <span className='text-sm'>&ldquo;</span>
      </button>

      <div className='mx-1 h-5 w-px bg-border' />

      <button type='button' title='Chèn/sửa liên kết' onClick={onAddLink} className={btn(editor.isActive('link'))}>
        <Icons.share className='h-4 w-4' />
      </button>
      <button type='button' title='Chèn ảnh' onClick={onAddImage} className={btn(false)}>
        <Icons.media className='h-4 w-4' />
      </button>

      <div className='mx-1 h-5 w-px bg-border' />

      <button
        type='button'
        title='Hoàn tác (Ctrl+Z)'
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className={btn(false) + ' disabled:opacity-40'}
      >
        <span className='text-sm'>↺</span>
      </button>
      <button
        type='button'
        title='Làm lại (Ctrl+Shift+Z)'
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className={btn(false) + ' disabled:opacity-40'}
      >
        <span className='text-sm'>↻</span>
      </button>

      <div className='mx-1 h-5 w-px bg-border' />

      <button
        type='button'
        title='Xóa định dạng'
        onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
        className={btn(false)}
      >
        <span className='text-xs'>Tx</span>
      </button>
    </div>
  );
}
