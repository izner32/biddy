'use server';

import { db } from '@/lib/db-service';
import type { User } from '@/types/bidding';
import { currentUser } from '@clerk/nextjs/server';

export async function getUsers(): Promise<User[]> {
  return await db.getUsers();
}

export async function getUserById(id: string): Promise<User | null> {
  const user = await db.getUserById(id);
  return user || null;
}

// Get current user from Clerk authentication
export async function getCurrentUser(): Promise<User> {
  const clerkUser = await currentUser();

  if (clerkUser) {
    // Check if user already exists in database
    const existingUser = await db.getUserByClerkId(clerkUser.id);

    if (existingUser) {
      return existingUser;
    }

    // Create new user in database if doesn't exist
    const newUser = await db.createUser({
      name: clerkUser.fullName || clerkUser.firstName || 'User',
      email: clerkUser.emailAddresses[0]?.emailAddress || 'user@example.com',
      clerkId: clerkUser.id,
    });

    return newUser;
  }

  // Fallback to first user if no Clerk user (shouldn't happen in practice)
  const users = await db.getUsers();
  if (users.length === 0) {
    throw new Error('No users found in database. Please run database seed.');
  }
  return users[0];
}
