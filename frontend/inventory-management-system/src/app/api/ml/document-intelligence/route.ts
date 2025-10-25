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

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Get Azure configuration from environment variables
    const azureEndpoint = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT;
    const azureApiKey = process.env.AZURE_DOCUMENT_INTELLIGENCE_API_KEY;
    const modelId =
      process.env.AZURE_DOCUMENT_INTELLIGENCE_MODEL_ID || 'prebuilt-document';

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
      'application/pdf',
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
          base64Source: file.data,
        }),
      }
    );

    if (!azureResponse.ok) {
      const errorText = await azureResponse.text();
      return NextResponse.json(
        {
          success: false,
          error: `Azure API error: ${azureResponse.status} - ${errorText}`,
        },
        { status: azureResponse.status }
      );
    }

    // Get operation location for polling
    const operationLocation = azureResponse.headers.get('Operation-Location');
    if (!operationLocation) {
      return NextResponse.json(
        {
          success: false,
          error: 'No operation location returned from Azure API',
        },
        { status: 500 }
      );
    }

    // Poll for results
    const result = await pollForResults(operationLocation, azureApiKey);

    // Extract structured data
    const extractedData = extractStructuredData(result, options);

    return NextResponse.json({
      success: true,
      data: extractedData,
    });
  } catch (error) {
    console.error('Document analysis error:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

export async function GET(): Promise<NextResponse> {
  // Health check endpoint
  const azureEndpoint = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT;
  const azureApiKey = process.env.AZURE_DOCUMENT_INTELLIGENCE_API_KEY;
  const modelId =
    process.env.AZURE_DOCUMENT_INTELLIGENCE_MODEL_ID || 'prebuilt-document';

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
      layout_analysis: true,
    },
    supported_file_types: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/tiff',
      'application/pdf',
    ],
    max_file_size_mb: 50,
  });
}

/**
 * Polls Azure API for analysis results
 */
async function pollForResults(
  operationLocation: string,
  apiKey: string
): Promise<Record<string, unknown>> {
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
      throw new Error(
        `Analysis failed: ${result.error?.message || 'Unknown error'}`
      );
    }

    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  throw new Error('Analysis timed out');
}

/**
 * Extracts structured data from Azure analysis result
 */
function extractStructuredData(
  result: Record<string, unknown>,
  options: Record<string, unknown>
): Record<string, unknown> {
  const extractedData: Record<string, unknown> = {};

  try {
    // Extract text content
    const analyzeResult = result.analyzeResult as Record<string, unknown>;
    if (options.extractText !== false && analyzeResult?.content) {
      extractedData.text = String(analyzeResult.content);
    }

    // Extract tables
    if (options.extractTables !== false && analyzeResult?.tables) {
      const tables = analyzeResult.tables as Array<Record<string, unknown>>;
      extractedData.tables = tables.map(table => {
        const cells = table.cells as Array<Record<string, unknown>>;
        return {
          headers: cells
            .filter(cell => (cell.rowIndex as number) === 0)
            .map(cell => cell.content as string),
          rows: extractTableRows(cells),
        };
      });
    }

    // Extract key-value pairs
    if (
      options.extractKeyValuePairs !== false &&
      analyzeResult?.keyValuePairs
    ) {
      const kvps = analyzeResult.keyValuePairs as Array<
        Record<string, unknown>
      >;
      extractedData.keyValuePairs = kvps.map(kvp => {
        const key = kvp.key as Record<string, unknown> | undefined;
        const value = kvp.value as Record<string, unknown> | undefined;
        return {
          key: (key?.content as string) || '',
          value: (value?.content as string) || '',
          confidence: (kvp.confidence as number) || 0,
        };
      });
    }
  } catch (error) {
    console.error('Error extracting structured data:', error);
    // Return basic text if available
    const analyzeResult = result.analyzeResult as Record<string, unknown>;
    if (analyzeResult?.content) {
      extractedData.text = String(analyzeResult.content);
    }
  }

  return extractedData;
}

/**
 * Extracts table rows from Azure table cells
 */
function extractTableRows(cells: Array<Record<string, unknown>>): string[][] {
  const maxRow = Math.max(...cells.map(cell => cell.rowIndex as number));
  const rows: string[][] = [];

  for (let rowIndex = 0; rowIndex <= maxRow; rowIndex++) {
    const rowCells = cells
      .filter(cell => (cell.rowIndex as number) === rowIndex)
      .sort((a, b) => (a.columnIndex as number) - (b.columnIndex as number));

    rows.push(rowCells.map(cell => cell.content as string));
  }

  return rows;
}
