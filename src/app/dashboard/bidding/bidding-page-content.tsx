'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { CollectionCard } from '@/components/bidding/collection-card';
import { CollectionFormModal } from '@/components/bidding/collection-form-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Filter } from 'lucide-react';
import { getCollectionsWithDetails } from '@/app/actions/collections';
import { getCurrentUser } from '@/app/actions/users';
import type { CollectionWithDetails, User } from '@/types/bidding';
import { toast } from 'sonner';

export function BiddingPageContent() {
  const [collections, setCollections] = useState<CollectionWithDetails[]>([]);
  const [filteredCollections, setFilteredCollections] = useState<
    CollectionWithDetails[]
  >([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [ownerFilter, setOwnerFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cancellingBids, setCancellingBids] = useState<Set<string>>(new Set());
  const [acceptingBids, setAcceptingBids] = useState<Set<string>>(new Set());
  const [placingBidForCollection, setPlacingBidForCollection] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);
  const loadingRef = useRef(false);

  const loadData = useCallback(async (silent = false) => {
    // Prevent concurrent loads
    if (loadingRef.current) return;
    loadingRef.current = true;

    if (!silent) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      const [collectionsData, userData] = await Promise.all([
        getCollectionsWithDetails(),
        getCurrentUser(),
      ]);
      setCollections(collectionsData);
      setCurrentUser(userData);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      loadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    // Prevent double load in React StrictMode and Clerk re-renders
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isLoading) {
      filterCollections();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collections, searchQuery, statusFilter, ownerFilter, isLoading]);

  // Clean up accepting bids state when bids are no longer pending or don't exist
  useEffect(() => {
    if (acceptingBids.size > 0) {
      const stillAccepting = new Set<string>();
      acceptingBids.forEach(bidId => {
        // Check if this bid still exists and is pending
        const bidExists = collections.some(c =>
          c.bids.some(b => b.id === bidId && b.status === 'pending')
        );
        if (bidExists) {
          stillAccepting.add(bidId);
        }
      });
      if (stillAccepting.size !== acceptingBids.size) {
        setAcceptingBids(stillAccepting);
      }
    }
  }, [collections, acceptingBids]);

  // Clean up placing bid state when user bid appears in collection
  useEffect(() => {
    if (placingBidForCollection && currentUser) {
      const collection = collections.find(c => c.id === placingBidForCollection);
      if (collection) {
        const userHasBid = collection.bids.some(b => b.userId === currentUser.id);
        if (userHasBid) {
          setPlacingBidForCollection(null);
        }
      }
    }
  }, [collections, placingBidForCollection, currentUser]);

  const filterCollections = () => {
    let filtered = [...collections];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter === 'sold') {
      filtered = filtered.filter((c) =>
        c.bids.some((bid) => bid.status === 'accepted')
      );
    } else if (statusFilter === 'available') {
      filtered = filtered.filter(
        (c) => !c.bids.some((bid) => bid.status === 'accepted')
      );
    }

    // Owner filter
    if (ownerFilter === 'mine' && currentUser) {
      filtered = filtered.filter((c) => c.ownerId === currentUser.id);
    } else if (ownerFilter === 'others' && currentUser) {
      filtered = filtered.filter((c) => c.ownerId !== currentUser.id);
    } else if (ownerFilter === 'my-bids' && currentUser) {
      filtered = filtered.filter((c) =>
        c.bids.some((bid) => bid.userId === currentUser.id)
      );
    }

    setFilteredCollections(filtered);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-12 w-full animate-pulse rounded-lg bg-muted" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Refreshing Indicator */}
      {isRefreshing && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg border bg-background px-4 py-2 shadow-lg">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-sm font-medium">Updating...</span>
        </div>
      )}

      {/* Header Actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search collections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
            </SelectContent>
          </Select>
          <Select value={ownerFilter} onValueChange={setOwnerFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Owner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Collections</SelectItem>
              <SelectItem value="mine">My Collections</SelectItem>
              <SelectItem value="my-bids">My Bids</SelectItem>
              <SelectItem value="others">Others</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Collection
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border p-4">
          <p className="text-sm font-medium text-muted-foreground">
            Total Collections
          </p>
          <p className="text-2xl font-bold">{collections.length}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm font-medium text-muted-foreground">
            My Collections
          </p>
          <p className="text-2xl font-bold">
            {collections.filter((c) => c.ownerId === currentUser.id).length}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm font-medium text-muted-foreground">My Bids</p>
          <p className="text-2xl font-bold">
            {collections.reduce(
              (acc, c) =>
                acc + c.bids.filter((b) => b.userId === currentUser.id).length,
              0
            )}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm font-medium text-muted-foreground">
            Available
          </p>
          <p className="text-2xl font-bold">
            {
              collections.filter(
                (c) => !c.bids.some((bid) => bid.status === 'accepted')
              ).length
            }
          </p>
        </div>
      </div>

      {/* Collections Grid */}
      <div className="space-y-4">
        {filteredCollections.length > 0 ? (
          filteredCollections.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              currentUserId={currentUser.id}
              onRefresh={() => loadData(true)}
              cancellingBids={cancellingBids}
              setCancellingBids={setCancellingBids}
              acceptingBids={acceptingBids}
              setAcceptingBids={setAcceptingBids}
              placingBidForCollection={placingBidForCollection}
              setPlacingBidForCollection={setPlacingBidForCollection}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
            <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
              <h3 className="mt-4 text-lg font-semibold">
                No collections found
              </h3>
              <p className="mb-4 mt-2 text-sm text-muted-foreground">
                {searchQuery || statusFilter !== 'all' || ownerFilter !== 'all'
                  ? 'Try adjusting your filters to find what you are looking for.'
                  : 'Get started by creating your first collection.'}
              </p>
              {!searchQuery &&
                statusFilter === 'all' &&
                ownerFilter === 'all' && (
                  <Button onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Collection
                  </Button>
                )}
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <CollectionFormModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        currentUserId={currentUser.id}
        onSuccess={() => loadData(true)}
      />
    </div>
  );
}
