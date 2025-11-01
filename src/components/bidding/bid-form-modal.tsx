'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { createBid, updateBid } from '@/app/actions/bids';
import type { Bid, Collection } from '@/types/bidding';

const bidSchema = z.object({
  price: z.coerce.number().min(0.01, 'Bid price must be greater than 0'),
});

type BidFormValues = z.infer<typeof bidSchema>;

interface BidFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collection: Collection;
  bid?: Bid;
  currentUserId: string;
  onSuccess?: () => void;
}

export function BidFormModal({
  open,
  onOpenChange,
  collection,
  bid,
  currentUserId,
  onSuccess,
}: BidFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!bid;

  const form = useForm<BidFormValues>({
    resolver: zodResolver(bidSchema),
    defaultValues: {
      price: bid?.price || collection.price,
    },
  });

  // Reset form when bid or modal open state changes
  useEffect(() => {
    if (open) {
      form.reset({
        price: bid?.price || collection.price,
      });
    }
  }, [open, bid, collection.price, form]);

  const onSubmit = async (data: BidFormValues) => {
    setIsLoading(true);

    try {
      if (isEditing) {
        const result = await updateBid(bid.id, { price: data.price });
        if (result.success) {
          toast.success('Bid updated successfully');
          // Call onSuccess first to refresh data
          await onSuccess?.();
          // Then close modal after data is refreshed
          onOpenChange(false);
          form.reset();
        } else {
          toast.error(result.error || 'Failed to update bid');
        }
      } else {
        const result = await createBid({
          collectionId: collection.id,
          price: data.price,
          userId: currentUserId,
        });
        if (result.success) {
          toast.success('Bid placed successfully');
          // Call onSuccess first to refresh data
          await onSuccess?.();
          // Then close modal after data is refreshed
          onOpenChange(false);
          form.reset();
        } else {
          toast.error(result.error || 'Failed to place bid');
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Bid' : 'Place a Bid'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update your bid amount below.'
              : `Place your bid on "${collection.name}"`}
          </DialogDescription>
        </DialogHeader>
        <Form form={form} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Collection:</span>
                <span className="font-medium">{collection.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Base Price:</span>
                <span className="font-medium">
                  ${collection.price.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Stock Available:</span>
                <span className="font-medium">{collection.stock} units</span>
              </div>
            </div>

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Bid Amount ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="1000.00"
                      {...field}
                      disabled={isLoading}
                      className="text-lg"
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the amount you want to bid for this collection
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    {isEditing ? 'Updating...' : 'Placing...'}
                  </>
                ) : (
                  <>{isEditing ? 'Update Bid' : 'Place Bid'}</>
                )}
              </Button>
            </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
