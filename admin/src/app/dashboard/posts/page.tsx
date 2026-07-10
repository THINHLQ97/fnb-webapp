import PageContainer from '@/components/layout/page-container';
import { PostListing } from '@/features/posts/components/post-listing';
import { AddPostButton } from './add-button';

export const metadata = {
  title: 'Dashboard: Bài viết',
};

export default function PostsPage() {
  return (
    <PageContainer
      pageTitle='Bài viết'
      pageDescription='Quản lý nội dung blog hiển thị trên website'
      pageHeaderAction={<AddPostButton />}
    >
      <PostListing />
    </PageContainer>
  );
}
