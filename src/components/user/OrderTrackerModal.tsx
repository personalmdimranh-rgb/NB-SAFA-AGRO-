'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  CheckCircle2, 
  Package, 
  Truck, 
  XCircle,
  FileText
} from 'lucide-react';

interface OrderTrackerModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  sale: any;
}

export default function OrderTrackerModal({ isOpen, onOpenChange, sale }: OrderTrackerModalProps) {
  if (!sale) return null;

  const statuses = [
    { key: 'pending', label: 'Order Placed', description: 'Order logged and awaiting review', icon: Clock },
    { key: 'approved', label: 'Approved', description: 'Order approved and confirmed', icon: CheckCircle2 },
    { key: 'ready to deliver', label: 'Ready', description: 'Silage bags packed and ready', icon: Package },
    { key: 'release to deliver', label: 'Dispatched', description: 'Order dispatched from warehouse', icon: Truck },
    { key: 'delivery complete', label: 'Delivered', description: 'Received successfully', icon: CheckCircle2 }
  ];

  const currentStatus = sale.status || 'pending';
  const isCanceled = currentStatus === 'cancel';
  
  // Find index of current status
  const currentIdx = statuses.findIndex(s => s.key === currentStatus);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white border border-zinc-100 rounded-2xl p-6 shadow-2xl">
        <DialogHeader className="space-y-1.5">
          <div className="flex justify-between items-center pr-6">
            <DialogTitle className="text-lg font-bold text-zinc-900">
              Order Tracking
            </DialogTitle>
            <Badge variant="outline" className="font-bold border-primary/20 text-primary bg-primary/5 uppercase text-[10px]">
              {sale.invoiceNumber}
            </Badge>
          </div>
          <DialogDescription className="text-xs text-zinc-500">
            Track real-time shipment and processing status for this invoice.
          </DialogDescription>
        </DialogHeader>

        {isCanceled ? (
          <div className="flex flex-col items-center justify-center py-6 space-y-2">
            <XCircle className="h-14 w-14 text-rose-500 animate-pulse" />
            <h3 className="font-bold text-zinc-950 text-base">Order Cancelled</h3>
            <p className="text-xs text-zinc-500 text-center px-4">
              This order request has been cancelled by administration or buyer request.
            </p>
          </div>
        ) : (
          <div className="py-6 space-y-6">
            {statuses.map((step, idx) => {
              const Icon = step.icon;
              const isCompleted = idx <= currentIdx;
              const isCurrent = idx === currentIdx;

              return (
                <div key={step.key} className="flex gap-4 relative">
                  {/* Connector Line */}
                  {idx < statuses.length - 1 && (
                    <div 
                      className={`absolute left-5 top-10 bottom-0 w-0.5 -translate-x-1/2 -z-10 h-[calc(100%+16px)] ${
                        idx < currentIdx ? 'bg-primary' : 'bg-zinc-200'
                      }`} 
                    />
                  )}

                  {/* Icon Node */}
                  <div 
                    className={`h-10 w-10 rounded-full flex items-center justify-center border-2 shrink-0 transition-all duration-300 ${
                      isCompleted 
                        ? 'bg-primary border-primary text-white shadow-md shadow-primary/20 scale-105' 
                        : 'bg-white border-zinc-200 text-zinc-400'
                    } ${isCurrent ? 'ring-4 ring-primary/20 animate-pulse' : ''}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Content */}
                  <div className="flex flex-col justify-center">
                    <h4 
                      className={`text-sm font-semibold leading-none ${
                        isCompleted ? 'text-zinc-900 font-bold' : 'text-zinc-400'
                      }`}
                    >
                      {step.label}
                    </h4>
                    <p 
                      className={`text-[11px] mt-1 ${
                        isCompleted ? 'text-zinc-500' : 'text-zinc-400'
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="border-t border-zinc-100 pt-4 flex flex-col gap-2.5">
          <div className="text-[11px] text-zinc-500 flex justify-between">
            <span>District: <strong className="text-zinc-800">{sale.distributionDistrict}</strong></span>
            <span>Date: <strong className="text-zinc-800">{new Date(sale.date).toLocaleDateString()}</strong></span>
          </div>
          <div className="text-[11px] text-zinc-500 flex justify-between">
            <span>Grand Total: <strong className="text-zinc-800">৳{(sale.grandTotal ?? 0).toLocaleString()} BDT</strong></span>
            <span>Dues Logged: <strong className="text-rose-700">৳{(sale.dueAmount ?? 0).toLocaleString()} BDT</strong></span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
