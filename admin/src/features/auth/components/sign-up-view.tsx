import { redirect } from 'next/navigation';

export default function SignUpViewPage() {
  redirect('/auth/sign-in');
}
