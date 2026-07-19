import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import sanitizeHtml from 'sanitize-html';
import { getPostBySlug } from '@/lib/posts';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: 'Không tìm thấy bài viết' };

  const description = post.excerpt ?? undefined;
  const images = post.coverImage ? [{ url: post.coverImage }] : undefined;

  return {
    title: post.title,
    description,
    openGraph: {
      type: 'article',
      title: post.title,
      description,
      images,
      publishedTime: post.publishedAt?.toISOString(),
      authors: post.author.name ? [post.author.name] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
    alternates: { canonical: `/blog/${slug}` },
  };
}

function contentToString(content: unknown): string {
  if (typeof content === 'string') return content;
  if (content && typeof content === 'object') {
    // Legacy JSON (TipTap-like) — dump text nodes
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

// Detect: nếu chuỗi bắt đầu bằng tag HTML phổ biến → xử lý như HTML
function looksLikeHtml(s: string): boolean {
  return /<(p|h[1-6]|ul|ol|blockquote|strong|em|a|img|br|div)[\s>/]/i.test(s.trim().slice(0, 200));
}

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'blockquote', 'br', 'hr',
    'strong', 'em', 'b', 'i', 'u', 's',
    'a', 'img',
    'code', 'pre',
    'span', 'div',
  ],
  allowedAttributes: {
    a: ['href', 'name', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height'],
    span: ['class'],
    div: ['class'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel', 'data'],
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs: { ...attribs, target: '_blank', rel: 'noopener noreferrer' },
    }),
  },
};

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post || post.status !== 'PUBLISHED') notFound();

  const body = contentToString(post.content);
  const isHtml = looksLikeHtml(body);
  const cleanHtml = isHtml ? sanitizeHtml(body, SANITIZE_OPTIONS) : '';

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
            {isHtml ? (
              <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />
            ) : (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}
