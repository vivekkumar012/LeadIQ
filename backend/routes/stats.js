import express from 'express';
import Lead from '../models/Lead.js';

const router = express.Router();

// GET /api/stats/overview
router.get('/overview', async (req, res) => {
  try {
    const [
      total,
      hot,
      warm,
      cold,
      newLeads,
      byStatus,
      byIndustry,
      avgScore,
      recentLeads,
      byStage,
    ] = await Promise.all([
      Lead.countDocuments(),
      Lead.countDocuments({ intentLabel: 'Hot' }),
      Lead.countDocuments({ intentLabel: 'Warm' }),
      Lead.countDocuments({ intentLabel: 'Cold' }),
      Lead.countDocuments({ status: 'New' }),
      Lead.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Lead.aggregate([
        { $group: { _id: '$industry', count: { $sum: 1 }, avgScore: { $avg: '$intentScore' } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),
      Lead.aggregate([{ $group: { _id: null, avg: { $avg: '$intentScore' } } }]),
      Lead.find({ status: 'New', intentLabel: 'Hot' })
        .sort('-intentScore')
        .limit(5)
        .lean(),
      Lead.aggregate([{ $group: { _id: '$stage', count: { $sum: 1 } } }]),
    ]);

    // Signal type breakdown
    const signalAgg = await Lead.aggregate([
      { $unwind: '$signals' },
      { $group: { _id: '$signals.type', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      totals: {
        all: total,
        hot,
        warm,
        cold,
        new: newLeads,
      },
      avgIntentScore: avgScore[0]?.avg?.toFixed(1) || 0,
      byStatus,
      byIndustry,
      byStage,
      signalBreakdown: signalAgg,
      topLeads: recentLeads,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
