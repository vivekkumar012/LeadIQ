import express from 'express';
import Lead from '../models/Lead.js';
import { chatAboutLead, scoreCompanyIntent } from '../services/groqService.js';

const router = express.Router();

// GET /api/leads - list with filters, sort, pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = '-intentScore',
      status,
      intentLabel,
      industry,
      stage,
      search,
      minScore,
      maxScore,
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (intentLabel) filter.intentLabel = intentLabel;
    if (industry) filter.industry = new RegExp(industry, 'i');
    if (stage) filter.stage = stage;
    if (minScore || maxScore) {
      filter.intentScore = {};
      if (minScore) filter.intentScore.$gte = Number(minScore);
      if (maxScore) filter.intentScore.$lte = Number(maxScore);
    }
    if (search) {
      filter.$or = [
        { companyName: new RegExp(search, 'i') },
        { industry: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
      ];
    }

    const total = await Lead.countDocuments(filter);
    const leads = await Lead.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    res.json({
      leads,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        limit: Number(limit),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/leads/:id
router.get('/:id', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/leads - create manually
router.post('/', async (req, res) => {
  try {
    const lead = new Lead(req.body);
    // Auto-score with AI
    const scoring = await scoreCompanyIntent({
      companyName: lead.companyName,
      industry: lead.industry,
      stage: lead.stage,
      size: lead.size,
      signals: lead.signals,
      description: lead.description,
    });
    lead.intentScore = scoring.intentScore;
    lead.intentLabel = scoring.intentLabel;
    lead.aiSummary = scoring.aiSummary;
    await lead.save();
    res.status(201).json(lead);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/leads/:id
router.patch('/:id', async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!lead) return res.status(404).json({ error: 'Lead not found' });
    res.json(lead);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/leads/:id
router.delete('/:id', async (req, res) => {
  try {
    await Lead.findByIdAndDelete(req.params.id);
    res.json({ message: 'Lead deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/leads/:id/rescore - re-run AI scoring
router.post('/:id/rescore', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    const scoring = await scoreCompanyIntent(lead.toObject());
    lead.intentScore = scoring.intentScore;
    lead.intentLabel = scoring.intentLabel;
    lead.aiSummary = scoring.aiSummary;
    await lead.save();
    res.json(lead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/leads/:id/chat - AI chat about lead
router.post('/:id/chat', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).lean();
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    const { message, history } = req.body;
    const reply = await chatAboutLead(lead, message, history || []);
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/leads/export/csv
router.get('/export/csv', async (req, res) => {
  try {
    const leads = await Lead.find({}).lean();
    const headers = ['Company', 'Website', 'Industry', 'Size', 'Stage', 'Intent Score', 'Label', 'Status', 'Location', 'Summary'];
    const rows = leads.map(l => [
      l.companyName, l.website, l.industry, l.size, l.stage,
      l.intentScore, l.intentLabel, l.status, l.location, l.aiSummary
    ].map(v => `"${(v || '').toString().replace(/"/g, '""')}"`).join(','));

    const csv = [headers.join(','), ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="leads.csv"');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
