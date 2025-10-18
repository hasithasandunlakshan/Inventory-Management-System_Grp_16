/**
 * Azure Translator Service
 * Provides integration with Azure Translator API for text and document translation
 */

export interface TranslationRequest {
  text: string;
  target_language: string;
  source_language?: string;
}

export interface TranslationResponse {
  original_text: string;
  translated_text: string;
  source_language: string;
  target_language: string;
  timestamp: string;
  confidence?: number;
}

export interface DocumentTranslationRequest {
  source_url: string;
  target_language: string;
  source_language?: string;
}

export interface BatchTranslationRequest {
  texts: string[];
  target_language: string;
  source_language?: string;
}

export interface BatchTranslationInput {
  source: Record<string, string>;
  targets: Array<Record<string, string>>;
}

export interface DocumentBatchTranslationRequest {
  inputs: BatchTranslationInput[];
}

export interface TranslationJob {
  id: string;
  status: string;
  created_date_time?: string;
  last_action_date_time?: string;
  summary?: Record<string, any>;
  results?: any[];
}

export interface DocumentStatus {
  job_id: string;
  document_id: string;
  status: string;
  source_url?: string;
  target_url?: string;
  characters_charged?: number;
  metadata: {
    timestamp: string;
    service: string;
  };
}

export interface SupportedLanguages {
  supported_languages: string[];
  total_count: number;
  common_languages: Record<string, string>;
  usage_examples: Record<string, string>;
}

export interface HealthCheck {
  service: string;
  status: string;
  validation: any;
  endpoints: Record<string, string>;
}

export class TranslatorService {
  private baseUrl: string;

  constructor() {
    this.baseUrl =
      process.env.NEXT_PUBLIC_ML_SERVICE_URL || 'http://localhost:8081';
  }

  /**
   * Translate a single text
   */
  async translateText(
    request: TranslationRequest
  ): Promise<TranslationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/translate/text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Translation failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Translation error:', error);
      throw error;
    }
  }

  /**
   * Translate multiple texts in batch
   */
  async translateTextBatch(request: BatchTranslationRequest): Promise<{
    translations: TranslationResponse[];
    total_count: number;
    target_language: string;
    timestamp: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/translate/text/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Batch translation failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Batch translation error:', error);
      throw error;
    }
  }

  /**
   * Synchronously translate a single document
   */
  async translateDocumentSync(request: DocumentTranslationRequest): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/translate/document/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Synchronous document translation failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Synchronous document translation error:', error);
      throw error;
    }
  }

  /**
   * Start a batch document translation job
   */
  async startBatchDocumentTranslation(request: DocumentBatchTranslationRequest): Promise<{
    status: string;
    job_id: string;
    operation_location?: string;
    message: string;
    metadata: {
      timestamp: string;
      service: string;
    };
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/translate/document/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Batch document translation failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Batch document translation error:', error);
      throw error;
    }
  }

  /**
   * Get all translation jobs
   */
  async getAllTranslationJobs(): Promise<{
    jobs: TranslationJob[];
    count: number;
    metadata: {
      timestamp: string;
      service: string;
    };
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/translate/document/jobs`);

      if (!response.ok) {
        throw new Error(`Failed to get translation jobs: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get translation jobs error:', error);
      throw error;
    }
  }

  /**
   * Get status of a specific translation job
   */
  async getTranslationJobStatus(jobId: string): Promise<{
    job_id: string;
    status: string;
    created_date_time?: string;
    last_action_date_time?: string;
    summary?: Record<string, any>;
    results?: any[];
    metadata: {
      timestamp: string;
      service: string;
    };
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/translate/document/jobs/${jobId}`);

      if (!response.ok) {
        throw new Error(`Failed to get job status: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get job status error:', error);
      throw error;
    }
  }

  /**
   * Get status of all documents in a translation job
   */
  async getJobDocumentsStatus(jobId: string): Promise<{
    job_id: string;
    documents: any[];
    count: number;
    metadata: {
      timestamp: string;
      service: string;
    };
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/translate/document/jobs/${jobId}/documents`);

      if (!response.ok) {
        throw new Error(`Failed to get job documents status: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get job documents status error:', error);
      throw error;
    }
  }

  /**
   * Get status of a specific document in a job
   */
  async getDocumentStatus(jobId: string, documentId: string): Promise<DocumentStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/translate/document/jobs/${jobId}/documents/${documentId}`);

      if (!response.ok) {
        throw new Error(`Failed to get document status: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get document status error:', error);
      throw error;
    }
  }

  /**
   * Upload and translate a document (legacy method)
   */
  async translateDocumentUpload(
    file: File,
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('target_language', targetLanguage);
      if (sourceLanguage) {
        formData.append('source_language', sourceLanguage);
      }

      const response = await fetch(`${this.baseUrl}/translate/document`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Document upload translation failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Document upload translation error:', error);
      throw error;
    }
  }

  /**
   * Translate PDF document page by page using OpenAI
   */
  async translatePDFDocument(
    file: File,
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<{
    status: string;
    total_pages: number;
    translated_pages: number;
    source_language: string;
    target_language: string;
    pages: Array<{
      page_number: number;
      original_text: string;
      translated_text: string;
      character_count: number;
    }>;
    combined_translation: string;
    metadata: {
      timestamp: string;
      service: string;
      total_characters: number;
    };
  }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('target_language', targetLanguage);
      if (sourceLanguage) {
        formData.append('source_language', sourceLanguage);
      }

      const response = await fetch(`${this.baseUrl}/translate/document/pdf`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`PDF document translation failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('PDF document translation error:', error);
      throw error;
    }
  }

  /**
   * Check document translation status (legacy method)
   */
  async checkDocumentTranslationStatus(operationId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/translate/document/status/${operationId}`);

      if (!response.ok) {
        throw new Error(`Failed to check document status: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Check document status error:', error);
      throw error;
    }
  }

  /**
   * Get supported languages
   */
  async getSupportedLanguages(): Promise<SupportedLanguages> {
    try {
      const response = await fetch(`${this.baseUrl}/translate/languages`);

      if (!response.ok) {
        throw new Error(`Failed to get languages: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get languages error:', error);
      throw error;
    }
  }

  /**
   * Health check for translator service
   */
  async healthCheck(): Promise<HealthCheck> {
    try {
      const response = await fetch(`${this.baseUrl}/translate/health`);

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Health check error:', error);
      throw error;
    }
  }

  /**
   * Detect language of text
   */
  async detectLanguage(text: string): Promise<{
    text: string;
    detected_language: string;
    confidence: number;
    timestamp: string;
  }> {
    try {
      const formData = new FormData();
      formData.append('text', text);

      const response = await fetch(`${this.baseUrl}/translate/detect`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Language detection failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Language detection error:', error);
      throw error;
    }
  }

  /**
   * Get common language options for UI
   */
  getCommonLanguageOptions(): Array<{ value: string; label: string }> {
    return [
      { value: 'en', label: 'English' },
      { value: 'es', label: 'Spanish' },
      { value: 'fr', label: 'French' },
      { value: 'de', label: 'German' },
      { value: 'zh-Hans', label: 'Chinese (Simplified)' },
      { value: 'ja', label: 'Japanese' },
      { value: 'ko', label: 'Korean' },
      { value: 'ar', label: 'Arabic' },
      { value: 'pt', label: 'Portuguese' },
      { value: 'ru', label: 'Russian' },
      { value: 'it', label: 'Italian' },
      { value: 'nl', label: 'Dutch' },
      { value: 'pl', label: 'Polish' },
      { value: 'tr', label: 'Turkish' },
      { value: 'hi', label: 'Hindi' },
    ];
  }

  /**
   * Translate supplier-related content
   */
  async translateSupplierContent(
    content: string,
    targetLanguage: string
  ): Promise<TranslationResponse> {
    return this.translateText({
      text: content,
      target_language: targetLanguage,
      source_language: 'en', // Assuming supplier content is in English
    });
  }

  /**
   * Translate product descriptions
   */
  async translateProductDescription(
    description: string,
    targetLanguage: string
  ): Promise<TranslationResponse> {
    return this.translateText({
      text: description,
      target_language: targetLanguage,
    });
  }

  /**
   * Translate order-related content
   */
  async translateOrderContent(
    content: string,
    targetLanguage: string
  ): Promise<TranslationResponse> {
    return this.translateText({
      text: content,
      target_language: targetLanguage,
    });
  }
}

// Export singleton instance
export const translatorService = new TranslatorService();
