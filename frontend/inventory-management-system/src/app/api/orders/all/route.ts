import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL =
  'https://orderservice-337812374841.us-central1.run.app/api/orders';

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Proxying request to external API...');

    // Get the authorization header from the incoming request
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: 'Authorization header is required' },
        { status: 401 }
      );
    }

    // Forward the request to the external API
    const response = await fetch(`${API_BASE_URL}/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });

    console.log(
      '📥 External API response:',
      response.status,
      response.statusText
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ External API error:', errorText);

      return NextResponse.json(
        {
          success: false,
          message: `External API error: ${response.status} - ${errorText}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Add CORS headers to the response
    const nextResponse = NextResponse.json(data, { status: 200 });
    nextResponse.headers.set('Access-Control-Allow-Origin', '*');
    nextResponse.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS'
    );
    nextResponse.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );

    return nextResponse;
  } catch (error) {
    console.error('💥 Proxy error:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown proxy error',
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  // Handle CORS preflight request
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
