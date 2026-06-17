import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  name: String,
  title: String,
  email: String,
  linkedin: String,
});

const signalSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['funding', 'hiring', 'expansion', 'growth', 'social', 'keyword'],
  },
  description: String,
  detectedAt: { type: Date, default: Date.now },
  source: String,
});

const leadSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true },
    website: String,
    industry: String,
    size: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '500+', 'Unknown'],
      default: 'Unknown',
    },
    stage: {
      type: String,
      enum: ['Pre-seed', 'Seed', 'Series A', 'Series B', 'Series C+', 'Public', 'Unknown'],
      default: 'Unknown',
    },
    location: String,
    description: String,
    intentScore: { type: Number, min: 0, max: 100, default: 0 },
    intentLabel: {
      type: String,
      enum: ['Hot', 'Warm', 'Cold'],
      default: 'Cold',
    },
    signals: [signalSchema],
    contacts: [contactSchema],
    aiSummary: String,
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Qualified', 'Disqualified', 'Converted'],
      default: 'New',
    },
    tags: [String],
    fundingAmount: String,
    fundingRound: String,
    linkedinUrl: String,
    twitterUrl: String,
    logoUrl: String,
    scannedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

leadSchema.index({ intentScore: -1 });
leadSchema.index({ companyName: 'text', industry: 'text', description: 'text' });

export default mongoose.model('Lead', leadSchema);
