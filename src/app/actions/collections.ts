'use server';

import { db } from '@/lib/db-service';
import type { Collection, CollectionWithDetails } from '@/types/bidding';
import { revalidatePath } from 'next/cache';

export async function getCollections(): Promise<Collection[]> {
  return await db.getCollections();
}

export async function getCollectionsWithDetails(): Promise<
  CollectionWithDetails[]
> {
  const collections = await db.getCollectionsWithDetails();
  const { getCurrentUser } = await import('./users');
  const currentUserData = await getCurrentUser();

  // Replace user data for bids made by the current Clerk user
  return collections.map(collection => ({
    ...collection,
    // Update owner if it's the current user
    owner: collection.ownerId === currentUserData.id
      ? currentUserData
      : collection.owner,
    // Update bid users if they match the current user
    bids: collection.bids.map(bid => ({
      ...bid,
      user: bid.userId === currentUserData.id
        ? currentUserData
        : bid.user
    }))
  }));
}

export async function getCollectionById(
  id: string
): Promise<Collection | null> {
  const collection = await db.getCollectionById(id);
  return collection || null;
}

export async function getCollectionWithDetails(
  id: string
): Promise<CollectionWithDetails | null> {
  const collection = await db.getCollectionWithDetails(id);
  return collection || null;
}

export async function createCollection(data: {
  name: string;
  description: string;
  stock: number;
  price: number;
  ownerId: string;
}): Promise<{ success: boolean; collection?: Collection; error?: string }> {
  try {
    const collection = await db.createCollection(data);
    revalidatePath('/bidding');
    return { success: true, collection };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create collection',
    };
  }
}

export async function updateCollection(
  id: string,
  data: {
    name?: string;
    description?: string;
    stock?: number;
    price?: number;
  }
): Promise<{ success: boolean; collection?: Collection; error?: string }> {
  try {
    const collection = await db.updateCollection(id, data);
    if (!collection) {
      return { success: false, error: 'Collection not found' };
    }
    revalidatePath('/bidding');
    return { success: true, collection };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update collection',
    };
  }
}

export async function deleteCollection(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const deleted = await db.deleteCollection(id);
    if (!deleted) {
      return { success: false, error: 'Collection not found' };
    }
    revalidatePath('/bidding');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete collection',
    };
  }
}
