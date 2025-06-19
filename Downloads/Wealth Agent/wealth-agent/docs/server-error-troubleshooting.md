# Server Error Troubleshooting Guide

This guide provides comprehensive diagnostics for HTTP 500 errors and "server could not be reached" issues in the Wealth Agent application.

## Quick Diagnostic Checklist

When encountering server errors, check these items in order:

1. **Check terminal/console for error messages** - Always look for stack traces first
2. **Verify environment variables** - Missing API keys cause immediate failures
3. **Check directory path** - Spaces in folder names can break module resolution
4. **Test external service connectivity** - OpenAI, Clerk, and Supabase must be reachable
5. **Validate file permissions** - Vector store files and uploads need proper access

## Common Error Categories

### 1. Environment Variable Issues

**Symptoms:**
- `OPENAI_API_KEY is required` error
- Clerk authentication failures
- Database connection errors
- 500 errors on API routes

**Root Causes:**
- Missing `.env.local` file
- Incorrect API key format
- Expired or invalid credentials
- Wrong environment variable names

**Diagnostic Steps:**
```bash
# Check if .env.local exists
ls -la .env.local

# Verify required variables are set
grep -E "OPENAI_API_KEY|CLERK_SECRET_KEY|NEXT_PUBLIC_SUPABASE_URL" .env.local

# Test API key validity
curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models
```

**Common Fixes:**
- Copy `.env.example` to `.env.local` and fill in actual values
- Regenerate API keys if expired
- Ensure no extra spaces or quotes around values
- Restart development server after env changes

### 2. Directory Path Problems

**Symptoms:**
- Module resolution errors
- Import path failures
- File not found errors
- Inconsistent behavior across different systems

**Root Causes:**
- Spaces in directory names ("Wealth Agent")
- Incorrect file path casing
- Symbolic link issues
- Permission problems

**Diagnostic Steps:**
```bash
# Check current directory path
pwd

# Verify file exists with correct casing
ls -la src/lib/openai.ts

# Check for permission issues
ls -la .vector-store-id
```

**Common Fixes:**
- Move project to path without spaces: `~/projects/wealth-agent`
- Ensure import paths match exact file names and casing
- Fix file permissions if needed: `chmod 644 filename`

### 3. External Service Failures

**Symptoms:**
- Connection timeout errors
- API rate limit exceeded
- Authentication failures
- Vector store creation errors

**Root Causes:**
- OpenAI API downtime or rate limits
- Clerk service unavailable
- Supabase connection issues
- Network connectivity problems

**Diagnostic Steps:**
```bash
# Test OpenAI API connectivity
curl -I https://api.openai.com/v1/models

# Check Clerk service status
curl -I https://api.clerk.dev/v1/health

# Test Supabase connection
curl -I https://your-project.supabase.co/rest/v1/
```

**Common Fixes:**
- Implement retry logic with exponential backoff
- Add timeout handling for external calls
- Use circuit breaker pattern for failing services
- Cache responses when possible

### 4. Streaming Response Errors

**Symptoms:**
- Incomplete responses
- Connection drops mid-stream
- Client-side timeout errors
- Empty response bodies

**Root Causes:**
- Network interruptions
- Server-side timeout
- Client disconnection
- Invalid streaming format

**Diagnostic Steps:**
- Check browser network tab for dropped connections
- Monitor server logs during streaming
- Test with different network conditions
- Verify streaming headers are correct

**Common Fixes:**
- Add connection keep-alive headers
- Implement client-side reconnection
- Use shorter timeout values
- Add heartbeat mechanism

### 5. File System & Import Issues

**Symptoms:**
- Cannot find module errors
- Vector store file access denied
- Upload failures
- Path resolution errors

**Root Causes:**
- Incorrect relative paths
- Missing file system permissions
- Circular import dependencies
- File system case sensitivity

**Diagnostic Steps:**
```bash
# Check file permissions
ls -la .vector-store-id

# Verify import paths
grep -r "from.*lib" src/

# Check for circular dependencies
npx madge --circular src/
```

**Common Fixes:**
- Use absolute imports with TypeScript path mapping
- Fix file permissions: `chmod 644 filename`
- Resolve circular dependencies
- Ensure consistent file naming

### 6. Model Selection & OpenAI API Errors

**Symptoms:**
- Invalid model errors
- API quota exceeded
- Token limit exceeded
- Model not available

**Root Causes:**
- Incorrect model names (`gpt-4.1` vs `gpt-4`)
- Rate limiting
- Insufficient API credits
- Model access restrictions

**Diagnostic Steps:**
```bash
# List available models
curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models

# Check account usage
curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/dashboard/billing/usage
```

**Common Fixes:**
- Update to correct model names
- Implement fallback models
- Add usage monitoring
- Upgrade API plan if needed

## Specific Application Issues

### Chat API Route (`/api/chat`)

**Common Problems:**
- Invalid message format
- Vector store ID not found
- Streaming response failures
- Tool execution errors

**Debugging:**
```typescript
// Add logging to chat route
console.log('Request payload:', { message, responseId, files });
console.log('Using model:', model);
console.log('Vector store IDs:', vectorStoreIds);
```

### File Upload Route (`/api/files/upload`)

**Common Problems:**
- File type validation failures
- OpenAI file upload errors
- Vector store addition failures
- File size limits exceeded

**Debugging:**
```typescript
// Add file validation logging
console.log('File details:', { 
  name: file.name, 
  size: file.size, 
  type: file.type 
});
```

### Vector Store Operations

**Common Problems:**
- Vector store file not found
- OpenAI vector store creation failures
- File addition to vector store errors
- Permissions issues

**Debugging:**
```typescript
// Check vector store file
const vectorStoreFile = path.join(process.cwd(), '.vector-store-id');
console.log('Vector store file exists:', fs.existsSync(vectorStoreFile));
```

## Error Monitoring & Logging

### Essential Logging Points

1. **API Route Entry Points**
```typescript
export async function POST(req: NextRequest) {
  console.log(`${Date.now()} - POST ${req.url}`);
  // ... rest of handler
}
```

2. **External API Calls**
```typescript
try {
  const response = await openai.chat.completions.create(params);
  console.log('OpenAI response received');
} catch (error) {
  console.error('OpenAI API error:', error);
  throw error;
}
```

3. **Database Operations**
```typescript
try {
  const result = await supabase.from('table').select();
  console.log('Database query successful');
} catch (error) {
  console.error('Database error:', error);
  throw error;
}
```

### Global Error Handler

Add to `app/layout.tsx`:
```typescript
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
  });
}
```

## Prevention Strategies

### 1. Environment Validation

Create environment validation utility:
```typescript
// lib/env-validation.ts
export function validateEnvironment() {
  const required = [
    'OPENAI_API_KEY',
    'CLERK_SECRET_KEY',
    'NEXT_PUBLIC_SUPABASE_URL'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
}
```

### 2. Health Check Endpoint

Create `/api/health` route:
```typescript
export async function GET() {
  try {
    // Test external services
    await openai.models.list();
    // Add other service checks
    
    return Response.json({ status: 'healthy' });
  } catch (error) {
    return Response.json({ status: 'unhealthy', error: error.message }, { status: 500 });
  }
}
```

### 3. Graceful Error Handling

Implement consistent error responses:
```typescript
export function handleApiError(error: unknown) {
  console.error('API Error:', error);
  
  if (error instanceof Error) {
    return Response.json({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
  
  return Response.json({ 
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  }, { status: 500 });
}
```

### 4. Connection Resilience

Add retry logic for external calls:
```typescript
async function withRetry<T>(
  fn: () => Promise<T>, 
  maxRetries = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
  throw new Error('Max retries exceeded');
}
```

## Emergency Response Procedures

### When Server Is Completely Down

1. **Check process status**
```bash
ps aux | grep node
lsof -i :3000
```

2. **Restart development server**
```bash
npm run dev
```

3. **Check logs**
```bash
journalctl -f
tail -f /var/log/nginx/error.log
```

### When Specific Routes Fail

1. **Test route isolation**
```bash
curl -v http://localhost:3000/api/health
```

2. **Check route-specific logs**
3. **Verify environment for that service**
4. **Test external dependencies**

### When External Services Fail

1. **Check service status pages**
2. **Implement fallback mechanisms**
3. **Use cached responses if available**
4. **Notify users of service degradation**

## Monitoring & Alerting

### Key Metrics to Monitor

- API response times
- Error rates by endpoint
- External service availability
- Database connection health
- File upload success rates
- Vector store operation status

### Alert Thresholds

- Error rate > 5% over 5 minutes
- Response time > 5 seconds
- External service timeout > 30 seconds
- Database connection failures
- File upload failures > 10%

This troubleshooting guide should be updated regularly as new issues are discovered and resolved.