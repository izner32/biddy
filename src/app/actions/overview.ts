'use server';

import { db } from '@/lib/db';
import { sql, count, avg, eq, and } from 'drizzle-orm';
import { collections, bids } from '@/lib/db/schema';
import { getCurrentUser } from './users';

export interface OverviewStats {
  myCollections: number;
  myActiveBids: number;
  mySuccessfulSales: number;
  bidsOnMyCollections: number;
}

export async function getOverviewStats(): Promise<OverviewStats> {
  try {
    const currentUserData = await getCurrentUser();
    const userId = currentUserData.id;

    // Get my collections count (collections I own)
    const myCollectionsResult = await db
      .select({ count: count() })
      .from(collections)
      .where(eq(collections.ownerId, userId));
    const myCollections = Number(myCollectionsResult[0]?.count || 0);

    // Get my active bids count (bids I placed that are pending)
    const myActiveBidsResult = await db
      .select({ count: count() })
      .from(bids)
      .where(and(
        eq(bids.userId, userId),
        eq(bids.status, 'pending')
      ));
    const myActiveBids = Number(myActiveBidsResult[0]?.count || 0);

    // Get my successful sales (bids I placed that were accepted)
    const mySuccessfulSalesResult = await db
      .select({ count: count() })
      .from(bids)
      .where(and(
        eq(bids.userId, userId),
        eq(bids.status, 'accepted')
      ));
    const mySuccessfulSales = Number(mySuccessfulSalesResult[0]?.count || 0);

    // Get bids on my collections (pending bids from others on my collections)
    const bidsOnMyCollectionsResult = await db
      .select({ count: count() })
      .from(bids)
      .innerJoin(collections, eq(bids.collectionId, collections.id))
      .where(and(
        eq(collections.ownerId, userId),
        eq(bids.status, 'pending')
      ));
    const bidsOnMyCollections = Number(bidsOnMyCollectionsResult[0]?.count || 0);

    return {
      myCollections,
      myActiveBids,
      mySuccessfulSales,
      bidsOnMyCollections,
    };
  } catch (error) {
    console.error('Error fetching overview stats:', error);
    return {
      myCollections: 0,
      myActiveBids: 0,
      mySuccessfulSales: 0,
      bidsOnMyCollections: 0,
    };
  }
}
