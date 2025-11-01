import 'dotenv/config';
import { db } from './index';
import { users, collections, bids } from './schema';
import { generateUsers, generateCollections, generateBids } from '../mock-data';

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Clear existing data
    console.log('Clearing existing data...');
    await db.delete(bids);
    await db.delete(collections);
    await db.delete(users);

    // Generate mock data
    console.log('Generating mock data...');
    const mockUsers = generateUsers(10);
    const mockCollections = generateCollections(100, mockUsers);
    const mockBids = generateBids(mockCollections, mockUsers, 10);

    // Insert users
    console.log(`Inserting ${mockUsers.length} users...`);
    await db.insert(users).values(
      mockUsers.map((user) => ({
        ...user,
        id: undefined, // Let database generate UUID
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );

    // Get inserted users to get their actual UUIDs
    const insertedUsers = await db.select().from(users);
    console.log(`✓ Inserted ${insertedUsers.length} users`);

    // Create a mapping from old IDs to new IDs
    const userIdMap = new Map<string, string>();
    mockUsers.forEach((mockUser, index) => {
      userIdMap.set(mockUser.id, insertedUsers[index].id);
    });

    // Insert collections with mapped owner IDs
    console.log(`Inserting ${mockCollections.length} collections...`);
    await db.insert(collections).values(
      mockCollections.map((collection) => ({
        ...collection,
        id: undefined, // Let database generate UUID
        ownerId: userIdMap.get(collection.ownerId)!,
        stock: collection.stock.toString(),
        price: collection.price.toString(),
        createdAt: new Date(collection.createdAt),
        updatedAt: new Date(collection.updatedAt),
      }))
    );

    // Get inserted collections
    const insertedCollections = await db.select().from(collections);
    console.log(`✓ Inserted ${insertedCollections.length} collections`);

    // Create a mapping from old collection IDs to new IDs
    const collectionIdMap = new Map<string, string>();
    mockCollections.forEach((mockCollection, index) => {
      collectionIdMap.set(mockCollection.id, insertedCollections[index].id);
    });

    // Insert bids with mapped collection and user IDs
    console.log(`Inserting ${mockBids.length} bids...`);
    await db.insert(bids).values(
      mockBids.map((bid) => ({
        ...bid,
        id: undefined, // Let database generate UUID
        collectionId: collectionIdMap.get(bid.collectionId)!,
        userId: userIdMap.get(bid.userId)!,
        price: bid.price.toString(),
        createdAt: new Date(bid.createdAt),
        updatedAt: new Date(bid.updatedAt),
      }))
    );

    console.log(`✓ Inserted ${mockBids.length} bids`);
    console.log('✅ Database seeded successfully!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed();
