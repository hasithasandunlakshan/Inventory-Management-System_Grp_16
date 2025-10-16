import { NextRequest, NextResponse } from 'next/server';

interface DocumentAnalysisRequest {
  file: {
    name: string;
    type: string;
    size: number;
    data: string; // base64 encoded
  };
  options: {
    extractText?: boolean;
    extractTables?: boolean;
    extractKeyValuePairs?: boolean;
  };
}

interface DocumentAnalysisResult {
  success: boolean;
  data?: {
    text?: string;
    tables?: Array<{
      headers: string[];
      rows: string[][];
    }>;
    keyValuePairs?: Array<{
      key: string;
      value: string;
      confidence: number;
    }>;
  };
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Get Azure configuration from environment variables
    const azureEndpoint = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT;
    const azureApiKey = process.env.AZURE_DOCUMENT_INTELLIGENCE_API_KEY;
    const modelId = process.env.AZURE_DOCUMENT_INTELLIGENCE_MODEL_ID || 'prebuilt-document';

    if (!azureEndpoint || !azureApiKey) {
      return NextResponse.json(
        { success: false, error: 'Azure configuration not found' },
        { status: 500 }
      );
    }

    // Parse request body
    const body: DocumentAnalysisRequest = await request.json();
    const { file, options } = body;

    // Validate file data
    if (!file || !file.data || !file.name) {
      return NextResponse.json(
        { success: false, error: 'Invalid file data' },
        { status: 400 }
      );
    }

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 50MB limit' },
        { status: 413 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/tiff',
      'application/pdf'
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: `Unsupported file type: ${file.type}` },
        { status: 400 }
      );
    }

    // Call Azure Document Intelligence API
    const azureResponse = await fetch(
      `${azureEndpoint}formrecognizer/documentModels/${modelId}:analyze?api-version=2023-07-31`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Ocp-Apim-Subscription-Key': azureApiKey,
        },
        body: JSON.stringify({
          base64Source: file.data
        }),
      }
    );

    if (!azureResponse.ok) {
      const errorText = await azureResponse.text();
      return NextResponse.json(
        { success: false, error: `Azure API error: ${azureResponse.status} - ${errorText}` },
        { status: azureResponse.status }
      );
    }

    // Get operation location for polling
    const operationLocation = azureResponse.headers.get('Operation-Location');
    if (!operationLocation) {
      return NextResponse.json(
        { success: false, error: 'No operation location returned from Azure API' },
        { status: 500 }
      );
    }

    // Poll for results
    const result = await pollForResults(operationLocation, azureApiKey);
    
    // Extract structured data
    const extractedData = extractStructuredData(result, options);

    return NextResponse.json({
      success: true,
      data: extractedData
    });

  } catch (error) {
    console.error('Document analysis error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}

export async function GET(): Promise<NextResponse> {
  // Health check endpoint
  const azureEndpoint = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT;
  const azureApiKey = process.env.AZURE_DOCUMENT_INTELLIGENCE_API_KEY;
  const modelId = process.env.AZURE_DOCUMENT_INTELLIGENCE_MODEL_ID || 'prebuilt-document';

  return NextResponse.json({
    status: 'healthy',
    service: 'document-intelligence',
    azure_configured: !!(azureEndpoint && azureApiKey),
    endpoint: azureEndpoint,
    model_id: modelId,
    capabilities: {
      text_extraction: true,
      table_extraction: true,
      key_value_extraction: true,
      form_analysis: true,
      layout_analysis: true
    },
    supported_file_types: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/tiff',
      'application/pdf'
    ],
    max_file_size_mb: 50
  });
}

/**
 * Polls Azure API for analysis results
 */
async function pollForResults(operationLocation: string, apiKey: string): Promise<any> {
  const maxAttempts = 30; // 30 seconds max
  const pollInterval = 1000; // 1 second

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await fetch(operationLocation, {
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to poll results: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.status === 'succeeded') {
      return result;
    } else if (result.status === 'failed') {
      throw new Error(`Analysis failed: ${result.error?.message || 'Unknown error'}`);
    }

    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  throw new Error('Analysis timed out');
}

/**
 * Extracts structured data from Azure analysis result
 */
function extractStructuredData(result: any, options: any): any {
  const extractedData: any = {};

  try {
    // Extract text content
    if (options.extractText !== false && result.analyzeResult?.content) {
      extractedData.text = result.analyzeResult.content;
    }

    // Extract tables
    if (options.extractTables !== false && result.analyzeResult?.tables) {
      extractedData.tables = result.analyzeResult.tables.map((table: any) => ({
        headers: table.cells
          .filter((cell: any) => cell.rowIndex === 0)
          .map((cell: any) => cell.content),
        rows: extractTableRows(table.cells)
      }));
    }

    // Extract key-value pairs
    if (options.extractKeyValuePairs !== false && result.analyzeResult?.keyValuePairs) {
      extractedData.keyValuePairs = result.analyzeResult.keyValuePairs.map((kvp: any) => ({
        key: kvp.key?.content || '',
        value: kvp.value?.content || '',
        confidence: kvp.confidence || 0
      }));
    }

  } catch (error) {
    console.error('Error extracting structured data:', error);
    // Return basic text if available
    if (result.analyzeResult?.content) {
      extractedData.text = result.analyzeResult.content;
    }
  }

  return extractedData;
}

/**
 * Extracts table rows from Azure table cells
 */
function extractTableRows(cells: any[]): string[][] {
  const maxRow = Math.max(...cells.map(cell => cell.rowIndex));
  const rows: string[][] = [];

  for (let rowIndex = 0; rowIndex <= maxRow; rowIndex++) {
    const rowCells = cells
      .filter(cell => cell.rowIndex === rowIndex)
      .sort((a, b) => a.columnIndex - b.columnIndex);
    
    rows.push(rowCells.map(cell => cell.content));
  }

  return rows;
}
