/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { getDealerDashboardSummary } from '@/app/actions/dealer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function DealerInvoices() {
  const { data: session } = useSession();
  const [sales, setSales] = useState<any[]>([]);
  const [dealer, setDealer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    await Promise.resolve(); // Defer state updates to avoid synchronous setState warning in useEffect
    if (!session?.user?.id) return;
    try {
      setLoading(true);
      const res = await getDealerDashboardSummary((session.user as any).id);
      setSales(res.recentSales);
      setDealer(res.dealer);
    } catch (err: any) {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [session]);

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
      doc.text(session?.user?.name || 'Dealer', 14, 48);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Shop Name: ${dealer?.shopName || 'N/A'}`, 14, 53);
      doc.text(`District: ${dealer?.address?.district || 'N/A'}`, 14, 57);

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

      if (sale.commissionApplied > 0) {
        doc.text(`Dealer Commission:`, 130, finalY + 5);
        doc.text(`৳${sale.commissionApplied.toLocaleString()}`, 170, finalY + 5, { align: 'right' });
      }

      doc.setFont('helvetica', 'bold');
      doc.text(`Grand Total:`, 130, finalY + 11);
      doc.text(`৳${sale.grandTotal.toLocaleString()}`, 170, finalY + 11, { align: 'right' });

      doc.setFont('helvetica', 'normal');
      doc.text(`Paid Amount:`, 130, finalY + 17);
      doc.text(`৳${sale.paidAmount.toLocaleString()}`, 170, finalY + 17, { align: 'right' });

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(190, 24, 74); // rose-700
      doc.text(`Due Balance:`, 130, finalY + 23);
      doc.text(`৳${sale.dueAmount.toLocaleString()}`, 170, finalY + 23, { align: 'right' });

      doc.save(`invoice_${sale.invoiceNumber}.pdf`);
      toast.success('Invoice PDF downloaded!');
    } catch (err: any) {
      toast.error('Failed to generate PDF: ' + err.message);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-muted-foreground">Loading your invoices...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-primary">My Invoices & Statements</h1>
        <p className="text-sm text-muted-foreground">Download formal PDF invoices and review outstanding due entries</p>
      </div>

      <Card className="border-primary/10 bg-card/70">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-primary flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" /> Account Invoices
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sales.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-xs">No invoices on record.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items Ordered</TableHead>
                    <TableHead>Subtotal</TableHead>
                    <TableHead>Commission Applied</TableHead>
                    <TableHead>Grand Total</TableHead>
                    <TableHead>Amount Paid</TableHead>
                    <TableHead>Dues Logged</TableHead>
                    <TableHead className="text-center font-semibold">Invoice Receipt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((sale) => (
                    <TableRow key={sale._id}>
                      <TableCell className="font-bold text-xs text-zinc-900">{sale.invoiceNumber}</TableCell>
                      <TableCell className="whitespace-nowrap font-medium text-xs">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {new Date(sale.date).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs max-w-[200px] truncate">
                        {sale.items.map((it: any) => `${it.productName} (x${it.quantity})`).join(', ')}
                      </TableCell>
                      <TableCell className="text-xs font-semibold">৳{sale.subtotal.toLocaleString()}</TableCell>
                      <TableCell className="text-xs font-semibold text-primary">-৳{sale.commissionApplied.toLocaleString()}</TableCell>
                      <TableCell className="text-xs font-bold text-primary">৳{sale.grandTotal.toLocaleString()}</TableCell>
                      <TableCell className="text-xs font-bold text-zinc-700">৳{sale.paidAmount.toLocaleString()}</TableCell>
                      <TableCell className="text-xs font-bold text-rose-700">৳{sale.dueAmount.toLocaleString()}</TableCell>
                      <TableCell className="text-center">
                        <Button size="sm" variant="outline" onClick={() => handleDownloadInvoice(sale)} className="border-primary/10 text-primary hover:bg-primary/5 h-7 text-xs">
                          <Download className="h-3.5 w-3.5 mr-1" /> PDF Invoice
                        </Button>
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
  );
}
