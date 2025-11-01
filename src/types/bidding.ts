export interface User {
  id: string;
  name: string;
  email: string;
  clerkId?: string; // Optional Clerk integration
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  stock: number; // quantity
  price: number; // base price
  ownerId: string; // user who owns this collection
  createdAt: string;
  updatedAt: string;
}

export interface Bid {
  id: string;
  collectionId: string;
  price: number;
  userId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface CollectionWithBids extends Collection {
  bids: Bid[];
  owner: User;
}

export interface BidWithUser extends Bid {
  user?: User;
}

export interface CollectionWithDetails extends Collection {
  bids: BidWithUser[];
  owner: User;
}
