'use server';

import { db } from '@/lib/db-service';
import type { Bid } from '@/types/bidding';
import { revalidatePath } from 'next/cache';

export async function getBidsByCollectionId(
  collectionId: string
): Promise<Bid[]> {
  return await db.getBidsByCollectionId(collectionId);
}

export async function getBidsByUserId(userId: string): Promise<Bid[]> {
  return await db.getBidsByUserId(userId);
}

export async function createBid(data: {
  collectionId: string;
  price: number;
  userId: string;
}): Promise<{ success: boolean; bid?: Bid; error?: string }> {
  try {
    // Check if collection exists
    const collection = await db.getCollectionById(data.collectionId);
    if (!collection) {
      return { success: false, error: 'Collection not found' };
    }

    // Prevent owner from bidding on their own collection
    if (collection.ownerId === data.userId) {
      return {
        success: false,
        error: 'You cannot bid on your own collection',
      };
    }

    // Check if user already has a pending bid on this collection
    const existingBids = await db.getBidsByCollectionId(data.collectionId);
    const userPendingBid = existingBids.find(
      (bid) => bid.userId === data.userId && bid.status === 'pending'
    );

    if (userPendingBid) {
      return {
        success: false,
        error: 'You already have a pending bid on this collection',
      };
    }

    const bid = await db.createBid(data);
    revalidatePath('/bidding');
    return { success: true, bid };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create bid',
    };
  }
}

export async function updateBid(
  id: string,
  data: {
    price?: number;
  }
): Promise<{ success: boolean; bid?: Bid; error?: string }> {
  try {
    const existingBid = await db.getBidById(id);
    if (!existingBid) {
      return { success: false, error: 'Bid not found' };
    }

    // Only allow updating pending bids
    if (existingBid.status !== 'pending') {
      return {
        success: false,
        error: `Cannot update ${existingBid.status} bid`,
      };
    }

    const bid = await db.updateBid(id, data);
    if (!bid) {
      return { success: false, error: 'Bid not found' };
    }
    revalidatePath('/bidding');
    return { success: true, bid };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update bid',
    };
  }
}

export async function deleteBid(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const existingBid = await db.getBidById(id);
    if (!existingBid) {
      return { success: false, error: 'Bid not found' };
    }

    // Only allow deleting pending bids
    if (existingBid.status !== 'pending') {
      return {
        success: false,
        error: `Cannot delete ${existingBid.status} bid`,
      };
    }

    const deleted = await db.deleteBid(id);
    if (!deleted) {
      return { success: false, error: 'Bid not found' };
    }
    revalidatePath('/bidding');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete bid',
    };
  }
}

export async function acceptBid(
  collectionId: string,
  bidId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await db.acceptBid(collectionId, bidId);
    if (!result) {
      return { success: false, error: 'Bid not found' };
    }
    revalidatePath('/bidding');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to accept bid',
    };
  }
}

export async function rejectBid(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const bid = await db.updateBid(id, { status: 'rejected' });
    if (!bid) {
      return { success: false, error: 'Bid not found' };
    }
    revalidatePath('/bidding');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reject bid',
    };
  }
}
