'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { CreditCard, Download, Check } from 'lucide-react';
import { format } from 'date-fns';

interface PaymentMethod {
  id: string;
  type: 'visa' | 'mastercard' | 'amex';
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  description: string;
  invoiceUrl: string;
}

interface Subscription {
  plan: string;
  status: 'active' | 'cancelled' | 'past_due';
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate: string;
  amount: number;
}

export default function BillingPageContent() {
  const [subscription] = useState<Subscription>({
    plan: 'Pro',
    status: 'active',
    billingCycle: 'monthly',
    nextBillingDate: '2025-12-01',
    amount: 29.99
  });

  const [paymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'visa',
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true
    },
    {
      id: '2',
      type: 'mastercard',
      last4: '5555',
      expiryMonth: 6,
      expiryYear: 2026,
      isDefault: false
    }
  ]);

  const [invoices] = useState<Invoice[]>([
    {
      id: 'INV-001',
      date: '2025-11-01',
      amount: 29.99,
      status: 'paid',
      description: 'Biddy Pro - November 2025',
      invoiceUrl: '#'
    },
    {
      id: 'INV-002',
      date: '2025-10-01',
      amount: 29.99,
      status: 'paid',
      description: 'Biddy Pro - October 2025',
      invoiceUrl: '#'
    },
    {
      id: 'INV-003',
      date: '2025-09-01',
      amount: 29.99,
      status: 'paid',
      description: 'Biddy Pro - September 2025',
      invoiceUrl: '#'
    }
  ]);

  const getCardIcon = (type: string) => {
    return <CreditCard className="h-4 w-4" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'active':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'failed':
      case 'cancelled':
      case 'past_due':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
        <p className="text-muted-foreground">
          Manage your subscription and payment methods
        </p>
      </div>

      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <CardTitle>Current Subscription</CardTitle>
          <CardDescription>
            You are currently on the {subscription.plan} plan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold">{subscription.plan} Plan</h3>
                <Badge variant={getStatusColor(subscription.status)}>
                  {subscription.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Billed {subscription.billingCycle}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">
                ${subscription.amount}
                <span className="text-sm font-normal text-muted-foreground">
                  /{subscription.billingCycle === 'monthly' ? 'mo' : 'yr'}
                </span>
              </p>
              <p className="text-sm text-muted-foreground">
                Next billing: {format(new Date(subscription.nextBillingDate), 'MMM d, yyyy')}
              </p>
            </div>
          </div>

          <div className="rounded-lg border p-4 space-y-2">
            <h4 className="font-semibold">Plan includes:</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500" />
                Unlimited collections
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500" />
                Unlimited bids
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500" />
                Priority support
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500" />
                Advanced analytics
              </li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button variant="outline">Change Plan</Button>
            <Button variant="outline" className="text-destructive">
              Cancel Subscription
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Manage your payment methods
              </CardDescription>
            </div>
            <Button>Add Payment Method</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-3">
                  {getCardIcon(method.type)}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {method.type.charAt(0).toUpperCase() + method.type.slice(1)} ending in {method.last4}
                      </p>
                      {method.isDefault && (
                        <Badge variant="secondary">Default</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Expires {method.expiryMonth}/{method.expiryYear}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!method.isDefault && (
                    <Button variant="outline" size="sm">
                      Set as Default
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive">
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>
            View and download your past invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.id}</TableCell>
                    <TableCell>
                      {format(new Date(invoice.date), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>{invoice.description}</TableCell>
                    <TableCell className="font-semibold">
                      ${invoice.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
