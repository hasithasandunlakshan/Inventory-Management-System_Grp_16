/**
 * Azure Document Intelligence Service
 *
 * This service provides secure integration with Azure AI Document Intelligence
 * through a backend proxy API route.
 *
 * Security: API keys are stored server-side and never exposed to the client
 */

export interface DocumentAnalysisResult {
  text?: string;
  tables?: Array<{
    rows: string[][];
    headers: string[];
  }>;
  keyValuePairs?: Array<{
    key: string;
    value: string;
    confidence: number;
  }>;
}

export interface AnalysisError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export class DocumentIntelligenceService {
  // Backend API Configuration
  private static readonly API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
  private static readonly DOCUMENT_INTELLIGENCE_ENDPOINT =
    '/api/ml/document-intelligence';

  /**
   * Validates file before processing
   */
  private static validateFile(file: File): void {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/tiff',
      'application/pdf',
    ];

    if (file.size > maxSize) {
      throw new Error('File size exceeds 50MB limit');
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error(
        'Unsupported file type. Please use JPG, PNG, TIFF, or PDF'
      );
    }
  }

  /**
   * Converts file to base64 for secure transmission
   */
  private static async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix to get just the base64 string
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Analyzes document using Azure Document Intelligence
   *
   * Secure backend proxy integration
   */
  public static async analyzeDocument(
    file: File,
    options: {
      extractText?: boolean;
      extractTables?: boolean;
      extractKeyValuePairs?: boolean;
    } = {}
  ): Promise<DocumentAnalysisResult> {
    try {
      // Validate file before processing
      this.validateFile(file);

      // Convert file to base64 for transmission
      const base64Data = await this.fileToBase64(file);

      // Prepare request data
      const requestData = {
        file: {
          name: file.name,
          type: file.type,
          size: file.size,
          data: base64Data,
        },
        options: {
          extractText: options.extractText ?? true,
          extractTables: options.extractTables ?? true,
          extractKeyValuePairs: options.extractKeyValuePairs ?? true,
        },
      };

      // Call secure backend API
      const response = await fetch(
        `${this.API_BASE_URL}${this.DOCUMENT_INTELLIGENCE_ENDPOINT}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Request failed with status ${response.status}`
        );
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Document analysis failed');
      }

      return result.data;
    } catch (error) {
      console.error('Document analysis failed:', error);

      if (error instanceof Error) {
        throw new Error(`Document analysis failed: ${error.message}`);
      }

      throw new Error('An unexpected error occurred during document analysis');
    }
  }

  /**
   * Sanitizes and validates API response
   */
  private static sanitizeResponse(
    result: Record<string, unknown>
  ): DocumentAnalysisResult {
    const sanitized: DocumentAnalysisResult = {};

    // Sanitize text content
    if (result.text && typeof result.text === 'string') {
      sanitized.text = result.text.trim();
    }

    // Sanitize tables
    if (result.tables && Array.isArray(result.tables)) {
      sanitized.tables = result.tables.map((table: unknown) => {
        const t = table as Record<string, unknown>;
        return {
          headers: Array.isArray(t.headers)
            ? t.headers.map((h: unknown) => String(h).trim())
            : [],
          rows: Array.isArray(t.rows)
            ? t.rows.map((row: unknown) =>
                Array.isArray(row)
                  ? row.map((cell: unknown) => String(cell).trim())
                  : []
              )
            : [],
        };
      });
    }

    // Sanitize key-value pairs
    if (result.keyValuePairs && Array.isArray(result.keyValuePairs)) {
      sanitized.keyValuePairs = result.keyValuePairs
        .filter((pair: unknown) => {
          const p = pair as Record<string, unknown>;
          return (
            p &&
            typeof p.key === 'string' &&
            typeof p.value === 'string' &&
            typeof p.confidence === 'number'
          );
        })
        .map((pair: unknown) => {
          const p = pair as Record<string, unknown>;
          return {
            key: String(p.key).trim(),
            value: String(p.value).trim(),
            confidence: Math.max(0, Math.min(1, Number(p.confidence))),
          };
        });
    }

    return sanitized;
  }

  /**
   * Gets supported file types
   */
  public static getSupportedFileTypes(): string[] {
    return [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/tiff',
      'application/pdf',
    ];
  }

  /**
   * Gets maximum file size in bytes
   */
  public static getMaxFileSize(): number {
    return 50 * 1024 * 1024; // 50MB
  }

  /**
   * Checks if file type is supported
   */
  public static isFileTypeSupported(file: File): boolean {
    return this.getSupportedFileTypes().includes(file.type);
  }

  /**
   * Checks if file size is within limits
   */
  public static isFileSizeValid(file: File): boolean {
    return file.size <= this.getMaxFileSize();
  }
}
