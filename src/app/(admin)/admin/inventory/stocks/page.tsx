'use client';

import React, { useEffect, useState } from 'react';
import { getProductionBatches } from '@/app/actions/production';
import { getSales } from '@/app/actions/sales';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layers, Warehouse, TrendingUp, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function StockLevelsPage() {
  const [loading, setLoading] = useState(true);
  const [stockDetails, setStockDetails] = useState({
    totalProduced: 0,
    totalSold: 0,
    currentStock: 0,
  });
  const [lowStockThreshold, setLowStockThreshold] = useState(5000);
  const [tempThreshold, setTempThreshold] = useState('5000');
  const [savingThreshold, setSavingThreshold] = useState(false);

  useEffect(() => {
    async function loadStock() {
      try {
        const [batches, sales, settingsRes] = await Promise.all([
          getProductionBatches(),
          getSales(),
          fetch('/api/settings').then(r => r.ok ? r.json() : null).catch(() => null)
        ]);

        const totalProduced = batches.reduce((sum: number, b: any) => sum + b.totalProducedQty, 0);
        
        let totalSold = 0;
        sales.forEach((sale: any) => {
          sale.items.forEach((item: any) => {
            const isBag = item.productType === 'bag' || (!item.productType && item.productName?.toLowerCase().includes('bag'));
            if (isBag) {
              totalSold += item.quantity;
            }
          });
        });

        setStockDetails({
          totalProduced,
          totalSold,
          currentStock: Math.max(0, totalProduced - totalSold),
        });

        const threshold = settingsRes?.lowStockThreshold ?? 5000;
        setLowStockThreshold(threshold);
        setTempThreshold(String(threshold));
      } catch (err: any) {
        toast.error('Failed to calculate stocks: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
    loadStock();
  }, []);

  const handleSaveThreshold = async () => {
    const val = parseInt(tempThreshold);
    if (isNaN(val) || val < 0) {
      toast.error('Please enter a valid stock number');
      return;
    }

    try {
      setSavingThreshold(true);
      const resGet = await fetch('/api/settings');
      const currentSettings = resGet.ok ? await resGet.json() : {};
      
      const payload = {
        ...currentSettings,
        lowStockThreshold: val,
      };

      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setLowStockThreshold(val);
        toast.success(`Low stock threshold updated to ${val.toLocaleString()} bags.`);
      } else {
        throw new Error('Failed to update settings');
      }
    } catch (err: any) {
      toast.error('Failed to update threshold: ' + err.message);
    } finally {
      setSavingThreshold(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-muted-foreground">Calculating warehouse inventory...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Live Inventory Levels</h1>
        <p className="text-muted-foreground">Monitor warehouse silage bag stocks and storage utilization</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-primary/20 bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cumulative Production</CardTitle>
            <Layers className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {stockDetails.totalProduced.toLocaleString()} Bags
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total Silage bags fermented</p>
          </CardContent>
        </Card>

        <Card className="border-zinc-100 bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cumulative Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-800">
              {stockDetails.totalSold.toLocaleString()} Bags
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total Silage bags shipped</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/10 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Current Stock Reserve</CardTitle>
            <Warehouse className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {stockDetails.currentStock.toLocaleString()} Bags
            </div>
            <p className="text-xs text-muted-foreground mt-1">Net bags available for order</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-primary flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Warehouse className="h-5 w-5 text-primary" /> Warehouse Inventory Status
            </span>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-primary">Alert Limit:</label>
              <input
                type="number"
                value={tempThreshold}
                onChange={(e) => setTempThreshold(e.target.value)}
                className="w-24 h-8 px-2 border border-primary/20 rounded text-xs outline-none focus:ring-1 focus:ring-primary bg-white"
              />
              <button
                onClick={handleSaveThreshold}
                disabled={savingThreshold}
                className="bg-primary hover:bg-primary/90 text-white font-semibold text-xs px-2.5 py-1.5 rounded disabled:opacity-50"
              >
                {savingThreshold ? 'Saving...' : 'Set'}
              </button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span>Silo Storage Capacity (Max 50,000 Bags)</span>
              <span>{stockDetails.currentStock.toLocaleString()} / 50,000 Bags ({((stockDetails.currentStock / 50000) * 100).toFixed(1)}%)</span>
            </div>
            <div className="w-full bg-zinc-100 rounded-full h-3">
              <div className="bg-primary h-3 rounded-full" style={{ width: `${Math.min(100, (stockDetails.currentStock / 50000) * 100)}%` }}></div>
            </div>
          </div>

          {stockDetails.currentStock < lowStockThreshold && (
            <div className="p-4 bg-destructive/10 rounded-lg flex items-start gap-3 border border-destructive/20 text-destructive animate-pulse">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">Low Stock Alert!</h4>
                <p className="text-xs">Storage levels are below {lowStockThreshold.toLocaleString()} bags. Schedule Maize procurement and silage batch fermentation soon.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
