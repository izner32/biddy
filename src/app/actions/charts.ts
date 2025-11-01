'use server';

import { db } from '@/lib/db';
import { eq, and, desc } from 'drizzle-orm';
import { collections, bids, users } from '@/lib/db/schema';
import { getCurrentUser } from './users';

export interface RecentBid {
  id: string;
  collectionName: string;
  bidderName: string;
  amount: number;
  status: string;
  createdAt: string;
}

export async function getRecentBidsOnMyCollections(): Promise<RecentBid[]> {
  try {
    const currentUserData = await getCurrentUser();
    const userId = currentUserData.id;

    // Get recent bids on my collections
    const result = await db
      .select({
        id: bids.id,
        collectionName: collections.name,
        bidderName: users.name,
        amount: bids.price,
        status: bids.status,
        createdAt: bids.createdAt,
      })
      .from(bids)
      .innerJoin(collections, eq(bids.collectionId, collections.id))
      .innerJoin(users, eq(bids.userId, users.id))
      .where(eq(collections.ownerId, userId))
      .orderBy(desc(bids.createdAt))
      .limit(5);

    return result.map((row) => ({
      id: row.id,
      collectionName: row.collectionName,
      bidderName: row.bidderName,
      amount: Number(row.amount),
      status: row.status,
      createdAt: row.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching recent bids:', error);
    return [];
  }
}

export interface MyBidActivity {
  id: string;
  collectionName: string;
  amount: number;
  status: string;
  createdAt: string;
}

export async function getMyRecentBids(): Promise<MyBidActivity[]> {
  try {
    const currentUserData = await getCurrentUser();
    const userId = currentUserData.id;

    // Get my recent bids
    const result = await db
      .select({
        id: bids.id,
        collectionName: collections.name,
        amount: bids.price,
        status: bids.status,
        createdAt: bids.createdAt,
      })
      .from(bids)
      .innerJoin(collections, eq(bids.collectionId, collections.id))
      .where(eq(bids.userId, userId))
      .orderBy(desc(bids.createdAt))
      .limit(5);

    return result.map((row) => ({
      id: row.id,
      collectionName: row.collectionName,
      amount: Number(row.amount),
      status: row.status,
      createdAt: row.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching my bids:', error);
    return [];
  }
}
