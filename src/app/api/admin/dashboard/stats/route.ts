import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectToDatabase from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !(['admin', 'super_admin', 'manager', 'staff'].includes((session?.user as any)?.role))) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const defaultFrom = new Date();
    defaultFrom.setDate(defaultFrom.getDate() - 30);
    const defaultTo = new Date();

    let startDate = defaultFrom;
    if (from) {
      const parsedFrom = new Date(from);
      if (!isNaN(parsedFrom.getTime())) startDate = parsedFrom;
    }

    let endDate = defaultTo;
    if (to) {
      const parsedTo = new Date(to);
      if (!isNaN(parsedTo.getTime())) endDate = parsedTo;
    }
    endDate.setHours(23, 59, 59, 999);

    await connectToDatabase();

    // Dynamically import models to avoid issues if some don't exist yet
    let Sale: any = null;
    let LedgerTransaction: any = null;
    let ProductionBatch: any = null;
    let Employee: any = null;
    let Dealer: any = null;
    let Farmer: any = null;

    try { Sale = (await import('@/models/Sale')).default; } catch {}
    try { LedgerTransaction = (await import('@/models/LedgerTransaction')).default; } catch {}
    try { ProductionBatch = (await import('@/models/ProductionBatch')).default; } catch {}
    try { Employee = (await import('@/models/Employee')).default; } catch {}
    try { Dealer = (await import('@/models/Dealer')).default; } catch {}
    try { Farmer = (await import('@/models/Farmer')).default; } catch {}

    // === KPI STATS ===

    // 1. Total Silage Sales Revenue (in date range)
    let totalSalesRevenue = 0;
    let salesCount = 0;
    let totalDueAmount = 0;
    let recentSales: any[] = [];
    let topDealers: any[] = [];
    let salesChartData: any[] = [];

    if (Sale) {
      const salesStats = await Sale.aggregate([
        { $match: { date: { $gte: startDate, $lte: endDate } } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$grandTotal' },
            totalDue: { $sum: '$dueAmount' },
            count: { $sum: 1 }
          }
        }
      ]);
      totalSalesRevenue = salesStats[0]?.totalRevenue || 0;
      totalDueAmount = salesStats[0]?.totalDue || 0;
      salesCount = salesStats[0]?.count || 0;

      // Recent sales (last 6)
      recentSales = await Sale.find({ date: { $gte: startDate, $lte: endDate } })
        .sort({ date: -1 })
        .limit(6)
        .select('invoiceNumber buyerType grandTotal paidAmount dueAmount paymentStatus date distributionDistrict');

      // Top dealers by sales
      topDealers = await Sale.aggregate([
        { $match: { buyerType: 'dealer', date: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: '$buyerId', totalSales: { $sum: '$grandTotal' }, count: { $sum: 1 } } },
        { $sort: { totalSales: -1 } },
        { $limit: 5 }
      ]);

      // Daily chart data for sales
      salesChartData = await Sale.aggregate([
        { $match: { date: { $gte: startDate, $lte: endDate } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            revenue: { $sum: '$grandTotal' },
            salesCount: { $sum: 1 },
            collected: { $sum: '$paidAmount' }
          }
        },
        { $project: { _id: 0, date: '$_id', revenue: 1, salesCount: 1, collected: 1 } },
        { $sort: { date: 1 } }
      ]);
    }

    // 2. Cash & Bank Ledger Summary
    let cashBalance = 0;
    let bankBalance = 0;
    let totalIncome = 0;
    let totalExpenses = 0;
    let netProfit = 0;
    let recentTransactions: any[] = [];

    if (LedgerTransaction) {
      const cashStats = await LedgerTransaction.aggregate([
        { $match: { date: { $gte: startDate, $lte: endDate }, source: 'cash' } },
        {
          $group: {
            _id: '$type',
            total: { $sum: '$amount' }
          }
        }
      ]);
      const bankStats = await LedgerTransaction.aggregate([
        { $match: { date: { $gte: startDate, $lte: endDate }, source: 'bank' } },
        {
          $group: {
            _id: '$type',
            total: { $sum: '$amount' }
          }
        }
      ]);

      cashStats.forEach((s: any) => {
        if (s._id === 'income') cashBalance += s.total;
        else if (s._id === 'expense') cashBalance -= s.total;
      });
      bankStats.forEach((s: any) => {
        if (s._id === 'income') bankBalance += s.total;
        else if (s._id === 'expense') bankBalance -= s.total;
      });

      // Income vs Expense summary
      const allTxStats = await LedgerTransaction.aggregate([
        { $match: { date: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: '$type', total: { $sum: '$amount' } } }
      ]);
      allTxStats.forEach((s: any) => {
        if (s._id === 'income') totalIncome += s.total;
        else if (s._id === 'expense') totalExpenses += s.total;
      });
      netProfit = totalIncome - totalExpenses;

      // Recent transactions
      recentTransactions = await LedgerTransaction.find({ date: { $gte: startDate, $lte: endDate } })
        .sort({ date: -1 })
        .limit(6)
        .select('date type source category amount description');
    }

    // 3. Production Batches in range
    let totalProducedQty = 0;
    let batchCount = 0;
    let recentBatches: any[] = [];

    if (ProductionBatch) {
      const prodStats = await ProductionBatch.aggregate([
        { $match: { productionDate: { $gte: startDate, $lte: endDate } } },
        {
          $group: {
            _id: null,
            totalQty: { $sum: '$totalProducedQty' },
            count: { $sum: 1 }
          }
        }
      ]);
      totalProducedQty = prodStats[0]?.totalQty || 0;
      batchCount = prodStats[0]?.count || 0;
      recentBatches = await ProductionBatch.find({ productionDate: { $gte: startDate, $lte: endDate } })
        .sort({ productionDate: -1 })
        .limit(5)
        .select('batchNumber totalProducedQty productionCostPerUnit productionDate warehouseLocation');
    }

    // 4. Employees count
    let totalEmployees = 0;
    if (Employee) {
      totalEmployees = await Employee.countDocuments({});
    }

    // 5. Active Dealers
    let activeDealers = 0;
    let totalDealerDues = 0;
    if (Dealer) {
      activeDealers = await Dealer.countDocuments({});
      const dealerDuesStats = await Dealer.aggregate([
        { $group: { _id: null, totalDues: { $sum: '$currentDues' } } }
      ]);
      totalDealerDues = dealerDuesStats[0]?.totalDues || 0;
    }

    // 6. Total Farmers
    let totalFarmers = 0;
    let totalFarmerDues = 0;
    if (Farmer) {
      totalFarmers = await Farmer.countDocuments({});
      const farmerDuesStats = await Farmer.aggregate([
        { $group: { _id: null, totalDues: { $sum: '$currentDues' } } }
      ]);
      totalFarmerDues = farmerDuesStats[0]?.totalDues || 0;
    }

    return NextResponse.json({
      stats: {
        totalSalesRevenue,
        salesCount,
        cashBalance,
        bankBalance,
        totalIncome,
        totalExpenses,
        netProfit,
        totalDueAmount: totalDueAmount + totalDealerDues + totalFarmerDues,
        totalProducedQty,
        batchCount,
        totalEmployees,
        activeDealers,
        totalFarmers,
      },
      recentSales,
      recentTransactions,
      recentBatches,
      topDealers,
      salesChartData,
    });
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
