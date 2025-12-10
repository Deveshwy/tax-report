import { NextRequest, NextResponse } from 'next/server';
import { generateTaxReport } from '@/lib/openrouter';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, responses } = body;

    // Log the received data for debugging
    console.log('API received data:', { name, email, responses });
    console.log('OpenRouter API Key exists:', !!process.env.OPENROUTER_API_KEY);

    // Validate required fields
    if (!name || !email || !responses) {
      console.error('Missing required fields:', { name: !!name, email: !!email, responses: !!responses });
      return NextResponse.json(
        { error: 'Missing required fields: name, email, responses' },
        { status: 400 }
      );
    }

    // Generate the tax report
    console.log('Calling generateTaxReport...');
    const htmlReport = await generateTaxReport({
      name,
      email,
      responses
    });
    console.log('Report generated successfully, length:', htmlReport.length);

    // Return the HTML report
    return NextResponse.json({
      success: true,
      html: htmlReport
    });

  } catch (error) {
    console.error('Error in generate-report API:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        error: 'Failed to generate report',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}