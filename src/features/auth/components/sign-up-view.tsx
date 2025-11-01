import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SignUp as ClerkSignUpForm } from '@clerk/nextjs';
import { Gavel, TrendingUp, Shield, Zap } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sign Up - Biddy',
  description: 'Create your Biddy account.'
};

export default function SignUpViewPage() {
  return (
    <div className='relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <div className='bg-muted relative hidden h-full flex-col p-10 text-white lg:flex dark:border-r'>
        <div className='absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900' />
        <div className='relative z-20 flex items-center text-lg font-medium'>
          <Gavel className='mr-2 h-8 w-8' />
          <span className='text-2xl font-bold'>Biddy</span>
        </div>
        <div className='relative z-20 mt-auto'>
          <div className='space-y-6'>
            <h2 className='text-3xl font-bold'>
              Start Your Bidding Journey Today
            </h2>
            <p className='text-gray-200 text-lg'>
              Join the premier platform for collectors and sellers
            </p>
            <div className='space-y-4'>
              <div className='flex items-start gap-3'>
                <div className='rounded-full bg-white/10 p-2'>
                  <TrendingUp className='h-5 w-5' />
                </div>
                <div>
                  <h3 className='font-semibold'>Smart Bidding</h3>
                  <p className='text-sm text-gray-300'>
                    Place and manage bids with real-time updates
                  </p>
                </div>
              </div>
              <div className='flex items-start gap-3'>
                <div className='rounded-full bg-white/10 p-2'>
                  <Shield className='h-5 w-5' />
                </div>
                <div>
                  <h3 className='font-semibold'>Secure Transactions</h3>
                  <p className='text-sm text-gray-300'>
                    Your bids and collections are always protected
                  </p>
                </div>
              </div>
              <div className='flex items-start gap-3'>
                <div className='rounded-full bg-white/10 p-2'>
                  <Zap className='h-5 w-5' />
                </div>
                <div>
                  <h3 className='font-semibold'>Instant Notifications</h3>
                  <p className='text-sm text-gray-300'>
                    Get notified when bids are placed or accepted
                  </p>
                </div>
              </div>
            </div>
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
              Create an account
            </h1>
            <p className='text-muted-foreground text-sm'>
              Join Biddy and discover amazing collections
            </p>
          </div>

          <ClerkSignUpForm
            appearance={{
              elements: {
                formButtonPrimary: 'bg-primary hover:bg-primary/90',
                card: 'shadow-none',
              },
            }}
          />

          <p className='text-muted-foreground px-8 text-center text-sm'>
            By creating an account, you agree to our{' '}
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
