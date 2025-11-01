'use client';

import { useState } from 'react';
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
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { createCollection, updateCollection } from '@/app/actions/collections';
import type { Collection } from '@/types/bidding';

const collectionSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  stock: z.coerce.number().min(1, 'Stock must be at least 1'),
  price: z.coerce.number().min(0.01, 'Price must be greater than 0'),
});

type CollectionFormValues = z.infer<typeof collectionSchema>;

interface CollectionFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collection?: Collection;
  currentUserId: string;
  onSuccess?: () => void;
}

export function CollectionFormModal({
  open,
  onOpenChange,
  collection,
  currentUserId,
  onSuccess,
}: CollectionFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!collection;

  const form = useForm<CollectionFormValues>({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      name: collection?.name || '',
      description: collection?.description || '',
      stock: collection?.stock || 1,
      price: collection?.price || 0,
    },
  });

  const onSubmit = async (data: CollectionFormValues) => {
    setIsLoading(true);
    try {
      if (isEditing) {
        const result = await updateCollection(collection.id, data);
        if (result.success) {
          toast.success('Collection updated successfully');
          onOpenChange(false);
          form.reset();
          onSuccess?.();
        } else {
          toast.error(result.error || 'Failed to update collection');
        }
      } else {
        const result = await createCollection({
          ...data,
          ownerId: currentUserId,
        });
        if (result.success) {
          toast.success('Collection created successfully');
          onOpenChange(false);
          form.reset();
          onSuccess?.();
        } else {
          toast.error(result.error || 'Failed to create collection');
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Collection' : 'Create New Collection'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update your collection details below.'
              : 'Fill in the details to create a new collection.'}
          </DialogDescription>
        </DialogHeader>
        <Form form={form} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Rare Coins Collection"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your collection..."
                      className="resize-none"
                      rows={3}
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="10"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Price ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="1000.00"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
                {isLoading
                  ? isEditing
                    ? 'Updating...'
                    : 'Creating...'
                  : isEditing
                    ? 'Update Collection'
                    : 'Create Collection'}
              </Button>
            </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
