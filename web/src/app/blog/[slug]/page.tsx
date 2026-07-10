import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getPostBySlug } from '@/lib/posts';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: 'Không tìm thấy bài viết' };
  return { title: post.title, description: post.excerpt ?? undefined };
}

function contentToString(content: unknown): string {
  if (typeof content === 'string') return content;
  if (content && typeof content === 'object') {
    // Legacy JSON (TipTap-like) — dump text nodes.
    const walk = (n: unknown): string => {
      if (typeof n === 'string') return n;
      if (!n || typeof n !== 'object') return '';
      const node = n as Record<string, unknown>;
      if (typeof node.text === 'string') return node.text;
      if (Array.isArray(node.content)) return node.content.map(walk).join('\n\n');
      return '';
    };
    return walk(content);
  }
  return '';
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post || post.status !== 'PUBLISHED') notFound();

  const body = contentToString(post.content);

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

          <div className='mt-8 md-content'>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
          </div>
        </article>
      </div>
    </div>
  );
}
