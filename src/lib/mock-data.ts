import { faker } from '@faker-js/faker';
import type { User, Collection, Bid } from '@/types/bidding';

// Generate mock users
export function generateUsers(count: number = 10): User[] {
  const users: User[] = [];
  for (let i = 0; i < count; i++) {
    users.push({
      id: `user-${i + 1}`,
      name: faker.person.fullName(),
      email: faker.internet.email(),
    });
  }
  return users;
}

// Generate mock collections
export function generateCollections(
  count: number = 100,
  users: User[]
): Collection[] {
  const collections: Collection[] = [];
  const categories = [
    'Rare Coins',
    'Vintage Watches',
    'Art Pieces',
    'Antique Furniture',
    'Classic Cars',
    'Trading Cards',
    'Stamps',
    'Jewelry',
    'Books',
    'Wine Collection',
  ];

  for (let i = 0; i < count; i++) {
    const createdAt = faker.date.past({ years: 2 });
    collections.push({
      id: `collection-${i + 1}`,
      name: `${faker.helpers.arrayElement(categories)} #${faker.number.int({ min: 1000, max: 9999 })}`,
      description: faker.commerce.productDescription(),
      stock: faker.number.int({ min: 1, max: 100 }),
      price: parseFloat(
        faker.commerce.price({ min: 100, max: 10000, dec: 2 })
      ),
      ownerId: faker.helpers.arrayElement(users).id,
      createdAt: createdAt.toISOString(),
      updatedAt: faker.date
        .between({ from: createdAt, to: new Date() })
        .toISOString(),
    });
  }
  return collections;
}

// Generate mock bids for collections
export function generateBids(
  collections: Collection[],
  users: User[],
  bidsPerCollection: number = 10
): Bid[] {
  const bids: Bid[] = [];
  let bidCounter = 1;

  collections.forEach((collection) => {
    // Get users excluding the owner
    const potentialBidders = users.filter(
      (user) => user.id !== collection.ownerId
    );

    for (let i = 0; i < bidsPerCollection; i++) {
      const createdAt = faker.date.between({
        from: new Date(collection.createdAt),
        to: new Date(),
      });

      // Random status with weighted distribution
      const statusRandom = Math.random();
      let status: 'pending' | 'accepted' | 'rejected';
      if (statusRandom < 0.7) {
        status = 'pending'; // 70% pending
      } else if (statusRandom < 0.8) {
        status = 'accepted'; // 10% accepted
      } else {
        status = 'rejected'; // 20% rejected
      }

      // Ensure only one bid is accepted per collection
      const existingAcceptedBid = bids.find(
        (b) => b.collectionId === collection.id && b.status === 'accepted'
      );
      if (existingAcceptedBid && status === 'accepted') {
        status = 'pending';
      }

      // Bid price varies around the collection price
      const priceVariation = faker.number.float({
        min: 0.7,
        max: 1.5,
        fractionDigits: 2,
      });
      const bidPrice = parseFloat(
        (collection.price * priceVariation).toFixed(2)
      );

      bids.push({
        id: `bid-${bidCounter}`,
        collectionId: collection.id,
        price: bidPrice,
        userId: faker.helpers.arrayElement(potentialBidders).id,
        status,
        createdAt: createdAt.toISOString(),
        updatedAt: faker.date
          .between({ from: createdAt, to: new Date() })
          .toISOString(),
      });

      bidCounter++;
    }
  });

  return bids;
}

// Initialize and export mock data
export const mockUsers = generateUsers(10);
export const mockCollections = generateCollections(100, mockUsers);
export const mockBids = generateBids(mockCollections, mockUsers, 10);

// Helper function to get user by id
export function getUserById(userId: string): User | undefined {
  return mockUsers.find((user) => user.id === userId);
}

// Helper function to get collection by id
export function getCollectionById(
  collectionId: string
): Collection | undefined {
  return mockCollections.find((col) => col.id === collectionId);
}

// Helper function to get bids by collection id
export function getBidsByCollectionId(collectionId: string): Bid[] {
  return mockBids.filter((bid) => bid.collectionId === collectionId);
}

// Helper function to get bids by user id
export function getBidsByUserId(userId: string): Bid[] {
  return mockBids.filter((bid) => bid.userId === userId);
}
