'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Plus,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Package,
  DollarSign,
  User,
} from 'lucide-react';
import type { CollectionWithDetails, BidWithUser } from '@/types/bidding';
import { CollectionFormModal } from './collection-form-modal';
import { BidFormModal } from './bid-form-modal';
import { deleteCollection } from '@/app/actions/collections';
import { acceptBid, deleteBid } from '@/app/actions/bids';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface CollectionCardProps {
  collection: CollectionWithDetails;
  currentUserId: string;
  onRefresh?: () => void;
  cancellingBids: Set<string>;
  setCancellingBids: React.Dispatch<React.SetStateAction<Set<string>>>;
  acceptingBids: Set<string>;
  setAcceptingBids: React.Dispatch<React.SetStateAction<Set<string>>>;
  placingBidForCollection: string | null;
  setPlacingBidForCollection: React.Dispatch<React.SetStateAction<string | null>>;
}

export function CollectionCard({
  collection,
  currentUserId,
  onRefresh,
  cancellingBids,
  setCancellingBids,
  acceptingBids,
  setAcceptingBids,
  placingBidForCollection,
  setPlacingBidForCollection,
}: CollectionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [editingBid, setEditingBid] = useState<BidWithUser | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = collection.ownerId === currentUserId;
  const userBid = collection.bids.find(
    (bid) => bid.userId === currentUserId && bid.status === 'pending'
  );
  const hasAcceptedBid = collection.bids.some((bid) => bid.status === 'accepted');

  const handleDeleteCollection = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteCollection(collection.id);
      if (result.success) {
        toast.success('Collection deleted successfully');
        setIsDeleteDialogOpen(false);
        onRefresh?.();
      } else {
        toast.error(result.error || 'Failed to delete collection');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAcceptBid = async (bidId: string) => {
    setAcceptingBids(prev => new Set(prev).add(bidId));
    try {
      const result = await acceptBid(collection.id, bidId);
      if (result.success) {
        toast.success('Bid accepted successfully');
        onRefresh?.();
        // Keep in accepting state - will be removed when bid status changes
      } else {
        toast.error(result.error || 'Failed to accept bid');
        setAcceptingBids(prev => {
          const next = new Set(prev);
          next.delete(bidId);
          return next;
        });
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      setAcceptingBids(prev => {
        const next = new Set(prev);
        next.delete(bidId);
        return next;
      });
    }
  };

  const handleDeleteBid = async (bidId: string) => {
    setCancellingBids(prev => new Set(prev).add(bidId));
    try {
      const result = await deleteBid(bidId);
      if (result.success) {
        toast.success('Bid cancelled successfully');
        onRefresh?.();
        // Keep in cancelling state - will be removed when bid is actually gone
      } else {
        toast.error(result.error || 'Failed to cancel bid');
        setCancellingBids(prev => {
          const next = new Set(prev);
          next.delete(bidId);
          return next;
        });
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      setCancellingBids(prev => {
        const next = new Set(prev);
        next.delete(bidId);
        return next;
      });
    }
  };

  const handleEditBid = (bid: BidWithUser) => {
    setEditingBid(bid);
    setIsBidModalOpen(true);
  };

  const getBidStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const highestBid = collection.bids.length > 0
    ? Math.max(...collection.bids.map((b) => b.price))
    : collection.price;

  return (
    <>
      <Card className="collection-card overflow-hidden hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold tracking-tight">
                  {collection.name}
                </h3>
                {hasAcceptedBid && (
                  <Badge variant="default" className="gap-1">
                    <Check className="h-3 w-3" />
                    Sold
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {collection.description}
              </p>
            </div>
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditModalOpen(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Collection Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <div className="rounded-full bg-primary/10 p-1.5">
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Base Price</p>
                <p className="font-semibold">${collection.price.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="rounded-full bg-blue-500/10 p-1.5">
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Highest Bid</p>
                <p className="font-semibold">${highestBid.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="rounded-full bg-green-500/10 p-1.5">
                <Package className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Stock</p>
                <p className="font-semibold">{collection.stock} units</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="rounded-full bg-purple-500/10 p-1.5">
                <User className="h-4 w-4 text-purple-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Owner</p>
                <p className="font-semibold truncate">
                  {collection.owner.name}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {!isOwner && !hasAcceptedBid && (
              <Button
                onClick={() => {
                  setEditingBid(userBid || null);
                  setIsBidModalOpen(true);
                }}
                className="flex-1"
                variant={userBid ? 'outline' : 'default'}
                disabled={placingBidForCollection === collection.id}
              >
                {placingBidForCollection === collection.id ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    {userBid ? 'Updating...' : 'Placing...'}
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    {userBid ? 'Update Bid' : 'Place Bid'}
                  </>
                )}
              </Button>
            )}
            <Collapsible
              open={isExpanded}
              onOpenChange={setIsExpanded}
              className="flex-1"
            >
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full">
                  {isExpanded ? (
                    <ChevronUp className="mr-2 h-4 w-4" />
                  ) : (
                    <ChevronDown className="mr-2 h-4 w-4" />
                  )}
                  {collection.bids.length} Bid
                  {collection.bids.length !== 1 ? 's' : ''}
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          </div>

          {/* Bids Table */}
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleContent>
              {collection.bids.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Bidder</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {collection.bids.map((bid) => {
                        // Show loading state if being cancelled
                        if (cancellingBids.has(bid.id) && bid.userId === currentUserId) {
                          return (
                            <TableRow key={bid.id} className="opacity-50 transition-opacity duration-300">
                              <TableCell className="font-medium">
                                {bid.user?.name || 'Unknown User'}
                                {bid.userId === currentUserId && (
                                  <Badge variant="outline" className="ml-2">
                                    You
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="font-semibold">
                                ${bid.price.toFixed(2)}
                              </TableCell>
                              <TableCell>
                                <Badge variant={getBidStatusColor(bid.status)}>
                                  {bid.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground text-sm">
                                {format(new Date(bid.createdAt), 'MMM d, yyyy')}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-destructive border-t-transparent" />
                                  <span className="text-sm text-muted-foreground">Removing...</span>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        }

                        return (
                          <TableRow key={bid.id}>
                            <TableCell className="font-medium">
                              {bid.user?.name || 'Unknown User'}
                              {bid.userId === currentUserId && (
                                <Badge variant="outline" className="ml-2">
                                  You
                                </Badge>
                              )}
                            </TableCell>
                          <TableCell className="font-semibold">
                            ${bid.price.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getBidStatusColor(bid.status)}>
                              {bid.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {format(new Date(bid.createdAt), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell className="text-right">
                            {isOwner && bid.status === 'pending' && (
                              <Button
                                size="sm"
                                onClick={() => handleAcceptBid(bid.id)}
                                disabled={hasAcceptedBid || acceptingBids.has(bid.id)}
                              >
                                {acceptingBids.has(bid.id) ? (
                                  <>
                                    <div className="mr-1 h-3 w-3 animate-spin rounded-full border-2 border-background border-t-transparent" />
                                    Accepting...
                                  </>
                                ) : (
                                  <>
                                    <Check className="mr-1 h-3 w-3" />
                                    Accept
                                  </>
                                )}
                              </Button>
                            )}
                            {!isOwner &&
                              bid.userId === currentUserId &&
                              bid.status === 'pending' && (
                                <div className="flex justify-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEditBid(bid)}
                                    disabled={cancellingBids.has(bid.id)}
                                  >
                                    <Edit className="mr-1 h-3 w-3" />
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDeleteBid(bid.id)}
                                    disabled={cancellingBids.has(bid.id)}
                                  >
                                    {cancellingBids.has(bid.id) ? (
                                      <>
                                        <div className="mr-1 h-3 w-3 animate-spin rounded-full border-2 border-background border-t-transparent" />
                                        Cancelling...
                                      </>
                                    ) : (
                                      <>
                                        <X className="mr-1 h-3 w-3" />
                                        Cancel
                                      </>
                                    )}
                                  </Button>
                                </div>
                              )}
                          </TableCell>
                        </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No bids yet. Be the first to place a bid!
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {/* Modals */}
      <CollectionFormModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        collection={collection}
        currentUserId={currentUserId}
        onSuccess={onRefresh}
      />

      <BidFormModal
        open={isBidModalOpen}
        onOpenChange={(open) => {
          setIsBidModalOpen(open);
          if (!open) {
            setPlacingBidForCollection(null);
          }
        }}
        collection={collection}
        bid={editingBid || undefined}
        currentUserId={currentUserId}
        onSuccess={async () => {
          setPlacingBidForCollection(collection.id);
          await onRefresh?.();
          // Keep in placing state - will be removed when bid appears
        }}
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Collection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{collection.name}&quot;? This action
              cannot be undone and will also delete all associated bids.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCollection}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
