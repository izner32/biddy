import { BiddingPageContent } from './bidding-page-content';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';

export const metadata = {
  title: 'Collections - Biddy',
  description: 'Browse collections and place bids on Biddy',
};

export default function BiddingPage() {
  return (
    <PageContainer>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <Heading
            title="Browse Collections"
            description="Discover unique collections and place winning bids"
          />
        </div>
        <Separator />
        <BiddingPageContent />
      </div>
    </PageContainer>
  );
}
