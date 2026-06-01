'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Pagination } from '@/components/ui/pagination';
import { getSales, deleteSale, togglePaymentStatus, updateSaleStatus } from '@/app/actions/sales';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { FileText, Download, Calendar, Search, MapPin, MoreVertical, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

export default function SalesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

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
      doc.text('Phone: +880 1711-583424 | Email: contact@nbsafaagro.com', 14, 29);

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
        ? sale.buyerId?.userId?.name || sale.buyerName || 'Dealer'
        : sale.buyerId?.name || sale.buyerName || 'Farmer';
      doc.text(buyerName, 14, 48);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      if (sale.buyerType === 'dealer') {
        doc.text(`Shop Name: ${sale.buyerId?.shopName || sale.shopName || 'N/A'}`, 14, 53);
        doc.text(`District: ${sale.buyerId?.address?.district || 'N/A'}`, 14, 57);
      } else {
        doc.text(`Phone: ${sale.buyerId?.phone || 'N/A'}`, 14, 53);
        doc.text(`Address: ${sale.buyerId?.address?.village || 'N/A'}, ${sale.buyerId?.address?.district || 'N/A'}`, 14, 57);
      }

      // Items Table
      const headers = [['Product Item', 'Qty', 'Unit Price', 'Total']];
      const data = sale.items.map((item: any) => [
        item.productName,
        item.quantity,
        `${item.unitPrice.toLocaleString()}`,
        `${item.totalPrice.toLocaleString()}`
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
      doc.text(`${sale.subtotal.toLocaleString()}`, 170, finalY, { align: 'right' });

      doc.text(`Discount:`, 130, finalY + 5);
      doc.text(`${sale.discount.toLocaleString()}`, 170, finalY + 5, { align: 'right' });

      if (sale.commissionApplied > 0) {
        doc.text(`Dealer Commission:`, 130, finalY + 10);
        doc.text(`${sale.commissionApplied.toLocaleString()}`, 170, finalY + 10, { align: 'right' });
      }

      doc.setFont('helvetica', 'bold');
      doc.text(`Grand Total:`, 130, finalY + 16);
      doc.text(`${sale.grandTotal.toLocaleString()}`, 170, finalY + 16, { align: 'right' });

      doc.setFont('helvetica', 'normal');
      doc.text(`Paid Amount:`, 130, finalY + 22);
      doc.text(`${sale.paidAmount.toLocaleString()}`, 170, finalY + 22, { align: 'right' });

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(190, 24, 74); // rose-700
      doc.text(`Due Balance:`, 130, finalY + 28);
      doc.text(`${sale.dueAmount.toLocaleString()}`, 170, finalY + 28, { align: 'right' });

      doc.save(`invoice_${sale.invoiceNumber}.pdf`);
      toast.success('Invoice PDF downloaded!');
    } catch (err: any) {
      toast.error('Failed to generate PDF: ' + err.message);
    }
  };

  const handleTogglePayment = async (sale: any) => {
    try {
      const res = await togglePaymentStatus(sale._id);
      if (res.success) {
        toast.success(`Invoice ${sale.invoiceNumber} payment status set to ${res.paymentStatus}!`);
        loadData();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to toggle payment status');
    }
  };

  const handleUpdateStatus = async (saleId: string, status: string) => {
    try {
      const res = await updateSaleStatus(saleId, status);
      if (res.success) {
        toast.success(`Order status updated to ${status}!`);
        loadData();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update order status');
    }
  };

  const handleDelete = async (sale: any) => {
    const result = await Swal.fire({
      title: 'Delete Invoice?',
      html: `<p class="text-sm text-gray-600">This will permanently delete invoice <strong>${sale.invoiceNumber}</strong> of <strong>${sale.grandTotal.toLocaleString()}</strong>.</p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Delete!',
    });
    if (!result.isConfirmed) return;
    try {
      await deleteSale(sale._id);
      toast.success(`Invoice ${sale.invoiceNumber} deleted.`);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete invoice');
    }
  };

  const filteredSales = sales.filter((sale) => {
    const term = searchTerm.toLowerCase();
    const buyerName = sale.buyerType === 'dealer'
      ? (sale.buyerId?.userId?.name || sale.buyerName || '').toLowerCase()
      : (sale.buyerId?.name || sale.buyerName || '').toLowerCase();
    const shopName = (sale.buyerId?.shopName || sale.shopName || '').toLowerCase();
    return (
      sale.invoiceNumber.toLowerCase().includes(term) ||
      buyerName.includes(term) ||
      shopName.includes(term) ||
      sale.distributionDistrict.toLowerCase().includes(term)
    );
  });

  const currentPage = parseInt(searchParams.get('page') || '1') || 1;
  const pageSize = 20;
  const totalPages = Math.ceil(filteredSales.length / pageSize) || 1;
  const paginatedSales = filteredSales.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
                    <TableHead className="w-[40px]">#</TableHead>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Grand Total</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Order Status</TableHead>
                    <TableHead>Logistics</TableHead>
                    <TableHead className="text-center w-[60px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSales.map((sale, index) => {
                    const buyerName = sale.buyerType === 'dealer'
                      ? sale.buyerId?.userId?.name || sale.buyerName || 'Dealer'
                      : sale.buyerId?.name || sale.buyerName || 'Farmer';
                    return (
                      <TableRow key={sale._id}>
                        <TableCell className="text-xs text-muted-foreground font-medium">{(currentPage - 1) * pageSize + index + 1}</TableCell>
                        <TableCell className="font-bold text-xs text-zinc-900">
                          <button
                            onClick={() => {
                              setSelectedSale(sale);
                              setIsDetailsOpen(true);
                            }}
                            className="hover:underline text-primary text-left font-bold focus:outline-none"
                          >
                            {sale.invoiceNumber}
                          </button>
                        </TableCell>
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
                        <TableCell className="font-bold text-xs text-primary">{sale.grandTotal.toLocaleString()}</TableCell>
                        <TableCell>
                          <button
                            onClick={() => handleTogglePayment(sale)}
                            className="transition-transform active:scale-95 duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
                            title="Click to toggle payment status"
                          >
                            {sale.paymentStatus === 'paid' && (
                              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 cursor-pointer">Paid</Badge>
                            )}
                            {sale.paymentStatus === 'partially-paid' && (
                              <Badge variant="outline" className="bg-secondary/50 text-secondary-foreground border-secondary/20 hover:bg-secondary/60 cursor-pointer">Partial ({sale.paidAmount})</Badge>
                            )}
                            {sale.paymentStatus === 'unpaid' && (
                              <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20 cursor-pointer">Unpaid</Badge>
                            )}
                          </button>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`capitalize ${
                            sale.status === 'delivery complete' ? 'bg-primary/10 text-primary border-primary/20' :
                            sale.status === 'cancel' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                            sale.status === 'pending' ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' :
                            'bg-blue-500/10 text-blue-600 border-blue-500/20'
                          }`}>
                            {sale.status || 'pending'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 text-primary/70" />
                            {sale.distributionDistrict}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-muted" id={`sale-action-${sale._id}`}>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem className="cursor-pointer text-xs gap-2" onClick={() => handleDownloadInvoice(sale)}>
                                <Download className="h-3.5 w-3.5 text-primary" />
                                <span>Download Invoice</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <div className="px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase">Change Order Status</div>
                              {['pending', 'approved', 'ready to deliver', 'release to deliver', 'delivery complete', 'cancel'].map((st) => (
                                <DropdownMenuItem
                                  key={st}
                                  className="cursor-pointer text-xs capitalize pl-4"
                                  onClick={() => handleUpdateStatus(sale._id, st)}
                                >
                                  <span className={`h-1.5 w-1.5 rounded-full mr-2 ${
                                    st === 'delivery complete' ? 'bg-primary' :
                                    st === 'cancel' ? 'bg-destructive' :
                                    st === 'pending' ? 'bg-yellow-500' : 'bg-blue-500'
                                  }`} />
                                  {st}
                                </DropdownMenuItem>
                              ))}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="cursor-pointer text-xs gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                                onClick={() => handleDelete(sale)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Delete Invoice</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
          {totalPages > 1 && (
            <div className="pt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => {
                  const params = new URLSearchParams(searchParams.toString());
                  if (page > 1) params.set('page', String(page));
                  else params.delete('page');
                  router.push(`${pathname}?${params.toString()}`);
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center justify-between">
              <span>Order Details - {selectedSale?.invoiceNumber}</span>
              <Badge variant="outline" className={`capitalize ${
                selectedSale?.status === 'delivery complete' ? 'bg-primary/10 text-primary border-primary/20' :
                selectedSale?.status === 'cancel' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                selectedSale?.status === 'pending' ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' :
                'bg-blue-500/10 text-blue-600 border-blue-500/20'
              }`}>
                {selectedSale?.status || 'pending'}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              Detailed view of the silage distribution order log.
            </DialogDescription>
          </DialogHeader>

          {selectedSale && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground block font-medium">Date</span>
                  <span className="font-semibold">{new Date(selectedSale.date).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block font-medium">Logistics/District</span>
                  <span className="font-semibold flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-primary/70" />
                    {selectedSale.distributionDistrict}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block font-medium">Payment Option</span>
                  <span className="font-semibold uppercase">{selectedSale.paymentMethod}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block font-medium">Payment Status</span>
                  <Badge variant="outline" className={`capitalize ${
                    selectedSale.paymentStatus === 'paid' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-destructive/10 text-destructive border-destructive/20'
                  }`}>
                    {selectedSale.paymentStatus}
                  </Badge>
                </div>
              </div>

              <div className="h-px bg-zinc-200 dark:bg-zinc-800" />

              <div>
                <span className="text-muted-foreground block text-xs font-medium mb-1">Customer / Buyer Details</span>
                <div className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 text-xs">
                  <div className="font-bold text-sm text-primary mb-1">
                    {selectedSale.buyerType === 'dealer'
                      ? selectedSale.buyerId?.userId?.name || selectedSale.buyerName || 'Dealer'
                      : selectedSale.buyerId?.name || selectedSale.buyerName || 'Farmer'}
                  </div>
                  <div className="text-muted-foreground uppercase text-[10px] tracking-wide mb-2">{selectedSale.buyerType}</div>
                  {selectedSale.buyerType === 'dealer' ? (
                    <div className="space-y-1">
                      <div>Shop Name: <span className="font-semibold text-zinc-950 dark:text-zinc-50">{selectedSale.buyerId?.shopName || selectedSale.shopName || 'N/A'}</span></div>
                      <div>District: <span className="font-semibold text-zinc-950 dark:text-zinc-50">{selectedSale.buyerId?.address?.district || 'N/A'}</span></div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div>Phone: <span className="font-semibold text-zinc-950 dark:text-zinc-50">{selectedSale.buyerId?.phone || 'N/A'}</span></div>
                      <div>Address: <span className="font-semibold text-zinc-950 dark:text-zinc-50">{selectedSale.buyerId?.address?.village || 'N/A'}, {selectedSale.buyerId?.address?.district || 'N/A'}</span></div>
                    </div>
                  )}
                </div>
              </div>

              <div className="h-px bg-zinc-200 dark:bg-zinc-800" />

              <div>
                <span className="text-muted-foreground block text-xs font-medium mb-2">Order Items</span>
                <div className="border border-zinc-100 dark:border-zinc-800 rounded-lg overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-zinc-50 dark:bg-zinc-900 font-semibold text-muted-foreground">
                      <tr>
                        <th className="p-2">Item</th>
                        <th className="p-2 text-center">Qty</th>
                        <th className="p-2 text-right">Unit Price</th>
                        <th className="p-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {selectedSale.items.map((item: any, i: number) => (
                        <tr key={i}>
                          <td className="p-2 font-medium">{item.productName}</td>
                          <td className="p-2 text-center">{item.quantity}</td>
                          <td className="p-2 text-right">{item.unitPrice.toLocaleString()}</td>
                          <td className="p-2 text-right font-bold">{item.totalPrice.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{selectedSale.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="font-medium text-destructive">-{selectedSale.discount.toLocaleString()}</span>
                </div>
                {selectedSale.commissionApplied > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dealer Commission</span>
                    <span className="font-medium text-primary">-{selectedSale.commissionApplied.toLocaleString()}</span>
                  </div>
                )}
                <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-1" />
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-primary">Grand Total</span>
                  <span className="text-primary">{selectedSale.grandTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Paid Amount</span>
                  <span>{selectedSale.paidAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-rose-700">
                  <span>Due Balance</span>
                  <span>{selectedSale.dueAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="sm:justify-between gap-2">
            <Button variant="outline" size="sm" disabled={!selectedSale} onClick={() => selectedSale && handleDownloadInvoice(selectedSale)}>
              <Download className="mr-2 h-4 w-4 text-primary" /> Download PDF
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setIsDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
