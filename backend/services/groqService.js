import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MODEL = 'llama-3.3-70b-versatile';

/**
 * Score a company's intent to buy outbound/sales services
 */
export async function scoreCompanyIntent(companyData) {
  const prompt = `You are an expert sales intelligence analyst. Analyze this company and score their likelihood (0-100) of needing outbound sales support, appointment-setting services, or SDR infrastructure.

Company Data:
${JSON.stringify(companyData, null, 2)}

Scoring criteria:
- Recent funding (Series A/B): +25 pts
- Actively hiring SDRs/sales roles: +30 pts  
- Rapid growth signals: +20 pts
- Early-stage startup: +15 pts
- Tech/SaaS company: +10 pts
- No sales team yet: +15 pts
- Social media growth discussions: +10 pts

Respond with ONLY valid JSON (no markdown, no explanation):
{
  "intentScore": <number 0-100>,
  "intentLabel": "<Hot|Warm|Cold>",
  "aiSummary": "<2-3 sentence summary of why this company is/isn't a good prospect>",
  "keySignals": ["<signal1>", "<signal2>"],
  "recommendedAction": "<specific next step for sales outreach>"
}`;

  try {
    const response = await groq.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 500,
    });

    const content = response.choices[0].message.content.trim();
    // Strip markdown code blocks if present
    const clean = content.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(clean);
  } catch (err) {
    console.error('Groq scoring error:', err.message);
    return {
      intentScore: 40,
      intentLabel: 'Warm',
      aiSummary: 'Unable to generate AI analysis. Manual review recommended.',
      keySignals: [],
      recommendedAction: 'Review company profile manually',
    };
  }
}

/**
 * Enrich a company from raw signal text
 */
export async function enrichCompanyFromText(rawText, source) {
  const prompt = `You are a sales intelligence data extractor. Extract company information from this text.

Source: ${source}
Text: "${rawText}"

Extract and return ONLY valid JSON (no markdown):
{
  "companyName": "<name or null>",
  "website": "<url or null>",
  "industry": "<industry or null>",
  "size": "<1-10|11-50|51-200|201-500|500+|Unknown>",
  "stage": "<Pre-seed|Seed|Series A|Series B|Series C+|Public|Unknown>",
  "location": "<city, country or null>",
  "description": "<one sentence description>",
  "fundingAmount": "<amount or null>",
  "fundingRound": "<round name or null>",
  "signals": [
    {
      "type": "<funding|hiring|expansion|growth|social|keyword>",
      "description": "<what was detected>"
    }
  ],
  "tags": ["<tag1>", "<tag2>"]
}`;

  try {
    const response = await groq.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 600,
    });

    const content = response.choices[0].message.content.trim();
    const clean = content.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(clean);
  } catch (err) {
    console.error('Groq enrichment error:', err.message);
    return null;
  }
}

/**
 * Generate a batch of realistic mock leads using AI
 */
export async function generateMockLeads(count = 10, filters = {}) {
  const industryFilter = filters.industry ? `Focus on ${filters.industry} companies.` : '';
  const prompt = `Generate ${count} realistic B2B company leads for a sales intelligence platform. These should be companies that would benefit from outbound sales support or SDR services. ${industryFilter}

Return ONLY a valid JSON array (no markdown, no explanation):
[
  {
    "companyName": "<realistic company name>",
    "website": "<realistic website url>",
    "industry": "<specific industry>",
    "size": "<1-10|11-50|51-200|201-500|500+>",
    "stage": "<Pre-seed|Seed|Series A|Series B|Series C+|Public>",
    "location": "<City, Country>",
    "description": "<2 sentence company description>",
    "fundingAmount": "<dollar amount or null>",
    "fundingRound": "<round or null>",
    "linkedinUrl": "<linkedin url>",
    "signals": [
      {
        "type": "<funding|hiring|expansion|growth|social|keyword>",
        "description": "<specific signal detected>"
      }
    ],
    "tags": ["<tag1>", "<tag2>", "<tag3>"],
    "contacts": [
      {
        "name": "<realistic name>",
        "title": "<title like VP Sales, CEO>",
        "email": "<realistic email>",
        "linkedin": "<linkedin url>"
      }
    ]
  }
]

Make each company distinct with varied industries (SaaS, FinTech, HealthTech, E-commerce, AgriTech, EdTech, etc). Include realistic signals showing why each company needs outbound sales help.`;

  try {
    const response = await groq.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 4000,
    });

    const content = response.choices[0].message.content.trim();
    const clean = content.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(clean);
  } catch (err) {
    console.error('Groq mock leads error:', err.message);
    return [];
  }
}

/**
 * Chat with AI about a specific lead
 */
export async function chatAboutLead(lead, userMessage, history = []) {
  const systemPrompt = `You are LeadIQ, an AI sales intelligence assistant. You're analyzing this company:

${JSON.stringify(lead, null, 2)}

Help the sales team understand this lead, suggest outreach strategies, draft messages, and answer questions about the company. Be specific, actionable, and concise.`;

  const messages = [
    ...history,
    { role: 'user', content: userMessage },
  ];

  try {
    const response = await groq.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      temperature: 0.7,
      max_tokens: 800,
    });

    return response.choices[0].message.content;
  } catch (err) {
    console.error('Groq chat error:', err.message);
    return 'Sorry, I encountered an error. Please try again.';
  }
}
