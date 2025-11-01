import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SignIn as ClerkSignInForm } from '@clerk/nextjs';
import { Gavel } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sign In - Biddy',
  description: 'Sign in to your Biddy account.'
};

export default function SignInViewPage() {
  return (
    <div className='relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <div className='bg-muted relative hidden h-full flex-col p-10 text-white lg:flex dark:border-r'>
        <div className='absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900' />
        <div className='relative z-20 flex items-center text-lg font-medium'>
          <Gavel className='mr-2 h-8 w-8' />
          <span className='text-2xl font-bold'>Biddy</span>
        </div>
        <div className='relative z-20 mt-auto'>
          <blockquote className='space-y-2'>
            <p className='text-xl font-medium leading-relaxed'>
              Join thousands of collectors and sellers on the most trusted
              bidding platform for unique collections and rare finds.
            </p>
            <footer className='text-sm text-gray-300'>
              The Biddy Community
            </footer>
          </blockquote>
        </div>
        <div className='relative z-20 mt-8 grid grid-cols-3 gap-4 text-center'>
          <div>
            <div className='text-2xl font-bold'>10K+</div>
            <div className='text-xs text-gray-300'>Active Users</div>
          </div>
          <div>
            <div className='text-2xl font-bold'>50K+</div>
            <div className='text-xs text-gray-300'>Collections</div>
          </div>
          <div>
            <div className='text-2xl font-bold'>100K+</div>
            <div className='text-xs text-gray-300'>Bids Placed</div>
          </div>
        </div>
      </div>
      <div className='flex h-full items-center justify-center p-4 lg:p-8'>
        <div className='flex w-full max-w-md flex-col items-center justify-center space-y-6'>
          <div className='flex flex-col space-y-2 text-center'>
            <div className='flex items-center justify-center mb-4 lg:hidden'>
              <Gavel className='mr-2 h-8 w-8' />
              <span className='text-2xl font-bold'>Biddy</span>
            </div>
            <h1 className='text-2xl font-semibold tracking-tight'>
              Welcome back
            </h1>
            <p className='text-muted-foreground text-sm'>
              Sign in to your account to continue bidding
            </p>
          </div>

          <ClerkSignInForm
            appearance={{
              elements: {
                formButtonPrimary: 'bg-primary hover:bg-primary/90',
                card: 'shadow-none',
              },
            }}
          />

          <p className='text-muted-foreground px-8 text-center text-sm'>
            By signing in, you agree to our{' '}
            <Link
              href='/terms'
              className='hover:text-primary underline underline-offset-4'
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href='/privacy'
              className='hover:text-primary underline underline-offset-4'
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
