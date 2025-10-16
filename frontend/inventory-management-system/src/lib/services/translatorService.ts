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
   * Translate a document
   */
  async translateDocument(request: DocumentTranslationRequest): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/translate/document`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Document translation failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Document translation error:', error);
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
