import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import type { RecentBid } from '@/app/actions/charts';

interface RecentBidsReceivedProps {
  bids: RecentBid[];
}

export function RecentBidsReceived({ bids }: RecentBidsReceivedProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-500/10 text-green-500';
      case 'rejected':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-yellow-500/10 text-yellow-500';
    }
  };

  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle>Recent Bids Received</CardTitle>
        <CardDescription>Latest bids on your collections</CardDescription>
      </CardHeader>
      <CardContent>
        {bids.length === 0 ? (
          <div className='text-muted-foreground text-center py-8 text-sm'>
            No bids received yet
          </div>
        ) : (
          <div className='space-y-4'>
            {bids.map((bid) => (
              <div key={bid.id} className='flex items-center justify-between'>
                <div className='space-y-1'>
                  <p className='text-sm leading-none font-medium'>
                    {bid.collectionName}
                  </p>
                  <p className='text-muted-foreground text-sm'>
                    by {bid.bidderName}
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    {format(new Date(bid.createdAt), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className='flex flex-col items-end gap-1'>
                  <p className='font-medium'>
                    ${bid.amount.toLocaleString()}
                  </p>
                  <Badge className={getStatusColor(bid.status)} variant='outline'>
                    {bid.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
