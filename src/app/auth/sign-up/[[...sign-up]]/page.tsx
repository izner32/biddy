import { Metadata } from 'next';
import SignUpViewPage from '@/features/auth/components/sign-up-view';

export const metadata: Metadata = {
  title: 'Sign Up - Biddy',
  description: 'Create your Biddy account and join the bidding platform.'
};

export default async function Page() {
  return <SignUpViewPage />;
}
