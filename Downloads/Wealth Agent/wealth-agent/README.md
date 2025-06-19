# Financial Co-Pilot Chatbot

An AI-powered financial assistant for Legacy Wealth Blueprint students built with Next.js and OpenAI's latest models.

## Features

- **Smart Model Routing**: Automatically uses O3 for complex analysis and GPT-4o for quick responses
- **File Upload Support**: Upload and analyze PDFs, DOCX, CSV, and Excel files
- **Streaming Responses**: Real-time chat with live response streaming
- **Financial Tools**: Built-in support for financial calculations and analysis
- **Clean UI**: Modern, minimalist interface optimized for non-technical users
- **Conversation History**: Automatic conversation saving to localStorage

## Quick Start

1. **Set up your OpenAI API key**:
   ```bash
   # Edit .env.local and add your API key
   OPENAI_API_KEY=your_openai_api_key_here
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** to `http://localhost:3000`

## Usage

1. **Chat Interface**: Type financial questions or upload documents for analysis
2. **File Upload**: Click "Upload File" to add PDFs, spreadsheets, or documents
3. **Smart Responses**: The AI automatically chooses the best model for your query
4. **Transparent Reasoning**: See calculations, sources, and step-by-step analysis

## Technical Details

### Model Routing Logic
- **O3 Model**: Used for complex queries containing keywords like "analyze", "calculate", "breakdown" or messages longer than 600 characters
- **GPT-4o**: Used for quick, factual responses and simple queries

### Supported File Types
- PDF documents
- Word documents (.docx)
- CSV files
- Excel files (.xls, .xlsx)

### API Endpoints
- `POST /api/chat` - Send messages and receive streaming responses
- `POST /api/files/upload` - Upload files for analysis

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

## Next Steps

1. Add your OpenAI API key to `.env.local`
2. Upload some sample financial documents
3. Test with complex financial scenarios
4. Iterate on the prompts and UI based on user feedback

## Architecture

- **Frontend**: Next.js 15 with App Router, Tailwind CSS, shadcn/ui
- **Backend**: OpenAI Responses API with streaming support
- **Storage**: localStorage for conversation history, OpenAI File API for documents
- **Deployment**: Vercel-ready (remember to add environment variables)
