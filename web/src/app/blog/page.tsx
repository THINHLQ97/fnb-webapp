import type { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, User } from 'lucide-react';
import { getPublishedPosts } from '@/lib/posts';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Tin tức, chia sẻ và câu chuyện từ F&B Store.',
};

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <div className='py-12'>
      <div className='container-main'>
        <div className='text-center'>
          <h1 className='text-3xl font-bold sm:text-4xl'>Blog</h1>
          <p className='mt-2 text-muted'>
            Tin tức, chia sẻ và câu chuyện từ quán
          </p>
        </div>

        {posts.length === 0 ? (
          <p className='mt-12 text-center text-muted'>
            Chưa có bài viết nào. Hãy quay lại sau nhé!
          </p>
        ) : (
          <div className='mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className='group overflow-hidden rounded-2xl bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-md'
              >
                <div className='flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-primary/5 to-accent/10'>
                  {post.coverImage ? (
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className='h-full w-full object-cover'
                    />
                  ) : (
                    <span className='text-4xl text-primary/20'>✍</span>
                  )}
                </div>
                <div className='p-5'>
                  <h2 className='text-lg font-semibold group-hover:text-primary transition-colors line-clamp-2'>
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className='mt-2 text-sm text-muted line-clamp-2'>
                      {post.excerpt}
                    </p>
                  )}
                  <div className='mt-3 flex items-center gap-4 text-xs text-muted'>
                    {post.author.name && (
                      <span className='flex items-center gap-1'>
                        <User className='h-3 w-3' />
                        {post.author.name}
                      </span>
                    )}
                    {post.publishedAt && (
                      <span className='flex items-center gap-1'>
                        <Calendar className='h-3 w-3' />
                        {new Date(post.publishedAt).toLocaleDateString('vi-VN')}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
