import type { Metadata } from 'next';
import { Heart, Leaf, Award, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Giới thiệu',
  description: 'Tìm hiểu về F&B Store — câu chuyện và giá trị cốt lõi.',
};

const values = [
  {
    icon: Heart,
    title: 'Tận tâm',
    description: 'Mỗi ly thức uống được pha chế với sự tận tâm và yêu thương.',
  },
  {
    icon: Leaf,
    title: 'Tươi ngon',
    description: 'Nguyên liệu được chọn lọc kỹ lưỡng, đảm bảo tươi mới mỗi ngày.',
  },
  {
    icon: Award,
    title: 'Chất lượng',
    description: 'Cam kết chất lượng cao nhất trong từng sản phẩm phục vụ.',
  },
  {
    icon: Users,
    title: 'Cộng đồng',
    description: 'Xây dựng không gian kết nối, nơi mọi người cùng thưởng thức.',
  },
];

export default function AboutPage() {
  return (
    <div className='py-12'>
      <div className='container-main'>
        <div className='mx-auto max-w-2xl text-center'>
          <h1 className='text-3xl font-bold sm:text-4xl'>Về chúng tôi</h1>
          <p className='mt-4 text-lg text-muted'>
            F&B Store được thành lập với niềm đam mê mang đến những ly thức uống chất lượng nhất.
            Chúng tôi tin rằng một ly nước ngon có thể làm sáng cả một ngày dài.
          </p>
        </div>

        <div className='mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4'>
          {values.map((v) => (
            <div key={v.title} className='rounded-2xl bg-card p-6 text-center shadow-sm'>
              <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                <v.icon className='h-6 w-6' />
              </div>
              <h3 className='mt-4 font-semibold'>{v.title}</h3>
              <p className='mt-2 text-sm text-muted'>{v.description}</p>
            </div>
          ))}
        </div>

        <div className='mx-auto mt-16 max-w-2xl rounded-2xl bg-section p-8'>
          <h2 className='text-xl font-bold'>Câu chuyện của chúng tôi</h2>
          <div className='mt-4 space-y-4 text-muted'>
            <p>
              Bắt đầu từ một xe đẩy nhỏ ven đường với những ly cà phê phin truyền thống,
              F&B Store dần lớn lên nhờ sự ủng hộ của khách hàng và niềm đam mê không ngừng
              với nghề pha chế.
            </p>
            <p>
              Ngày nay, chúng tôi tự hào mang đến menu đa dạng từ cà phê, trà, nước ép
              đến các loại thức uống đặc biệt — tất cả đều được chuẩn bị từ nguyên liệu
              tươi ngon nhất.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
