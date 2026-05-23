/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import { getSales } from '@/app/actions/sales';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Calendar, Search, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export default function SalesPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    await Promise.resolve();
    try {
      setLoading(true);
      const list = await getSales();
      setSales(list);
    } catch (err: any) {
      toast.error('Failed to load sales: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDownloadInvoice = async (sale: any) => {
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');

      const doc = new jsPDF();

      // Header
      doc.setFontSize(20);
      doc.setTextColor(16, 185, 129); // emerald-500
      doc.text('SHAFA AGRO FARM', 14, 20);
      
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text('Livestock Silage Production & Distribution', 14, 25);
      doc.text('Phone: +880 1700-000000 | Email: contact@shafaagro.com', 14, 29);

      // Invoice info
      doc.setFontSize(11);
      doc.setTextColor(50, 50, 50);
      doc.text(`Invoice No: ${sale.invoiceNumber}`, 140, 20);
      doc.text(`Date: ${new Date(sale.date).toLocaleDateString()}`, 140, 25);
      doc.text(`Payment: ${sale.paymentMethod.toUpperCase()}`, 140, 30);

      doc.setDrawColor(200, 200, 200);
      doc.line(14, 35, 196, 35);

      // Buyer Info
      doc.setFontSize(11);
      doc.text('BILL TO:', 14, 43);
      doc.setFont('helvetica', 'bold');
      const buyerName = sale.buyerType === 'dealer' 
        ? sale.buyerId?.userId?.name || 'Dealer'
        : sale.buyerId?.name || 'Farmer';
      doc.text(buyerName, 14, 48);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      if (sale.buyerType === 'dealer') {
        doc.text(`Shop Name: ${sale.buyerId?.shopName || 'N/A'}`, 14, 53);
        doc.text(`District: ${sale.buyerId?.address?.district || 'N/A'}`, 14, 57);
      } else {
        doc.text(`Phone: ${sale.buyerId?.phone || 'N/A'}`, 14, 53);
        doc.text(`Address: ${sale.buyerId?.address?.village || 'N/A'}, ${sale.buyerId?.address?.district || 'N/A'}`, 14, 57);
      }

      // Items Table
      const headers = [['Product Item', 'Qty', 'Unit Price (BDT)', 'Total (BDT)']];
      const data = sale.items.map((item: any) => [
        item.productName,
        item.quantity,
        `৳${item.unitPrice.toLocaleString()}`,
        `৳${item.totalPrice.toLocaleString()}`
      ]);

      autoTable(doc, {
        startY: 65,
        head: headers,
        body: data,
        theme: 'striped',
        headStyles: { fillColor: [4, 120, 87] }, // emerald-700
        styles: { fontSize: 9 },
      });

      // Totals
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Subtotal:`, 130, finalY);
      doc.text(`৳${sale.subtotal.toLocaleString()}`, 170, finalY, { align: 'right' });

      doc.text(`Discount:`, 130, finalY + 5);
      doc.text(`৳${sale.discount.toLocaleString()}`, 170, finalY + 5, { align: 'right' });

      if (sale.commissionApplied > 0) {
        doc.text(`Dealer Commission:`, 130, finalY + 10);
        doc.text(`৳${sale.commissionApplied.toLocaleString()}`, 170, finalY + 10, { align: 'right' });
      }

      doc.setFont('helvetica', 'bold');
      doc.text(`Grand Total:`, 130, finalY + 16);
      doc.text(`৳${sale.grandTotal.toLocaleString()}`, 170, finalY + 16, { align: 'right' });

      doc.setFont('helvetica', 'normal');
      doc.text(`Paid Amount:`, 130, finalY + 22);
      doc.text(`৳${sale.paidAmount.toLocaleString()}`, 170, finalY + 22, { align: 'right' });

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(190, 24, 74); // rose-700
      doc.text(`Due Balance:`, 130, finalY + 28);
      doc.text(`৳${sale.dueAmount.toLocaleString()}`, 170, finalY + 28, { align: 'right' });

      doc.save(`invoice_${sale.invoiceNumber}.pdf`);
      toast.success('Invoice PDF downloaded!');
    } catch (err: any) {
      toast.error('Failed to generate PDF: ' + err.message);
    }
  };

  const filteredSales = sales.filter((sale) => {
    const term = searchTerm.toLowerCase();
    const buyerName = sale.buyerType === 'dealer'
      ? (sale.buyerId?.userId?.name || '').toLowerCase()
      : (sale.buyerId?.name || '').toLowerCase();
    const shopName = (sale.buyerId?.shopName || '').toLowerCase();
    return (
      sale.invoiceNumber.toLowerCase().includes(term) ||
      buyerName.includes(term) ||
      shopName.includes(term) ||
      sale.distributionDistrict.toLowerCase().includes(term)
    );
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Sales & Invoice Ledger</h1>
          <p className="text-muted-foreground">Monitor distribution orders, printing invoices, and tracking buyer receivables</p>
        </div>
      </div>

      <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2">
          <CardTitle className="text-lg font-semibold text-primary flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" /> Sales Orders
          </CardTitle>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search Invoice / Buyer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 border-primary/20 h-9 bg-background/50"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-10 text-muted-foreground">Loading sales ledger...</div>
          ) : filteredSales.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">No invoices matching search criteria.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Grand Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Logistics</TableHead>
                    <TableHead className="text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.map((sale) => {
                    const buyerName = sale.buyerType === 'dealer'
                      ? sale.buyerId?.userId?.name || 'Dealer'
                      : sale.buyerId?.name || 'Farmer';
                    return (
                      <TableRow key={sale._id}>
                        <TableCell className="font-bold text-xs text-zinc-900">{sale.invoiceNumber}</TableCell>
                        <TableCell className="whitespace-nowrap font-medium text-xs">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {new Date(sale.date).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs">
                          <span className="font-semibold">{buyerName}</span>
                          <span className="block text-[10px] text-muted-foreground uppercase">{sale.buyerType}</span>
                        </TableCell>
                        <TableCell className="text-xs max-w-[200px] truncate">
                          {sale.items.map((it: any) => `${it.productName} (x${it.quantity})`).join(', ')}
                        </TableCell>
                        <TableCell className="font-bold text-xs text-primary">৳{sale.grandTotal.toLocaleString()}</TableCell>
                        <TableCell>
                          {sale.paymentStatus === 'paid' && (
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">Paid</Badge>
                          )}
                          {sale.paymentStatus === 'partially-paid' && (
                            <Badge variant="outline" className="bg-secondary/50 text-secondary-foreground border-secondary/20 hover:bg-secondary/60">Partial ({sale.paidAmount})</Badge>
                          )}
                          {sale.paymentStatus === 'unpaid' && (
                            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20">Unpaid</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 text-primary/70" />
                            {sale.distributionDistrict}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button size="sm" variant="outline" onClick={() => handleDownloadInvoice(sale)} className="border-primary/30 text-primary hover:bg-primary/10 h-7 text-xs">
                            <Download className="h-3.5 w-3.5 mr-1" /> Invoice
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
