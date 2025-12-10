# Tax Strategy Report Generator

A Next.js application that generates personalized 5-page tax strategy reports using AI. Users complete a 12-question quiz, and the app generates tailored tax reduction strategies based on their responses.

## Features

- Interactive Typeform-like quiz with 12 questions
- AI-powered report generation using Grok 4.1 fast model via OpenRouter
- Beautiful, professional HTML reports
- Print and download functionality
- Mobile-responsive design
- Loading states and progress indicators

## Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **AI API**: OpenRouter (using xAI/Grok model)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- OpenRouter API key (get one at [openrouter.ai](https://openrouter.ai))

### Installation

1. Clone or download this project
2. Navigate to the project directory

```bash
cd tax-report
```

3. Install dependencies

```bash
npm install
```

4. Create environment variables file

```bash
cp .env.local.example .env.local
```

5. Add your OpenRouter API key to `.env.local`

```env
OPENROUTER_API_KEY=your_actual_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Deploying to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel dashboard:
   - `OPENROUTER_API_KEY`
   - `NEXT_PUBLIC_APP_URL` (set to your Vercel URL)
4. Deploy!

## Project Structure

```
tax-report/
├── app/                    # Next.js app directory
│   ├── api/generate-report/ # API route for report generation
│   ├── loading/            # Loading page
│   ├── report/             # Report display page
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page (quiz)
├── components/             # React components
│   └── Quiz.tsx           # Main quiz component
├── lib/                   # Utilities
│   ├── openrouter.ts      # OpenRouter API client
│   └── state-tax-rates.ts # State tax rate data
├── types/                 # TypeScript types
│   └── quiz.ts           # Quiz-related types
└── public/               # Static assets
```

## How It Works

1. **Quiz**: Users complete a 12-question quiz about their income, business structure, and goals
2. **Submission**: Quiz data is stored in localStorage and user is redirected to loading page
3. **Generation**: The loading page sends quiz data to the API, which calls OpenRouter with the system prompt
4. **Report**: AI generates a complete HTML report with personalized tax strategies
5. **Display**: Report is shown on the report page with print/download options

## Customization

### Modifying Questions

Edit the `questions` array in `components/Quiz.tsx` to change or add questions.

### Changing AI Model

Update the model in `lib/openrouter.ts`:

```typescript
const response = await openrouter.chat.completions.create({
  model: 'xai/grok-2-121231', // Change this line
  // ...
});
```

### Styling

The app uses Tailwind CSS with custom colors defined in `tailwind.config.ts`. Modify these values to change the color scheme.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENROUTER_API_KEY` | Your OpenRouter API key | Yes |
| `NEXT_PUBLIC_APP_URL` | Your app's public URL | Yes |

## Troubleshooting

### Report Not Generating

- Check that your OpenRouter API key is valid and has credits
- Ensure all environment variables are set correctly
- Check browser console for error messages

### Styling Issues

- Ensure Tailwind CSS is properly installed
- Run `npm run dev` to start the development server with hot reload

## License

This project is proprietary software for Legacy Investing Show.

## Support

For support, please contact the development team.