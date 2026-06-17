import express from 'express';
import Lead from '../models/Lead.js';
import { generateMockLeads, scoreCompanyIntent } from '../services/groqService.js';

const router = express.Router();

// POST /api/scan/discover - AI-powered lead discovery
router.post('/discover', async (req, res) => {
  try {
    const { count = 10, industry, signalType } = req.body;

    // Generate leads using AI (simulating signal-based discovery)
    const rawLeads = await generateMockLeads(count, { industry, signalType });

    if (!rawLeads || rawLeads.length === 0) {
      return res.status(500).json({ error: 'Failed to generate leads' });
    }

    const savedLeads = [];

    for (const raw of rawLeads) {
      try {
        // Check if company already exists
        const existing = await Lead.findOne({
          companyName: new RegExp(`^${raw.companyName}$`, 'i'),
        });
        if (existing) continue;

        // AI scoring
        const scoring = await scoreCompanyIntent(raw);

        const lead = new Lead({
          ...raw,
          intentScore: scoring.intentScore,
          intentLabel: scoring.intentLabel,
          aiSummary: scoring.aiSummary,
          scannedAt: new Date(),
        });

        await lead.save();
        savedLeads.push(lead);
      } catch (e) {
        console.error('Error saving lead:', e.message);
      }
    }

    res.json({
      message: `Discovered and scored ${savedLeads.length} new leads`,
      leads: savedLeads,
      count: savedLeads.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/scan/enrich/:id - Re-enrich a specific lead
router.post('/enrich/:id', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    const scoring = await scoreCompanyIntent(lead.toObject());
    lead.intentScore = scoring.intentScore;
    lead.intentLabel = scoring.intentLabel;
    lead.aiSummary = scoring.aiSummary;
    lead.scannedAt = new Date();
    await lead.save();

    res.json({ message: 'Lead enriched', lead });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/scan/bulk-score - re-score all leads
router.post('/bulk-score', async (req, res) => {
  try {
    const leads = await Lead.find({});
    let updated = 0;

    for (const lead of leads) {
      const scoring = await scoreCompanyIntent(lead.toObject());
      lead.intentScore = scoring.intentScore;
      lead.intentLabel = scoring.intentLabel;
      lead.aiSummary = scoring.aiSummary;
      await lead.save();
      updated++;
    }

    res.json({ message: `Re-scored ${updated} leads` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/scan/from-text - extract company from raw text/paste
router.post('/from-text', async (req, res) => {
  try {
    const { text, source = 'manual' } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });

    const { enrichCompanyFromText, scoreCompanyIntent } = await import('../services/groqService.js');
    const enriched = await enrichCompanyFromText(text, source);

    if (!enriched || !enriched.companyName) {
      return res.status(400).json({ error: 'Could not extract company data from text' });
    }

    const scoring = await scoreCompanyIntent(enriched);

    const lead = new Lead({
      ...enriched,
      intentScore: scoring.intentScore,
      intentLabel: scoring.intentLabel,
      aiSummary: scoring.aiSummary,
    });

    await lead.save();
    res.status(201).json({ message: 'Lead created from text', lead });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
