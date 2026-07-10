import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { getPostBySlug } from '@/lib/posts';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: 'Không tìm thấy bài viết' };
  return { title: post.title, description: post.excerpt ?? undefined };
}

function renderContent(content: unknown): string {
  if (typeof content === 'string') return content;
  if (!content || typeof content !== 'object') return '';

  const node = content as Record<string, unknown>;
  if (node.type === 'text' && typeof node.text === 'string') {
    return node.text;
  }
  if (Array.isArray(node.content)) {
    return node.content.map(renderContent).join('');
  }
  return '';
}

function renderNodes(content: unknown): React.ReactNode[] {
  if (typeof content === 'string') {
    return content
      .split(/\n\s*\n/)
      .map((para, i) => (para.trim() ? <p key={i} className='my-3 leading-relaxed'>{para.trim()}</p> : null))
      .filter(Boolean) as React.ReactNode[];
  }
  if (!content || typeof content !== 'object') return [];

  const root = content as { content?: unknown[] };
  if (!Array.isArray(root.content)) return [<p key='0'>{renderContent(content)}</p>];

  return root.content.map((node: unknown, i: number) => {
    const n = node as Record<string, unknown>;
    const text = renderContent(n);
    if (!text) return null;

    switch (n.type) {
      case 'heading': {
        const level = (n.attrs as Record<string, unknown>)?.level ?? 2;
        if (level === 1) return <h1 key={i} className='text-2xl font-bold mt-6 mb-2'>{text}</h1>;
        if (level === 2) return <h2 key={i} className='text-xl font-semibold mt-5 mb-2'>{text}</h2>;
        return <h3 key={i} className='text-lg font-semibold mt-4 mb-1'>{text}</h3>;
      }
      case 'bulletList':
      case 'orderedList': {
        const items = Array.isArray(n.content) ? n.content : [];
        const Tag = n.type === 'bulletList' ? 'ul' : 'ol';
        return (
          <Tag key={i} className={n.type === 'bulletList' ? 'list-disc pl-6 my-2' : 'list-decimal pl-6 my-2'}>
            {items.map((li: unknown, j: number) => (
              <li key={j}>{renderContent(li)}</li>
            ))}
          </Tag>
        );
      }
      case 'blockquote':
        return <blockquote key={i} className='border-l-4 border-primary/30 pl-4 italic text-muted my-4'>{text}</blockquote>;
      default:
        return <p key={i} className='my-2 leading-relaxed'>{text}</p>;
    }
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post || post.status !== 'PUBLISHED') notFound();

  return (
    <div className='py-12'>
      <div className='container-main max-w-3xl'>
        <Link
          href='/blog'
          className='inline-flex items-center gap-1 text-sm text-muted hover:text-primary transition-colors'
        >
          <ArrowLeft className='h-4 w-4' />
          Quay lại Blog
        </Link>

        <article className='mt-6'>
          {post.coverImage && (
            <img
              src={post.coverImage}
              alt={post.title}
              className='w-full rounded-2xl object-cover aspect-[16/9]'
            />
          )}

          <h1 className='mt-6 text-3xl font-bold sm:text-4xl'>{post.title}</h1>

          <div className='mt-3 flex items-center gap-4 text-sm text-muted'>
            {post.author.name && (
              <span className='flex items-center gap-1'>
                <User className='h-4 w-4' />
                {post.author.name}
              </span>
            )}
            {post.publishedAt && (
              <span className='flex items-center gap-1'>
                <Calendar className='h-4 w-4' />
                {new Date(post.publishedAt).toLocaleDateString('vi-VN')}
              </span>
            )}
          </div>

          {post.excerpt && (
            <p className='mt-4 text-lg text-muted italic'>{post.excerpt}</p>
          )}

          <div className='mt-8 prose-custom'>
            {renderNodes(post.content)}
          </div>
        </article>
      </div>
    </div>
  );
}
