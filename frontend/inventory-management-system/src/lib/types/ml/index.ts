// Machine Learning related type definitions

export interface SearchFilters {
  categories?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  inStock?: boolean;
  dateRange?: {
    from: string;
    to: string;
  };
}

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  score: number;
  highlights?: Record<string, string[]>;
  metadata?: Record<string, unknown>;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  pageSize: number;
  facets?: Record<string, Array<{ value: string; count: number }>>;
}

export interface DocumentField {
  name: string;
  value: string | number;
  confidence?: number;
}

export interface DocumentAnalysisResult {
  fields: DocumentField[];
  tables?: Array<{
    rows: number;
    columns: number;
    cells: Array<{ row: number; column: number; text: string }>;
  }>;
  confidence: number;
}

export interface TranslationRequest {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export interface TranslationResponse {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  confidence: number;
}

export interface SupplierPrediction {
  supplierId: number;
  supplierName: string;
  score: number;
  factors: Record<string, number>;
  recommendation: string;
}
