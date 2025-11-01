import { Metadata } from 'next';
import SignInViewPage from '@/features/auth/components/sign-in-view';

export const metadata: Metadata = {
  title: 'Sign In - Biddy',
  description: 'Sign in to your Biddy account and start bidding on collections.'
};

export default async function Page() {
  return <SignInViewPage />;
}
