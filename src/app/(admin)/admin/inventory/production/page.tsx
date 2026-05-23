'use client';

import React, { useEffect, useState } from 'react';
import { getProductionBatches, logProductionBatch } from '@/app/actions/production';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Layers, Plus, Trash2, Calendar, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

interface RawMaterial {
  materialName: string;
  quantity: number;
  cost: number;
}

export default function ProductionPage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [materials, setMaterials] = useState<RawMaterial[]>([
    { materialName: 'Raw Maize / Corn Stalk', quantity: 1000, cost: 7500 },
    { materialName: 'Molasses / Bio-inoculants', quantity: 50, cost: 2500 }
  ]);
  const [totalProducedQty, setTotalProducedQty] = useState('');
  const [warehouseLocation, setWarehouseLocation] = useState('Warehouse A - Silo 1');

  const loadData = async () => {
    await Promise.resolve();
    try {
      setLoading(true);
      const list = await getProductionBatches();
      setBatches(list);
    } catch (err: any) {
      toast.error('Failed to load production batches: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddMaterial = () => {
    setMaterials([...materials, { materialName: '', quantity: 0, cost: 0 }]);
  };

  const handleRemoveMaterial = (index: number) => {
    if (materials.length === 1) return;
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const handleUpdateMaterial = (index: number, field: keyof RawMaterial, value: any) => {
    const updated = [...materials];
    if (field === 'quantity') {
      updated[index].quantity = parseFloat(value) || 0;
    } else if (field === 'cost') {
      updated[index].cost = parseFloat(value) || 0;
    } else {
      updated[index].materialName = value;
    }
    setMaterials(updated);
  };

  const totalRawCost = materials.reduce((sum, m) => sum + m.cost, 0);
  const qtyProducedVal = parseFloat(totalProducedQty) || 0;
  const costPerUnit = qtyProducedVal > 0 ? (totalRawCost / qtyProducedVal) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (materials.some(m => !m.materialName || m.quantity <= 0 || m.cost <= 0)) {
      toast.error('Please enter valid details for all raw materials');
      return;
    }

    if (qtyProducedVal <= 0) {
      toast.error('Total produced quantity must be greater than 0');
      return;
    }

    const confirmResult = await Swal.fire({
      title: 'Log Production Batch?',
      text: `Total produced quantity: ${qtyProducedVal} bags at a cost of ৳${costPerUnit.toFixed(2)} per bag.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: 'var(--color-primary, #10b981)',
      confirmButtonText: 'Yes, log batch'
    });

    if (!confirmResult.isConfirmed) return;

    try {
      setSubmitting(true);
      const res = await logProductionBatch({
        rawMaterialsUsed: materials,
        totalProducedQty: qtyProducedVal,
        warehouseLocation,
      });

      if (res.success) {
        toast.success(`Production batch logged successfully!`);
        // Reset form
        setMaterials([
          { materialName: 'Raw Maize / Corn Stalk', quantity: 1000, cost: 7500 },
          { materialName: 'Molasses / Bio-inoculants', quantity: 50, cost: 2500 }
        ]);
        setTotalProducedQty('');
        loadData();
      }
    } catch (err: any) {
      toast.error('Failed to log batch: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Silage Production Tracking</h1>
        <p className="text-muted-foreground">Log fresh fermentation batches, summarize raw material expenses, and review unit costs</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Production Batch Logger */}
        <Card className="lg:col-span-6 border-primary/10 bg-white/70">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-primary flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" /> Start Production Batch
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Materials list */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="text-sm font-bold text-primary">Raw Ingredients / Materials Used</h3>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddMaterial} className="border-primary/20 text-primary h-8">
                    <Plus className="h-4 w-4 mr-1" /> Add Ingredient
                  </Button>
                </div>

                {materials.map((mat, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end bg-zinc-50 p-2.5 rounded-lg border border-zinc-100">
                    <div className="md:col-span-5">
                      <label className="text-[10px] font-semibold text-muted-foreground mb-0.5 block">Ingredient Name</label>
                      <Input
                        value={mat.materialName}
                        onChange={(e) => handleUpdateMaterial(index, 'materialName', e.target.value)}
                        placeholder="e.g. Corn Stalk"
                        className="border-primary/10 h-8 text-xs"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="text-[10px] font-semibold text-muted-foreground mb-0.5 block">Qty (kg/tons)</label>
                      <Input
                        type="number"
                        value={mat.quantity || ''}
                        onChange={(e) => handleUpdateMaterial(index, 'quantity', e.target.value)}
                        placeholder="0"
                        className="border-primary/10 h-8 text-xs"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="text-[10px] font-semibold text-muted-foreground mb-0.5 block">Cost (BDT)</label>
                      <Input
                        type="number"
                        value={mat.cost || ''}
                        onChange={(e) => handleUpdateMaterial(index, 'cost', e.target.value)}
                        placeholder="0.00"
                        className="border-primary/10 h-8 text-xs"
                      />
                    </div>
                    <div className="md:col-span-1 text-center">
                      <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveMaterial(index)} className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Outputs Summary */}
              <div className="border-t pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-primary block mb-1">Produced Silage Bags (40kg)</label>
                    <Input
                      type="number"
                      placeholder="e.g. 500"
                      value={totalProducedQty}
                      onChange={(e) => setTotalProducedQty(e.target.value)}
                      className="border-primary/10"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-primary block mb-1">Warehouse Silo Location</label>
                    <Input
                      placeholder="e.g. Silo 1"
                      value={warehouseLocation}
                      onChange={(e) => setWarehouseLocation(e.target.value)}
                      className="border-primary/10"
                      required
                    />
                  </div>
                </div>

                <div className="bg-zinc-50 p-3 rounded-lg grid grid-cols-2 gap-2 text-xs border border-zinc-100">
                  <span className="text-muted-foreground">Total Material Cost:</span>
                  <span className="font-semibold text-right text-zinc-700">৳{totalRawCost.toLocaleString()}</span>
                  <span className="text-muted-foreground">Cost per Silage Bag:</span>
                  <span className="font-bold text-right text-primary">৳{costPerUnit.toFixed(2)}</span>
                </div>
              </div>

              <Button type="submit" disabled={submitting} className="w-full bg-primary hover:bg-primary/95 text-white font-semibold">
                {submitting ? 'Logging Batch...' : 'Log Production Batch'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* History of Production */}
        <Card className="lg:col-span-6 border-primary/10 bg-white/70">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-primary flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" /> Historical Batches
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-10 text-muted-foreground">Loading production batches...</div>
            ) : batches.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">No production batches recorded.</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Batch ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right font-semibold">Quantity</TableHead>
                      <TableHead className="text-right font-semibold">Unit Cost</TableHead>
                      <TableHead>Location</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {batches.map((b) => (
                      <TableRow key={b._id}>
                        <TableCell className="font-bold text-xs text-zinc-900">{b.batchNumber}</TableCell>
                        <TableCell className="whitespace-nowrap font-medium text-xs">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {new Date(b.productionDate).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-bold text-xs text-primary">{b.totalProducedQty} bags</TableCell>
                        <TableCell className="text-right font-bold text-xs text-zinc-700">৳{b.productionCostPerUnit.toFixed(2)}/bag</TableCell>
                        <TableCell className="text-xs">
                          <Badge variant="secondary" className="bg-zinc-100 text-zinc-700 border-zinc-200">{b.warehouseLocation}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
