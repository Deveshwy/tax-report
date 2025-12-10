# Implementation Code Examples

## Option 1: Node.js + Next.js (Recommended)

### Full API Route Implementation

```javascript
// pages/api/generate-tax-report.js

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// State tax rates lookup
const stateTaxRates = {
  'Alabama': 5.0, 'Alaska': 0, 'Arizona': 2.5, 'Arkansas': 4.9,
  'California': 13.3, 'Colorado': 4.4, 'Connecticut': 6.99, 'Delaware': 6.6,
  'Florida': 0, 'Georgia': 5.49, 'Hawaii': 11.0, 'Idaho': 5.8,
  'Illinois': 4.95, 'Indiana': 3.15, 'Iowa': 6.0, 'Kansas': 5.7,
  'Kentucky': 4.5, 'Louisiana': 4.25, 'Maine': 7.15, 'Maryland': 5.75,
  'Massachusetts': 5.0, 'Michigan': 4.25, 'Minnesota': 9.85, 'Mississippi': 5.0,
  'Missouri': 4.95, 'Montana': 6.75, 'Nebraska': 6.84, 'Nevada': 0,
  'New Hampshire': 0, 'New Jersey': 10.75, 'New Mexico': 5.9, 'New York': 10.9,
  'North Carolina': 4.75, 'North Dakota': 2.9, 'Ohio': 3.99, 'Oklahoma': 4.75,
  'Oregon': 9.9, 'Pennsylvania': 3.07, 'Rhode Island': 5.99, 'South Carolina': 6.5,
  'South Dakota': 0, 'Tennessee': 0, 'Texas': 0, 'Utah': 4.85,
  'Vermont': 8.75, 'Virginia': 5.75, 'Washington': 0, 'West Virginia': 6.5,
  'Wisconsin': 7.65, 'Wyoming': 0, 'District of Columbia': 10.75
};

// System prompt (abbreviated - use full version from system-prompt-mini-tax-report.md)
const SYSTEM_PROMPT = `
You are a tax strategy report generator for Legacy Investing Show...
[INSERT FULL SYSTEM PROMPT HERE]
`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { responses, email, name } = req.body;

    // Validate required fields
    if (!responses || !email || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Format user data for the prompt
    const userData = {
      name: name,
      email: email,
      income_range: responses.q1,
      state: responses.q2,
      state_tax_rate: stateTaxRates[responses.q2] || 5,
      income_sources: responses.q3, // array
      business_profit: responses.q4,
      current_strategies: responses.q5, // array
      filing_status: responses.q6,
      owns_home: responses.q7 === "Yes, I own my home",
      real_estate_interest: responses.q8,
      time_available: responses.q9,
      risk_tolerance: responses.q10,
      primary_goal: responses.q11,
      additional_context: responses.q12 || "None provided"
    };

    // Generate report with Claude
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514", // Good balance of quality and cost
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Generate a personalized tax strategy report for this user:

User Name: ${userData.name}
Report Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

QUESTIONNAIRE RESPONSES:
${JSON.stringify(userData, null, 2)}

Generate the complete HTML report now. Output ONLY the HTML, no explanation.`
        }
      ]
    });

    const htmlReport = message.content[0].text;

    // Return the HTML report
    res.status(200).json({ 
      success: true, 
      html: htmlReport,
      userData: {
        name: userData.name,
        email: userData.email
      }
    });

  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ 
      error: 'Failed to generate report',
      details: error.message 
    });
  }
}
```

### PDF Generation Endpoint

```javascript
// pages/api/generate-pdf.js

import puppeteer from 'puppeteer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { html } = req.body;

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Set content
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      }
    });

    await browser.close();

    // Return PDF as base64
    res.status(200).json({
      success: true,
      pdf: pdfBuffer.toString('base64')
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
}
```

### Email Delivery with Resend

```javascript
// pages/api/send-report.js

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, name, pdfBase64 } = req.body;

    const { data, error } = await resend.emails.send({
      from: 'Legacy Investing Show <reports@legacyinvestingshow.com>',
      to: email,
      subject: `${name}, Your Personal Tax Strategy Report is Ready!`,
      html: `
        <h1>Your Tax Strategy Report is Ready!</h1>
        <p>Hi ${name},</p>
        <p>Thank you for completing our Tax Strategy Assessment. Your personalized report is attached to this email.</p>
        <p>Inside you'll discover:</p>
        <ul>
          <li>Your current marginal tax rate breakdown</li>
          <li>3-5 tax strategies tailored to your situation</li>
          <li>Estimated savings for each strategy</li>
          <li>A 30-day action plan to implement these strategies</li>
        </ul>
        <p>Questions about your report? Reply to this email and we'll help you out.</p>
        <p>Best,<br>The Legacy Investing Show Team</p>
      `,
      attachments: [
        {
          filename: 'Your-Tax-Strategy-Report.pdf',
          content: pdfBase64
        }
      ]
    });

    if (error) {
      throw new Error(error.message);
    }

    res.status(200).json({ success: true, messageId: data.id });

  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
}
```

---

## Option 2: Make.com (No-Code) Setup

### Webhook Configuration

1. **Create a new Scenario in Make.com**

2. **Add Typeform Trigger**
   - Trigger: "Watch Responses"
   - Connect your Typeform account
   - Select your quiz form

3. **Add HTTP Module (Claude API)**
   - Module: "Make a request"
   - URL: `https://api.anthropic.com/v1/messages`
   - Method: POST
   - Headers:
     ```
     x-api-key: YOUR_API_KEY
     anthropic-version: 2023-06-01
     content-type: application/json
     ```
   - Body (JSON):
   ```json
   {
     "model": "claude-sonnet-4-20250514",
     "max_tokens": 8000,
     "system": "YOUR_SYSTEM_PROMPT_HERE",
     "messages": [
       {
         "role": "user",
         "content": "Generate report for: {{typeform_data}}"
       }
     ]
   }
   ```

4. **Add PDFShift Module**
   - Module: HTTP > Make a request
   - URL: `https://api.pdfshift.io/v3/convert/pdf`
   - Method: POST
   - Headers:
     ```
     Authorization: Basic {{base64(api_key:)}}
     Content-Type: application/json
     ```
   - Body:
   ```json
   {
     "source": "{{claude_response.content[0].text}}",
     "landscape": false,
     "use_print": true
   }
   ```

5. **Add Email Module (SendGrid or Gmail)**
   - To: `{{typeform.email}}`
   - Subject: "Your Tax Strategy Report"
   - Attachments: PDF from previous step

---

## Option 3: Python + FastAPI

```python
# main.py

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import anthropic
import base64
from weasyprint import HTML
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email.mime.text import MIMEText
from email import encoders
import os

app = FastAPI()

# Initialize Anthropic client
client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

class QuizResponses(BaseModel):
    name: str
    email: str
    income_range: str
    state: str
    income_sources: List[str]
    business_profit: str
    current_strategies: List[str]
    filing_status: str
    owns_home: bool
    real_estate_interest: str
    time_available: str
    risk_tolerance: str
    primary_goal: str
    additional_context: Optional[str] = ""

SYSTEM_PROMPT = """
You are a tax strategy report generator for Legacy Investing Show...
[INSERT FULL SYSTEM PROMPT]
"""

STATE_TAX_RATES = {
    "California": 13.3, "New York": 10.9, "Texas": 0, "Florida": 0,
    # Add all states...
}

@app.post("/generate-report")
async def generate_report(responses: QuizResponses):
    try:
        # Prepare user data
        user_data = responses.dict()
        user_data["state_tax_rate"] = STATE_TAX_RATES.get(responses.state, 5)
        
        # Generate report with Claude
        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=8000,
            system=SYSTEM_PROMPT,
            messages=[
                {
                    "role": "user",
                    "content": f"""Generate a personalized tax strategy report for:

{user_data}

Output ONLY the complete HTML document."""
                }
            ]
        )
        
        html_report = message.content[0].text
        
        # Generate PDF
        pdf_bytes = HTML(string=html_report).write_pdf()
        pdf_base64 = base64.b64encode(pdf_bytes).decode()
        
        # Send email
        send_email_with_attachment(
            to_email=responses.email,
            to_name=responses.name,
            pdf_bytes=pdf_bytes
        )
        
        return {
            "success": True,
            "message": "Report generated and sent!",
            "pdf_base64": pdf_base64
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def send_email_with_attachment(to_email: str, to_name: str, pdf_bytes: bytes):
    msg = MIMEMultipart()
    msg['From'] = os.getenv('SMTP_FROM')
    msg['To'] = to_email
    msg['Subject'] = f"{to_name}, Your Tax Strategy Report is Ready!"
    
    body = f"""
    Hi {to_name},
    
    Your personalized tax strategy report is attached.
    
    Best,
    Legacy Investing Show Team
    """
    msg.attach(MIMEText(body, 'plain'))
    
    # Attach PDF
    attachment = MIMEBase('application', 'octet-stream')
    attachment.set_payload(pdf_bytes)
    encoders.encode_base64(attachment)
    attachment.add_header(
        'Content-Disposition',
        f'attachment; filename="Tax-Strategy-Report.pdf"'
    )
    msg.attach(attachment)
    
    # Send
    with smtplib.SMTP(os.getenv('SMTP_HOST'), int(os.getenv('SMTP_PORT'))) as server:
        server.starttls()
        server.login(os.getenv('SMTP_USER'), os.getenv('SMTP_PASS'))
        server.send_message(msg)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

---

## Frontend Quiz Component (React)

```jsx
// components/TaxQuiz.jsx

import { useState } from 'react';

const questions = [
  {
    id: 'q1',
    question: 'What is your total annual household income?',
    type: 'select',
    options: [
      'Under $75,000',
      '$75,000 - $150,000',
      '$150,000 - $250,000',
      '$250,000 - $400,000',
      '$400,000 - $750,000',
      '$750,000+'
    ]
  },
  {
    id: 'q2',
    question: 'Which state do you live in?',
    type: 'select',
    options: ['Alabama', 'Alaska', /* ... all states */ 'Wyoming']
  },
  {
    id: 'q3',
    question: 'How do you primarily earn your income?',
    type: 'multiselect',
    options: [
      'W-2 Employee (traditional job)',
      'Self-employed / Freelancer / 1099 Contractor',
      'Business owner (LLC, S-Corp, or C-Corp)',
      'Real estate investor',
      'Investment income (dividends, capital gains)',
      'Retired / Pension income'
    ]
  },
  // ... add remaining questions
];

export default function TaxQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responses: answers,
          email: answers.email,
          name: answers.name
        })
      });
      
      if (!response.ok) throw new Error('Failed to generate report');
      
      setIsComplete(true);
    } catch (error) {
      console.error(error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isComplete) {
    return (
      <div className="quiz-complete">
        <h2>🎉 Your Report is on the Way!</h2>
        <p>Check your email for your personalized tax strategy report.</p>
      </div>
    );
  }

  const q = questions[currentQuestion];

  return (
    <div className="quiz-container">
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
        />
      </div>
      
      <div className="question-card">
        <h3>{q.question}</h3>
        
        {q.type === 'select' && (
          <div className="options">
            {q.options.map(option => (
              <button
                key={option}
                className={`option ${answers[q.id] === option ? 'selected' : ''}`}
                onClick={() => handleAnswer(q.id, option)}
              >
                {option}
              </button>
            ))}
          </div>
        )}
        
        {q.type === 'multiselect' && (
          <div className="options">
            {q.options.map(option => (
              <button
                key={option}
                className={`option ${(answers[q.id] || []).includes(option) ? 'selected' : ''}`}
                onClick={() => {
                  const current = answers[q.id] || [];
                  const updated = current.includes(option)
                    ? current.filter(o => o !== option)
                    : [...current, option];
                  handleAnswer(q.id, updated);
                }}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
      
      <button 
        className="next-button"
        onClick={handleNext}
        disabled={!answers[q.id] || isSubmitting}
      >
        {isSubmitting ? 'Generating Report...' : 
         currentQuestion === questions.length - 1 ? 'Generate My Report' : 'Next'}
      </button>
    </div>
  );
}
```

---

## Environment Variables

```env
# .env.local

# Anthropic
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Email (Resend)
RESEND_API_KEY=re_xxxxx

# OR Email (SMTP)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.xxxxx
SMTP_FROM=reports@legacyinvestingshow.com

# PDF Generation (if using external service)
PDFSHIFT_API_KEY=xxxxx
```

---

## Cost Optimization Tips

1. **Use Claude Haiku for lower costs** (~$0.01 per report vs $0.05 for Sonnet)
   - Trade-off: Slightly lower quality, but still good for structured outputs
   
2. **Cache common patterns** - If many users have similar profiles, cache HTML templates

3. **Batch PDF generation** - Process multiple PDFs at once if using Puppeteer

4. **Use Vercel/Railway free tiers** - Good enough for early testing

5. **Estimate costs:**
   - 100 reports/month: ~$5-15 API costs
   - 1,000 reports/month: ~$50-150 API costs
   - At $47/report, break-even is ~1 sale per month
