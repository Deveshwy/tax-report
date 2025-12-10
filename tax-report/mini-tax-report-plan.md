# Mini Tax Strategy Report - Complete Product Plan

## Executive Summary

A $47 front-end product that generates personalized 5-page tax strategy reports using LLM (Claude API). Users complete a short questionnaire (10-12 questions), and the system generates an actionable tax savings report tailored to their situation.

**Key Differentiators from Full Wealth Plan:**
- Focused specifically on tax strategies (not investing, debt, asset protection)
- 5 pages vs 30-50 pages
- 10-12 questions vs full intake form
- $47 vs high-ticket coaching
- Fully automated vs human review
- Entry point to full Legacy Wealth Blueprint program

---

## Part 1: Questionnaire Design

### Philosophy: Minimum Questions, Maximum Context

The goal is to collect enough information to:
1. Calculate their marginal tax rate (federal + state)
2. Determine which strategy tiers apply (1-6)
3. Match their business structure to applicable strategies
4. Assess risk tolerance for appropriate recommendations
5. Gauge time availability for implementation-heavy strategies

### The 12 Essential Questions

**Section A: Income & Location (For Tax Rate Calculation)**

**Q1. What is your total annual household income?**
- Under $75,000
- $75,000 - $150,000
- $150,000 - $250,000
- $250,000 - $400,000
- $400,000 - $750,000
- $750,000+

*Why: Determines federal marginal bracket and strategy tier eligibility*

**Q2. Which state do you live in?**
[Dropdown of all 50 states]

*Why: Determines state tax rate for combined marginal rate calculation*

---

**Section B: Income Sources (For Strategy Matching)**

**Q3. How do you primarily earn your income?** (Select all that apply)
- W-2 Employee (traditional job)
- Self-employed / Freelancer / 1099 Contractor
- Business owner (LLC, S-Corp, or C-Corp)
- Real estate investor
- Investment income (dividends, capital gains)
- Retired / Pension income

*Why: This is THE most important question - determines 80% of applicable strategies*

**Q4. If you have a business or side income, approximately how much NET PROFIT does it generate annually?**
- I don't have business/side income
- Under $30,000
- $30,000 - $60,000
- $60,000 - $100,000
- $100,000 - $200,000
- $200,000+

*Why: Determines S-Corp viability, Solo 401(k) maximization potential, QBI optimization*

---

**Section C: Current Tax Situation (For Gap Analysis)**

**Q5. Do you currently use any of these tax strategies?** (Select all that apply)
- Maximize retirement contributions (401k, IRA)
- Home office deduction
- Business vehicle deduction
- S-Corporation election
- Real estate depreciation
- HSA contributions
- None of the above
- I'm not sure

*Why: Avoids recommending what they already do; identifies gaps*

**Q6. What's your current filing status?**
- Single
- Married filing jointly
- Married filing separately
- Head of household

*Why: Affects tax brackets and some strategy eligibility (e.g., spouse hiring for Augusta Rule)*

---

**Section D: Assets & Opportunities (For Advanced Strategies)**

**Q7. Do you own your home?**
- Yes, I own my home
- No, I rent
- Other (vacation home only, etc.)

*Why: Enables Augusta Rule, home office (regular method), and mortgage interest optimization*

**Q8. Do you own or are you interested in owning rental/investment property?**
- Yes, I currently own rental property
- No, but I'm interested in the next 1-2 years
- No, not interested in real estate
- I own commercial property

*Why: Opens Tier 2-3 real estate strategies (cost seg, STR, REPS, 1031)*

---

**Section E: Lifestyle Factors (For Implementation Matching)**

**Q9. How much time can you realistically dedicate to implementing tax strategies per week?**
- Less than 1 hour
- 1-3 hours
- 3-5 hours
- 5-10 hours
- 10+ hours

*Why: Determines if REP status, STR management, or other time-intensive strategies are viable*

**Q10. What's your comfort level with tax strategies?**
- Conservative: I only want IRS-safe, well-established strategies
- Moderate: I'm comfortable with legitimate strategies that require professional guidance
- Aggressive: I want maximum savings and am willing to implement complex strategies

*Why: Determines tier depth and which strategies to emphasize/avoid*

---

**Section F: Goals & Specifics (For Personalization)**

**Q11. What's your PRIMARY tax goal?**
- Reduce my current year tax bill as much as possible
- Build tax-free retirement wealth (Roth strategies)
- Create ongoing tax deductions through real estate
- Optimize my business structure
- All of the above - comprehensive strategy

*Why: Allows prioritization in recommendations*

**Q12. Any specific situation we should know about?** (Optional - Short text field, 500 char max)
[Text field]
Placeholder: "E.g., Planning to sell a property, starting a new business, have significant capital gains, spouse doesn't work, etc."

*Why: Catches edge cases and personalizes recommendations*

---

## Part 2: System Prompt / Skill for Report Generation

### Mini Tax Strategy Report Generator Skill

```markdown
---
name: mini-tax-report-generator
description: Generates personalized 5-page tax strategy reports from questionnaire responses. Outputs professional HTML report with 3-5 actionable tax strategies tailored to user's income, business structure, and goals.
---

# Mini Tax Strategy Report Generator

## Purpose
Generate a concise, actionable 5-page tax strategy report based on user questionnaire responses. Focus on highest-ROI strategies that match the user's specific situation.

## Input Format
The user will provide questionnaire responses in this format:

```json
{
  "income_range": "$150,000 - $250,000",
  "state": "California",
  "income_sources": ["W-2 Employee", "Self-employed / Freelancer"],
  "business_profit": "$60,000 - $100,000",
  "current_strategies": ["Maximize retirement contributions"],
  "filing_status": "Married filing jointly",
  "owns_home": true,
  "real_estate_interest": "No, but I'm interested in the next 1-2 years",
  "time_available": "1-3 hours",
  "risk_tolerance": "Moderate",
  "primary_goal": "Reduce my current year tax bill as much as possible",
  "additional_context": "Planning to start an LLC for my consulting work"
}
```

## Step 1: Profile Analysis

### A. Calculate Marginal Tax Rate

**Federal Rates (2025):**
- $75K-$150K: 22-24%
- $150K-$250K: 24-32%
- $250K-$400K: 32-35%
- $400K-$750K: 35-37%
- $750K+: 37%

**State Tax Rates:**
- High-tax (CA 13.3%, NY 10.9%, NJ 10.75%): Add 9-13%
- Medium-tax (IL, MA, OR, MN): Add 5-7%
- Moderate (CO, NC, IN, MI): Add 3-5%
- Low/None (TX, FL, NV, WA, WY, TN, SD): Add 0%

**Combined Rate = Federal + State**

### B. Determine Strategy Tier Access

**Income-Based Tier Access:**
- <$75K: Tier 1 only (strategies 1-8)
- $75K-$150K: Tier 1 + selective Tier 2
- $150K-$250K: Tier 1-2, evaluate Tier 3
- $250K-$400K: Tier 1-3, evaluate Tier 4
- $400K+: Full menu

**Business Structure Tier Access:**
- W-2 Only: Strategies 5, 6, 7 only
- W-2 + Side Business: Add 1, 2, 3, 4, 8
- Self-Employed: Full Tier 1, S-Corp evaluation
- Business Owner: Tier 1-3
- Real Estate Investor: Tier 2-3 emphasis

### C. Risk-Based Filtering

- Conservative: Tier 1 only, established strategies
- Moderate: Tier 1-2, add selective Tier 3
- Aggressive: Tier 1-3, include complex strategies

### D. Time-Based Filtering

- <1 hr/week: Passive strategies only (retirement, HSA, W-4)
- 1-3 hrs: Add business admin strategies (S-Corp, home office)
- 3-5 hrs: Add moderate active strategies (Augusta Rule, accountable plan)
- 5-10 hrs: Real estate strategies become viable
- 10+ hrs: REP status strategies available

## Step 2: Strategy Selection

Select 3-5 strategies based on:

1. **Highest ROI** for their marginal rate
2. **Not already implemented** (check current_strategies)
3. **Matches business structure**
4. **Realistic for time availability**
5. **Within risk tolerance**

### Strategy Quick Reference

**Tier 1 Strategies (Foundational):**
| # | Strategy | Best For | Annual Value Range |
|---|----------|----------|-------------------|
| 1 | Home Office | Side biz/self-employed + owns home | $1,500-$5,000 |
| 2 | Augusta Rule | Biz owner + owns home | $4,000-$15,000 |
| 3 | Accountable Plan | Biz owner w/ employees | $2,000-$5,000/person |
| 4 | Vehicle Deduction | Biz use >50% | $2,000-$15,000 |
| 5 | Retirement Max | All w/ earned income | $7,000-$75,000 |
| 6 | Backdoor Roth | High income | $7,000-$69,000 |
| 7 | W-4 Optimization | All W-2 employees | +$4,000-$8,000 cash flow |
| 8 | S-Corporation | Self-employed >$60K profit | $3,000-$40,000 |

**Tier 2 Strategies (Real Estate):**
| # | Strategy | Best For | Annual Value Range |
|---|----------|----------|-------------------|
| 9 | Cost Segregation | RE investors w/ property | $50,000-$500,000 |
| 10 | REP Status | 750+ hours available | $25,000-$100,000+ |
| 11 | Short-Term Rental | Willing to manage STR | $15,000-$200,000 |
| 12 | 1031 Exchange | Selling property | Defer $50K-$200K+ |

**Tier 3 Strategies (Business):**
| # | Strategy | Best For | Annual Value Range |
|---|----------|----------|-------------------|
| 13 | QBI Optimization | Pass-through income | $6,000-$75,000 |
| 14 | Multiple Entities | Multiple income streams | $10,000-$150,000 |
| 15 | State Domicile | Willing to relocate | $15,000-$500,000 |

### ROI Calculation

For each selected strategy:
```
Tax Savings = Deduction Amount × Combined Marginal Rate

Example:
- Strategy: Solo 401(k) Max ($69,000)
- Combined Rate: 37% (CA high income)
- Tax Savings: $69,000 × 37% = $25,530
```

## Step 3: Generate Report

### Report Structure (5 Pages)

**Page 1: Executive Summary**
- Personalized greeting
- Current tax situation snapshot
- Total potential savings headline
- Top 3 strategies preview

**Page 2: Your Tax Profile**
- Income analysis
- Current marginal rate (federal + state breakdown)
- Strategy tier qualification
- Gap analysis (what you're missing)

**Page 3-4: Your Recommended Strategies**
- Strategy 1: [Name]
  - What it is (2-3 sentences)
  - Why it fits you (1-2 sentences)
  - Estimated annual savings: $X,XXX - $X,XXX
  - Implementation difficulty: Easy/Moderate/Complex
  - Quick start: [One action to take this week]

- Strategy 2: [Name]
  - [Same format]

- Strategy 3: [Name]
  - [Same format]

- [Optional Strategy 4-5 if highly relevant]

**Page 5: Your Action Plan + Next Steps**
- 30-day quick wins checklist (3-5 items)
- Resources needed (CPA, bookkeeper, etc.)
- Total Year-One Savings Potential: $XX,XXX - $XX,XXX
- CTA: "Want the complete 30-50 page wealth plan with ALL strategies, investment guidance, and debt elimination? [Learn about Legacy Wealth Blueprint]"

### Formatting Guidelines

- Use clean, professional design
- Blue accent color (#1e40af) for headers
- Clear hierarchy with proper headings
- Callout boxes for key numbers
- Conservative and aggressive estimates for all values
- Include disclaimer: "This report is for educational purposes only and does not constitute tax advice. Consult a qualified tax professional."

## Step 4: HTML Output

Generate complete, standalone HTML file with:
- Embedded CSS (professional styling)
- Print-friendly formatting
- Mobile-responsive design
- Legacy Investing Show branding placeholder
- Footer with disclaimer

### HTML Template Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Personal Tax Strategy Report | Legacy Investing Show</title>
    <style>
        /* Professional styling - see full template below */
    </style>
</head>
<body>
    <div class="report-container">
        <header class="report-header">
            <!-- Logo and title -->
        </header>
        
        <section class="executive-summary">
            <!-- Page 1 content -->
        </section>
        
        <section class="tax-profile">
            <!-- Page 2 content -->
        </section>
        
        <section class="strategies">
            <!-- Pages 3-4 content -->
        </section>
        
        <section class="action-plan">
            <!-- Page 5 content -->
        </section>
        
        <footer class="report-footer">
            <!-- Disclaimer and CTA -->
        </footer>
    </div>
</body>
</html>
```

## Critical Rules

1. **Never recommend strategies they already use** (check current_strategies)
2. **Never recommend strategies above their risk tolerance**
3. **Never recommend time-intensive strategies if they have <3 hrs/week**
4. **Always show conservative AND aggressive value estimates**
5. **Always include implementation difficulty rating**
6. **Maximum 5 strategies** - focus on highest impact
7. **Always include clear next step for each strategy**
8. **Always calculate using THEIR specific marginal rate**
9. **Include disclaimer about not being tax advice**
10. **End with CTA for full Legacy Wealth Blueprint program**

## Example Output Preview

For a user with:
- Income: $200K
- State: Texas
- W-2 + Side consulting ($80K profit)
- Owns home
- Moderate risk tolerance
- 1-3 hrs/week available
- Currently only maxing 401k

Report would include:
1. **S-Corporation Election** - $8,000-$15,000/year
2. **Home Office Deduction** - $1,500-$2,500/year
3. **Backdoor Roth IRA** - $7,000 tax-free growth
4. **Augusta Rule** - $3,500-$7,000/year
5. **W-4 Optimization** - +$500/month cash flow

Total Year-One Potential: $20,500 - $31,500

```

---

## Part 3: Technical Implementation Architecture

### Overview Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │     │                 │
│   Typeform /    │────▶│   Webhook /     │────▶│   Claude API    │────▶│   PDF/HTML      │
│   Quiz Page     │     │   Backend       │     │   Generation    │     │   Delivery      │
│                 │     │                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘
      User fills              Receives              Generates              Delivers to
      questionnaire           responses             report HTML            user
```

### Option A: No-Code / Low-Code Stack (Recommended for Speed)

**Best for:** Quick launch, minimal development

**Stack:**
1. **Typeform** or **Tally** - Quiz/questionnaire
2. **Make.com** (formerly Integromat) or **Zapier** - Automation
3. **Claude API** - Report generation
4. **PDFShift** or **html2pdf** - PDF conversion
5. **SendGrid** or **Mailchimp** - Email delivery

**Flow:**
```
1. User completes Typeform quiz
2. Typeform triggers Make.com webhook
3. Make.com formats data into prompt
4. Make.com calls Claude API with system prompt + user data
5. Claude returns HTML report
6. Make.com sends HTML to PDFShift for PDF conversion
7. Make.com emails PDF to user via SendGrid
8. Make.com adds user to follow-up sequence
```

**Costs:**
- Typeform: $25-50/month
- Make.com: $16-50/month
- Claude API: ~$0.05-0.15 per report (using Claude 3 Haiku or Sonnet)
- PDFShift: $9-29/month
- SendGrid: Free tier or $20/month

**Total: ~$70-150/month + ~$0.10 per report**

### Option B: Custom Code Stack (More Control)

**Best for:** Full customization, higher volume, better margins

**Stack:**
1. **Custom React/Next.js quiz** - On your domain
2. **Vercel/Railway backend** - Node.js or Python
3. **Claude API** - Direct integration
4. **Puppeteer** or **WeasyPrint** - PDF generation
5. **AWS SES** or **Resend** - Email delivery

**Architecture:**

```javascript
// pages/api/generate-report.js (Next.js API Route)

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { responses } = req.body;

  // Format user responses
  const userContext = formatResponses(responses);
  
  // System prompt (the skill content)
  const systemPrompt = `
    You are a tax strategy report generator for Legacy Investing Show.
    Generate a personalized 5-page HTML tax strategy report based on the 
    user's questionnaire responses.
    
    [Full system prompt from Part 2 above]
  `;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514", // or claude-3-haiku for cost savings
      max_tokens: 8000,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Generate a tax strategy report for this user:
          
${JSON.stringify(userContext, null, 2)}

Output ONLY the complete HTML document, no explanation.`
        }
      ]
    });

    const htmlReport = message.content[0].text;
    
    // Generate PDF from HTML
    const pdfBuffer = await generatePDF(htmlReport);
    
    // Send email with PDF attachment
    await sendEmail(responses.email, pdfBuffer);
    
    // Return success
    res.status(200).json({ 
      success: true, 
      message: 'Report generated and sent!' 
    });

  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
}

function formatResponses(responses) {
  return {
    income_range: responses.q1,
    state: responses.q2,
    income_sources: responses.q3,
    business_profit: responses.q4,
    current_strategies: responses.q5,
    filing_status: responses.q6,
    owns_home: responses.q7 === "Yes, I own my home",
    real_estate_interest: responses.q8,
    time_available: responses.q9,
    risk_tolerance: responses.q10,
    primary_goal: responses.q11,
    additional_context: responses.q12 || ""
  };
}
```

**PDF Generation Options:**

```javascript
// Option 1: Puppeteer (Node.js)
import puppeteer from 'puppeteer';

async function generatePDF(html) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html);
  const pdf = await page.pdf({ 
    format: 'letter',
    printBackground: true,
    margin: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' }
  });
  await browser.close();
  return pdf;
}

// Option 2: html-pdf-node (lighter weight)
import pdf from 'html-pdf-node';

async function generatePDF(html) {
  const file = { content: html };
  const options = { format: 'Letter' };
  return await pdf.generatePdf(file, options);
}

// Option 3: External API (PDFShift, DocRaptor)
async function generatePDF(html) {
  const response = await fetch('https://api.pdfshift.io/v3/convert/pdf', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + btoa(process.env.PDFSHIFT_API_KEY + ':'),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      source: html,
      landscape: false,
      use_print: true
    })
  });
  return await response.arrayBuffer();
}
```

### Option C: Hybrid (Typeform + Custom Backend)

**Best for:** Good UX with Typeform, custom processing

**Flow:**
1. Typeform collects responses (great UX, mobile-friendly)
2. Typeform webhook sends to your custom endpoint
3. Your backend (Vercel/Railway) processes with Claude API
4. Your backend generates PDF and sends email

```javascript
// Typeform webhook endpoint
app.post('/webhook/typeform', async (req, res) => {
  const { form_response } = req.body;
  const answers = parseTypeformAnswers(form_response.answers);
  
  // Generate report with Claude
  const report = await generateReport(answers);
  
  // Convert to PDF
  const pdf = await generatePDF(report);
  
  // Email to user
  const email = form_response.hidden.email || 
    form_response.answers.find(a => a.field.type === 'email')?.email;
  await sendEmail(email, pdf);
  
  res.status(200).send('OK');
});
```

---

## Part 4: PDF/Document Design

### Design Specifications

**Page Size:** Letter (8.5" x 11")
**Margins:** 0.75" all sides
**Primary Font:** Inter or Open Sans (clean, modern)
**Heading Font:** Same as body, bold weights
**Primary Color:** #1e40af (deep blue)
**Accent Color:** #059669 (green for money/savings)
**Background:** White with subtle patterns

### Page-by-Page Layout

**Page 1: Cover / Executive Summary**
```
┌────────────────────────────────────────────────────┐
│  [LOGO]                                            │
│                                                    │
│  YOUR PERSONAL                                     │
│  TAX STRATEGY REPORT                               │
│  ─────────────────────                             │
│                                                    │
│  Prepared for: [NAME]                              │
│  Date: [DATE]                                      │
│                                                    │
│  ┌──────────────────────────────────────────────┐  │
│  │  💰 YOUR POTENTIAL SAVINGS                   │  │
│  │                                              │  │
│  │     $XX,XXX - $XX,XXX                        │  │
│  │        per year                              │  │
│  │                                              │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  TOP STRATEGIES IDENTIFIED:                        │
│  • Strategy 1 Name                                 │
│  • Strategy 2 Name                                 │
│  • Strategy 3 Name                                 │
│                                                    │
└────────────────────────────────────────────────────┘
```

**Page 2: Your Tax Profile**
```
┌────────────────────────────────────────────────────┐
│  YOUR TAX PROFILE                                  │
│  ═══════════════════════════════════════════════   │
│                                                    │
│  CURRENT SITUATION                                 │
│  ┌─────────────────┐  ┌─────────────────┐          │
│  │ Income Range    │  │ Filing Status   │          │
│  │ $XXX,XXX        │  │ [Status]        │          │
│  └─────────────────┘  └─────────────────┘          │
│                                                    │
│  YOUR MARGINAL TAX RATE                            │
│  ┌──────────────────────────────────────────────┐  │
│  │  Federal:  XX%                               │  │
│  │  State:    XX%  (California)                 │  │
│  │  ────────────────                            │  │
│  │  Combined: XX%                               │  │
│  │                                              │  │
│  │  Every $1,000 in deductions saves you $XXX   │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  STRATEGIES YOU QUALIFY FOR                        │
│  ✓ Tier 1: Foundational (8 strategies)             │
│  ✓ Tier 2: Real Estate (4 strategies)              │
│  ○ Tier 3: Business (3 strategies)                 │
│                                                    │
│  CURRENT GAP ANALYSIS                              │
│  You're currently using: [X] strategies            │
│  You're missing: [X] high-value strategies         │
│                                                    │
└────────────────────────────────────────────────────┘
```

**Pages 3-4: Strategy Details**
```
┌────────────────────────────────────────────────────┐
│  YOUR RECOMMENDED STRATEGIES                       │
│  ═══════════════════════════════════════════════   │
│                                                    │
│  ┌──────────────────────────────────────────────┐  │
│  │  STRATEGY #1                                 │  │
│  │  S-CORPORATION ELECTION                      │  │
│  │  ────────────────────────────────────────    │  │
│  │                                              │  │
│  │  ESTIMATED SAVINGS: $8,000 - $15,000/year    │  │
│  │  DIFFICULTY: ●●○○○ Moderate                  │  │
│  │                                              │  │
│  │  WHAT IT IS                                  │  │
│  │  Restructure your business to pay yourself   │  │
│  │  a reasonable salary while taking remaining  │  │
│  │  profits as distributions, saving on         │  │
│  │  self-employment taxes.                      │  │
│  │                                              │  │
│  │  WHY IT FITS YOU                             │  │
│  │  With $80K+ in business profit, you're in    │  │
│  │  the sweet spot for S-Corp savings.          │  │
│  │                                              │  │
│  │  ✅ QUICK START THIS WEEK                    │  │
│  │  Consult with a CPA about filing Form 2553.  │  │
│  │  Deadline: March 15 for current year.        │  │
│  │                                              │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  [Repeat format for Strategies 2-5]                │
│                                                    │
└────────────────────────────────────────────────────┘
```

**Page 5: Action Plan + CTA**
```
┌────────────────────────────────────────────────────┐
│  YOUR 30-DAY ACTION PLAN                           │
│  ═══════════════════════════════════════════════   │
│                                                    │
│  WEEK 1                                            │
│  □ Action item 1                                   │
│  □ Action item 2                                   │
│                                                    │
│  WEEK 2-3                                          │
│  □ Action item 3                                   │
│  □ Action item 4                                   │
│                                                    │
│  WEEK 4                                            │
│  □ Action item 5                                   │
│                                                    │
│  ─────────────────────────────────────────────     │
│                                                    │
│  TOTAL YEAR-ONE POTENTIAL                          │
│  ┌──────────────────────────────────────────────┐  │
│  │                                              │  │
│  │     $XX,XXX - $XX,XXX                        │  │
│  │                                              │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  ─────────────────────────────────────────────     │
│                                                    │
│  WANT THE COMPLETE STRATEGY?                       │
│                                                    │
│  This report covers your TOP tax strategies.       │
│  The full Legacy Wealth Blueprint includes:        │
│                                                    │
│  • 43+ tax strategies analyzed for YOUR situation  │
│  • Investment allocation recommendations           │
│  • Debt elimination roadmap                        │
│  • Asset protection strategies                     │
│  • 30-50 page personalized wealth plan             │
│  • 1-on-1 strategy session                         │
│                                                    │
│  [LEARN ABOUT LEGACY WEALTH BLUEPRINT →]           │
│                                                    │
│  ─────────────────────────────────────────────     │
│  DISCLAIMER: This report is for educational        │
│  purposes only and does not constitute tax,        │
│  legal, or financial advice.                       │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## Part 5: Complete HTML Template

Here's a production-ready HTML template that the LLM should populate:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Personal Tax Strategy Report | Legacy Investing Show</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background: #ffffff;
        }
        
        .report-container {
            max-width: 8.5in;
            margin: 0 auto;
            padding: 0.75in;
        }
        
        .page {
            min-height: 10in;
            page-break-after: always;
            padding-bottom: 0.5in;
        }
        
        .page:last-child {
            page-break-after: avoid;
        }
        
        /* Cover Page */
        .cover-page {
            display: flex;
            flex-direction: column;
            justify-content: center;
            text-align: center;
        }
        
        .logo {
            width: 200px;
            margin: 0 auto 2rem;
        }
        
        .report-title {
            font-size: 2.5rem;
            font-weight: 700;
            color: #1e40af;
            margin-bottom: 0.5rem;
        }
        
        .report-subtitle {
            font-size: 1.25rem;
            color: #6b7280;
            margin-bottom: 2rem;
        }
        
        .prepared-for {
            font-size: 1rem;
            color: #4b5563;
            margin-bottom: 3rem;
        }
        
        .savings-highlight {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: white;
            padding: 2rem;
            border-radius: 12px;
            margin: 2rem auto;
            max-width: 400px;
        }
        
        .savings-highlight h3 {
            font-size: 0.875rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 0.5rem;
            opacity: 0.9;
        }
        
        .savings-amount {
            font-size: 2.5rem;
            font-weight: 700;
        }
        
        .savings-period {
            font-size: 1rem;
            opacity: 0.9;
        }
        
        .top-strategies-preview {
            margin-top: 3rem;
            text-align: left;
            max-width: 400px;
            margin-left: auto;
            margin-right: auto;
        }
        
        .top-strategies-preview h4 {
            font-size: 0.875rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #6b7280;
            margin-bottom: 1rem;
        }
        
        .top-strategies-preview li {
            padding: 0.5rem 0;
            border-bottom: 1px solid #e5e7eb;
            list-style: none;
        }
        
        /* Section Headers */
        .section-header {
            font-size: 1.5rem;
            font-weight: 700;
            color: #1e40af;
            border-bottom: 3px solid #1e40af;
            padding-bottom: 0.5rem;
            margin-bottom: 1.5rem;
        }
        
        /* Info Cards */
        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin-bottom: 2rem;
        }
        
        .info-card {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 1rem;
        }
        
        .info-card-label {
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #6b7280;
            margin-bottom: 0.25rem;
        }
        
        .info-card-value {
            font-size: 1.25rem;
            font-weight: 600;
            color: #1f2937;
        }
        
        /* Tax Rate Box */
        .tax-rate-box {
            background: #eff6ff;
            border: 2px solid #1e40af;
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 2rem;
        }
        
        .tax-rate-row {
            display: flex;
            justify-content: space-between;
            padding: 0.5rem 0;
            border-bottom: 1px solid #dbeafe;
        }
        
        .tax-rate-row:last-child {
            border-bottom: none;
            font-weight: 700;
            font-size: 1.25rem;
            color: #1e40af;
            padding-top: 1rem;
            margin-top: 0.5rem;
            border-top: 2px solid #1e40af;
        }
        
        .tax-rate-row.highlight {
            background: #dbeafe;
            margin: 0.5rem -1rem;
            padding: 0.75rem 1rem;
            border-radius: 6px;
        }
        
        /* Strategy Card */
        .strategy-card {
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            page-break-inside: avoid;
        }
        
        .strategy-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1rem;
        }
        
        .strategy-number {
            background: #1e40af;
            color: white;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.875rem;
            font-weight: 600;
            margin-right: 0.75rem;
        }
        
        .strategy-title {
            font-size: 1.25rem;
            font-weight: 700;
            color: #1f2937;
        }
        
        .strategy-savings {
            background: #ecfdf5;
            color: #059669;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            font-weight: 600;
            font-size: 0.875rem;
        }
        
        .difficulty-indicator {
            display: flex;
            align-items: center;
            gap: 0.25rem;
            margin-top: 0.5rem;
        }
        
        .difficulty-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #e5e7eb;
        }
        
        .difficulty-dot.filled {
            background: #1e40af;
        }
        
        .strategy-section {
            margin-top: 1rem;
        }
        
        .strategy-section h5 {
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #6b7280;
            margin-bottom: 0.5rem;
        }
        
        .quick-start {
            background: #f0fdf4;
            border-left: 4px solid #059669;
            padding: 1rem;
            margin-top: 1rem;
            border-radius: 0 8px 8px 0;
        }
        
        .quick-start h5 {
            color: #059669;
        }
        
        /* Action Plan */
        .action-week {
            margin-bottom: 1.5rem;
        }
        
        .action-week h4 {
            font-size: 0.875rem;
            font-weight: 600;
            color: #1e40af;
            margin-bottom: 0.5rem;
        }
        
        .action-item {
            display: flex;
            align-items: flex-start;
            gap: 0.5rem;
            padding: 0.5rem 0;
        }
        
        .checkbox {
            width: 18px;
            height: 18px;
            border: 2px solid #d1d5db;
            border-radius: 4px;
            flex-shrink: 0;
            margin-top: 2px;
        }
        
        /* Total Box */
        .total-box {
            background: linear-gradient(135deg, #059669 0%, #10b981 100%);
            color: white;
            padding: 2rem;
            border-radius: 12px;
            text-align: center;
            margin: 2rem 0;
        }
        
        .total-label {
            font-size: 0.875rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            opacity: 0.9;
            margin-bottom: 0.5rem;
        }
        
        .total-amount {
            font-size: 2.5rem;
            font-weight: 700;
        }
        
        /* CTA Section */
        .cta-section {
            background: #f9fafb;
            border: 2px solid #1e40af;
            border-radius: 12px;
            padding: 2rem;
            margin-top: 2rem;
        }
        
        .cta-section h3 {
            font-size: 1.25rem;
            font-weight: 700;
            color: #1e40af;
            margin-bottom: 1rem;
        }
        
        .cta-benefits {
            list-style: none;
            margin-bottom: 1.5rem;
        }
        
        .cta-benefits li {
            padding: 0.5rem 0;
            padding-left: 1.5rem;
            position: relative;
        }
        
        .cta-benefits li::before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #059669;
            font-weight: 700;
        }
        
        .cta-button {
            display: inline-block;
            background: #1e40af;
            color: white;
            padding: 1rem 2rem;
            border-radius: 8px;
            font-weight: 600;
            text-decoration: none;
        }
        
        /* Disclaimer */
        .disclaimer {
            font-size: 0.75rem;
            color: #6b7280;
            margin-top: 2rem;
            padding-top: 1rem;
            border-top: 1px solid #e5e7eb;
        }
        
        /* Print Styles */
        @media print {
            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            
            .report-container {
                padding: 0;
            }
            
            .page {
                min-height: auto;
                page-break-after: always;
            }
        }
    </style>
</head>
<body>
    <div class="report-container">
        
        <!-- PAGE 1: COVER -->
        <div class="page cover-page">
            <!-- Replace with actual logo -->
            <div class="logo">[LEGACY INVESTING SHOW LOGO]</div>
            
            <h1 class="report-title">YOUR PERSONAL<br>TAX STRATEGY REPORT</h1>
            <p class="report-subtitle">Customized strategies to legally reduce your tax burden</p>
            
            <p class="prepared-for">
                Prepared for: <strong>{{CLIENT_NAME}}</strong><br>
                Date: {{REPORT_DATE}}
            </p>
            
            <div class="savings-highlight">
                <h3>💰 Your Potential Annual Savings</h3>
                <div class="savings-amount">{{TOTAL_SAVINGS_RANGE}}</div>
                <div class="savings-period">per year</div>
            </div>
            
            <div class="top-strategies-preview">
                <h4>Top Strategies Identified</h4>
                <ul>
                    {{#each TOP_STRATEGIES}}
                    <li>{{this}}</li>
                    {{/each}}
                </ul>
            </div>
        </div>
        
        <!-- PAGE 2: TAX PROFILE -->
        <div class="page">
            <h2 class="section-header">Your Tax Profile</h2>
            
            <div class="info-grid">
                <div class="info-card">
                    <div class="info-card-label">Income Range</div>
                    <div class="info-card-value">{{INCOME_RANGE}}</div>
                </div>
                <div class="info-card">
                    <div class="info-card-label">Filing Status</div>
                    <div class="info-card-value">{{FILING_STATUS}}</div>
                </div>
                <div class="info-card">
                    <div class="info-card-label">State</div>
                    <div class="info-card-value">{{STATE}}</div>
                </div>
                <div class="info-card">
                    <div class="info-card-label">Primary Income</div>
                    <div class="info-card-value">{{PRIMARY_INCOME_SOURCE}}</div>
                </div>
            </div>
            
            <h3 style="margin-bottom: 1rem;">Your Marginal Tax Rate</h3>
            <div class="tax-rate-box">
                <div class="tax-rate-row">
                    <span>Federal Rate</span>
                    <span>{{FEDERAL_RATE}}%</span>
                </div>
                <div class="tax-rate-row">
                    <span>State Rate ({{STATE}})</span>
                    <span>{{STATE_RATE}}%</span>
                </div>
                <div class="tax-rate-row">
                    <span><strong>Combined Marginal Rate</strong></span>
                    <span><strong>{{COMBINED_RATE}}%</strong></span>
                </div>
                <div class="tax-rate-row highlight">
                    <span>Every $1,000 in deductions saves you</span>
                    <span><strong>${{SAVINGS_PER_1000}}</strong></span>
                </div>
            </div>
            
            <h3 style="margin-bottom: 1rem;">Strategies You Qualify For</h3>
            <div style="margin-bottom: 2rem;">
                {{#each TIER_QUALIFICATIONS}}
                <div style="padding: 0.5rem 0; display: flex; align-items: center; gap: 0.5rem;">
                    <span style="color: {{#if this.qualified}}#059669{{else}}#9ca3af{{/if}};">
                        {{#if this.qualified}}✓{{else}}○{{/if}}
                    </span>
                    <span>{{this.name}}: {{this.description}}</span>
                </div>
                {{/each}}
            </div>
            
            <h3 style="margin-bottom: 1rem;">Gap Analysis</h3>
            <p>You're currently using <strong>{{CURRENT_STRATEGY_COUNT}} strategies</strong>.</p>
            <p style="color: #059669; font-weight: 600;">You're missing <strong>{{MISSING_STRATEGY_COUNT}} high-value strategies</strong> that could save you thousands.</p>
        </div>
        
        <!-- PAGES 3-4: STRATEGIES -->
        <div class="page">
            <h2 class="section-header">Your Recommended Strategies</h2>
            
            {{#each STRATEGIES}}
            <div class="strategy-card">
                <div class="strategy-header">
                    <div style="display: flex; align-items: center;">
                        <div class="strategy-number">{{this.number}}</div>
                        <div>
                            <div class="strategy-title">{{this.name}}</div>
                            <div class="difficulty-indicator">
                                <span style="font-size: 0.75rem; color: #6b7280; margin-right: 0.5rem;">Difficulty:</span>
                                {{#times 5}}
                                <div class="difficulty-dot {{#if (lte @index ../this.difficulty)}}filled{{/if}}"></div>
                                {{/times}}
                                <span style="font-size: 0.75rem; color: #6b7280; margin-left: 0.5rem;">{{this.difficulty_label}}</span>
                            </div>
                        </div>
                    </div>
                    <div class="strategy-savings">{{this.savings_range}}/year</div>
                </div>
                
                <div class="strategy-section">
                    <h5>What It Is</h5>
                    <p>{{this.description}}</p>
                </div>
                
                <div class="strategy-section">
                    <h5>Why It Fits You</h5>
                    <p>{{this.fit_reason}}</p>
                </div>
                
                <div class="quick-start">
                    <h5>✅ Quick Start This Week</h5>
                    <p>{{this.quick_start}}</p>
                </div>
            </div>
            {{/each}}
        </div>
        
        <!-- PAGE 5: ACTION PLAN -->
        <div class="page">
            <h2 class="section-header">Your 30-Day Action Plan</h2>
            
            <div class="action-week">
                <h4>Week 1: Quick Wins</h4>
                {{#each ACTION_WEEK_1}}
                <div class="action-item">
                    <div class="checkbox"></div>
                    <span>{{this}}</span>
                </div>
                {{/each}}
            </div>
            
            <div class="action-week">
                <h4>Week 2-3: Implementation</h4>
                {{#each ACTION_WEEK_2_3}}
                <div class="action-item">
                    <div class="checkbox"></div>
                    <span>{{this}}</span>
                </div>
                {{/each}}
            </div>
            
            <div class="action-week">
                <h4>Week 4: Optimization</h4>
                {{#each ACTION_WEEK_4}}
                <div class="action-item">
                    <div class="checkbox"></div>
                    <span>{{this}}</span>
                </div>
                {{/each}}
            </div>
            
            <div class="total-box">
                <div class="total-label">Total Year-One Potential Savings</div>
                <div class="total-amount">{{TOTAL_SAVINGS_RANGE}}</div>
            </div>
            
            <div class="cta-section">
                <h3>Want the Complete Strategy?</h3>
                <p>This report covers your TOP tax strategies. The full <strong>Legacy Wealth Blueprint</strong> includes:</p>
                <ul class="cta-benefits">
                    <li>43+ tax strategies analyzed for YOUR situation</li>
                    <li>Investment allocation recommendations</li>
                    <li>Debt elimination roadmap</li>
                    <li>Asset protection strategies</li>
                    <li>30-50 page personalized wealth plan</li>
                    <li>1-on-1 strategy session with our team</li>
                </ul>
                <a href="{{CTA_LINK}}" class="cta-button">Learn About Legacy Wealth Blueprint →</a>
            </div>
            
            <div class="disclaimer">
                <strong>DISCLAIMER:</strong> This report is for educational purposes only and does not constitute tax, legal, or financial advice. Tax laws change frequently, and individual circumstances vary. Always consult with a qualified tax professional, CPA, or tax attorney before implementing any tax strategies. Legacy Investing Show is not a law firm or accounting firm and does not provide professional tax or legal services.
            </div>
        </div>
        
    </div>
</body>
</html>
```

---

## Part 6: Cost Analysis & Pricing Strategy

### Per-Report Costs

| Item | Cost per Report |
|------|-----------------|
| Claude API (Sonnet, ~4K input + 3K output tokens) | $0.03 - $0.08 |
| PDF Generation (PDFShift or similar) | $0.01 - $0.05 |
| Email Delivery | $0.001 |
| **Total Variable Cost** | **~$0.05 - $0.15** |

### Break-Even Analysis

At $47 price point with ~$0.10 variable cost:
- **Gross margin per sale:** $46.90 (99.8%)
- **With platform fees (Stripe 2.9% + $0.30):** $45.24 (96.3%)

### Upsell Funnel

```
$47 Mini Tax Report
        ↓
Order Bump: Tax Calendar + Checklist ($17)
        ↓
Upsell 1: Live Q&A Access ($97)
        ↓
Upsell 2: Full Legacy Wealth Blueprint (High Ticket)
```

---

## Part 7: Implementation Roadmap

### Week 1: Setup
- [ ] Set up Claude API account
- [ ] Create Typeform questionnaire
- [ ] Set up Make.com automation
- [ ] Test API integration

### Week 2: Development
- [ ] Finalize system prompt/skill
- [ ] Build HTML template
- [ ] Configure PDF generation
- [ ] Set up email delivery

### Week 3: Testing
- [ ] Run 20+ test generations
- [ ] Review output quality
- [ ] Iterate on prompt
- [ ] Test edge cases (low income, W-2 only, etc.)

### Week 4: Launch
- [ ] Create sales page
- [ ] Set up payment processing
- [ ] Configure upsells
- [ ] Launch to email list

---

## Appendix A: State Tax Rate Reference

```javascript
const stateTaxRates = {
  // No income tax states
  'Alaska': 0, 'Florida': 0, 'Nevada': 0, 'New Hampshire': 0,
  'South Dakota': 0, 'Tennessee': 0, 'Texas': 0, 'Washington': 0, 'Wyoming': 0,
  
  // Low tax states (1-4%)
  'North Dakota': 2.9, 'Pennsylvania': 3.07, 'Indiana': 3.15, 'Michigan': 4.25,
  'Colorado': 4.4, 'Utah': 4.85, 'Illinois': 4.95, 'Arizona': 2.5,
  
  // Medium tax states (5-7%)
  'Ohio': 3.99, 'Oklahoma': 4.75, 'Georgia': 5.49, 'Virginia': 5.75,
  'North Carolina': 4.75, 'Massachusetts': 5.0, 'Kentucky': 4.5,
  
  // High tax states (8%+)
  'Oregon': 9.9, 'Minnesota': 9.85, 'New Jersey': 10.75, 'Vermont': 8.75,
  'New York': 10.9, 'California': 13.3, 'Hawaii': 11.0,
  
  // Add remaining states...
};
```

---

## Appendix B: Strategy Qualification Matrix

| Strategy | Min Income | Business Required | Time Req | Risk Level |
|----------|------------|-------------------|----------|------------|
| Solo 401(k) | $0 | Yes (self-emp) | Low | 1 |
| Backdoor Roth | >$161K | No | Low | 1 |
| S-Corp Election | $60K+ profit | Yes | Medium | 2 |
| Home Office | $0 | Yes | Low | 1 |
| Augusta Rule | $0 | Yes + Own home | Low | 2 |
| Cost Segregation | $200K+ | Own property | Low | 3 |
| STR Loophole | $150K+ | Own/lease STR | High | 3 |
| REP Status | $200K+ | 750+ hrs/yr | Very High | 4 |

---

*Document Version: 1.0*
*Created: {{DATE}}*
*For: Legacy Investing Show*
