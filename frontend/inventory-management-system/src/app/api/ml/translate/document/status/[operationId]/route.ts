import { NextRequest, NextResponse } from 'next/server';

const ML_SERVICE_URL = process.env.NEXT_PUBLIC_ML_SERVICE_URL || 'http://localhost:8081';

export async function GET(
  request: NextRequest,
  { params }: { params: { operationId: string } }
) {
  try {
    const { operationId } = await params;
    
    const response = await fetch(`${ML_SERVICE_URL}/translate/document/status/${operationId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.detail || 'Status check failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
