import { UserProfile } from '@clerk/nextjs';
import PageContainer from '@/components/layout/page-container';

export default function ProfileViewPage() {
  return (
    <PageContainer scrollable>
      <div className='flex w-full flex-col'>
        <UserProfile />
      </div>
    </PageContainer>
  );
}
