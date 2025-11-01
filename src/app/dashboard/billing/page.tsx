import { Metadata } from 'next';
import BillingPageContent from './billing-page-content';
import PageContainer from '@/components/layout/page-container';

export const metadata: Metadata = {
  title: 'Billing - Biddy',
  description: 'Manage your billing and subscription'
};

export default function BillingPage() {
  return (
    <PageContainer scrollable>
      <BillingPageContent />
    </PageContainer>
  );
}
