import { db } from './db';
import { users, collections, bids } from './db/schema';
import { eq, and, desc } from 'drizzle-orm';
import type {
  User,
  Collection,
  Bid,
  CollectionWithDetails,
  BidWithUser,
} from '@/types/bidding';

// Helper function to convert database rows to application types
function dbUserToUser(dbUser: typeof users.$inferSelect): User {
  return {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    clerkId: dbUser.clerkId || undefined,
  };
}

function dbCollectionToCollection(
  dbCollection: typeof collections.$inferSelect
): Collection {
  return {
    id: dbCollection.id,
    name: dbCollection.name,
    description: dbCollection.description,
    stock: Number(dbCollection.stock),
    price: Number(dbCollection.price),
    ownerId: dbCollection.ownerId,
    createdAt: dbCollection.createdAt.toISOString(),
    updatedAt: dbCollection.updatedAt.toISOString(),
  };
}

function dbBidToBid(dbBid: typeof bids.$inferSelect): Bid {
  return {
    id: dbBid.id,
    collectionId: dbBid.collectionId,
    price: Number(dbBid.price),
    userId: dbBid.userId,
    status: dbBid.status,
    createdAt: dbBid.createdAt.toISOString(),
    updatedAt: dbBid.updatedAt.toISOString(),
  };
}

// Database service class
class Database {
  // User operations
  async getUsers(): Promise<User[]> {
    const dbUsers = await db.select().from(users);
    return dbUsers.map(dbUserToUser);
  }

  async getUserById(id: string): Promise<User | undefined> {
    const [dbUser] = await db.select().from(users).where(eq(users.id, id));
    return dbUser ? dbUserToUser(dbUser) : undefined;
  }

  async getUserByClerkId(clerkId: string): Promise<User | undefined> {
    const [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId));
    return dbUser ? dbUserToUser(dbUser) : undefined;
  }

  async createUser(userData: {
    name: string;
    email: string;
    clerkId?: string;
  }): Promise<User> {
    const [dbUser] = await db
      .insert(users)
      .values({
        name: userData.name,
        email: userData.email,
        clerkId: userData.clerkId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return dbUserToUser(dbUser);
  }

  // Collection operations
  async getCollections(): Promise<Collection[]> {
    const dbCollections = await db
      .select()
      .from(collections)
      .orderBy(desc(collections.createdAt));
    return dbCollections.map(dbCollectionToCollection);
  }

  async getCollectionById(id: string): Promise<Collection | undefined> {
    const [dbCollection] = await db
      .select()
      .from(collections)
      .where(eq(collections.id, id));
    return dbCollection ? dbCollectionToCollection(dbCollection) : undefined;
  }

  async getCollectionsByOwnerId(ownerId: string): Promise<Collection[]> {
    const dbCollections = await db
      .select()
      .from(collections)
      .where(eq(collections.ownerId, ownerId));
    return dbCollections.map(dbCollectionToCollection);
  }

  async createCollection(
    collection: Omit<Collection, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Collection> {
    const [dbCollection] = await db
      .insert(collections)
      .values({
        name: collection.name,
        description: collection.description,
        stock: collection.stock.toString(),
        price: collection.price.toString(),
        ownerId: collection.ownerId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return dbCollectionToCollection(dbCollection);
  }

  async updateCollection(
    id: string,
    updates: Partial<Omit<Collection, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Collection | undefined> {
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (updates.name) updateData.name = updates.name;
    if (updates.description) updateData.description = updates.description;
    if (updates.stock !== undefined) updateData.stock = updates.stock.toString();
    if (updates.price !== undefined) updateData.price = updates.price.toString();

    const [dbCollection] = await db
      .update(collections)
      .set(updateData)
      .where(eq(collections.id, id))
      .returning();

    return dbCollection ? dbCollectionToCollection(dbCollection) : undefined;
  }

  async deleteCollection(id: string): Promise<boolean> {
    const result = await db
      .delete(collections)
      .where(eq(collections.id, id))
      .returning();
    return result.length > 0;
  }

  // Bid operations
  async getBids(): Promise<Bid[]> {
    const dbBids = await db
      .select()
      .from(bids)
      .orderBy(desc(bids.createdAt));
    return dbBids.map(dbBidToBid);
  }

  async getBidById(id: string): Promise<Bid | undefined> {
    const [dbBid] = await db.select().from(bids).where(eq(bids.id, id));
    return dbBid ? dbBidToBid(dbBid) : undefined;
  }

  async getBidsByCollectionId(collectionId: string): Promise<Bid[]> {
    const dbBids = await db
      .select()
      .from(bids)
      .where(eq(bids.collectionId, collectionId))
      .orderBy(desc(bids.createdAt));
    return dbBids.map(dbBidToBid);
  }

  async getBidsByUserId(userId: string): Promise<Bid[]> {
    const dbBids = await db
      .select()
      .from(bids)
      .where(eq(bids.userId, userId))
      .orderBy(desc(bids.createdAt));
    return dbBids.map(dbBidToBid);
  }

  async createBid(
    bid: Omit<Bid, 'id' | 'createdAt' | 'updatedAt' | 'status'>
  ): Promise<Bid> {
    const [dbBid] = await db
      .insert(bids)
      .values({
        collectionId: bid.collectionId,
        price: bid.price.toString(),
        userId: bid.userId,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return dbBidToBid(dbBid);
  }

  async updateBid(
    id: string,
    updates: Partial<Omit<Bid, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Bid | undefined> {
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (updates.price !== undefined) updateData.price = updates.price.toString();
    if (updates.status) updateData.status = updates.status;

    const [dbBid] = await db
      .update(bids)
      .set(updateData)
      .where(eq(bids.id, id))
      .returning();

    return dbBid ? dbBidToBid(dbBid) : undefined;
  }

  async deleteBid(id: string): Promise<boolean> {
    const result = await db.delete(bids).where(eq(bids.id, id)).returning();
    return result.length > 0;
  }

  async acceptBid(
    collectionId: string,
    bidId: string
  ): Promise<{
    acceptedBid: Bid;
    rejectedBids: Bid[];
  } | null> {
    // Verify the bid exists and belongs to the collection
    const [targetBid] = await db
      .select()
      .from(bids)
      .where(and(eq(bids.id, bidId), eq(bids.collectionId, collectionId)));

    if (!targetBid) return null;

    // Reject all other pending bids for this collection
    const rejectedDbBids = await db
      .update(bids)
      .set({ status: 'rejected', updatedAt: new Date() })
      .where(
        and(
          eq(bids.collectionId, collectionId),
          eq(bids.status, 'pending'),
          eq(bids.id, bidId) // Not equal to the accepted bid
        )
      )
      .returning();

    // Accept the selected bid
    const [acceptedDbBid] = await db
      .update(bids)
      .set({ status: 'accepted', updatedAt: new Date() })
      .where(eq(bids.id, bidId))
      .returning();

    return {
      acceptedBid: dbBidToBid(acceptedDbBid),
      rejectedBids: rejectedDbBids.map(dbBidToBid),
    };
  }

  // Complex queries - OPTIMIZED with single query
  async getCollectionsWithDetails(): Promise<CollectionWithDetails[]> {
    // Fetch all collections with their owners in a single query
    const collectionsWithOwners = await db.query.collections.findMany({
      orderBy: desc(collections.createdAt),
      with: {
        owner: true,
        bids: {
          orderBy: desc(bids.createdAt),
          with: {
            user: true,
          },
        },
      },
    });

    // Transform to application types
    return collectionsWithOwners.map((dbCollection) => ({
      ...dbCollectionToCollection(dbCollection),
      owner: dbUserToUser(dbCollection.owner),
      bids: dbCollection.bids.map((dbBid) => ({
        ...dbBidToBid(dbBid),
        user: dbBid.user ? dbUserToUser(dbBid.user) : undefined,
      })),
    }));
  }

  async getCollectionWithDetails(
    id: string
  ): Promise<CollectionWithDetails | undefined> {
    // Fetch collection with owner and bids in a single query
    const dbCollection = await db.query.collections.findFirst({
      where: eq(collections.id, id),
      with: {
        owner: true,
        bids: {
          orderBy: desc(bids.createdAt),
          with: {
            user: true,
          },
        },
      },
    });

    if (!dbCollection) return undefined;

    // Transform to application types
    return {
      ...dbCollectionToCollection(dbCollection),
      owner: dbUserToUser(dbCollection.owner),
      bids: dbCollection.bids.map((dbBid) => ({
        ...dbBidToBid(dbBid),
        user: dbBid.user ? dbUserToUser(dbBid.user) : undefined,
      })),
    };
  }
}

// Export singleton instance
export const dbService = new Database();

// For backward compatibility, also export as 'db'
export { dbService as db };
