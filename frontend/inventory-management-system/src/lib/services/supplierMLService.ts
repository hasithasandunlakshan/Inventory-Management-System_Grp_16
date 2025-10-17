import { createAuthenticatedRequestOptions } from '../utils/auth/authUtils';

// Types for ML prediction data
export interface SupplierPredictionRequest {
  supplierId: number;
  customFeatures?: Record<string, unknown>;
}

export interface SupplierPredictionResponse {
  supplier_id: number;
  reliability_score: number;
  features_used: Record<string, unknown>;
  prediction_time: string;
  performance_metrics?: {
    on_time_delivery_rate?: number;
    defect_rate?: number;
    dispute_rate?: number;
  };
  risk_assessment?: {
    risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
    risk_factors: string[];
    recommendations: string[];
  };
}

export interface SupplierScoreDTO {
  supplierId: number;
  reliabilityScore: number;
  lastUpdated: string;
}

export interface MLFeaturesDTO {
  supplier_id: number;
  order_date?: string;
  features: Record<string, unknown>;
}

class SupplierMLService {
  private baseUrl =
    process.env.NEXT_PUBLIC_SUPPLIER_SERVICE_URL || 'http://localhost:8082';

  constructor() {
    console.log('🤖 SupplierMLService initialized with URL:', this.baseUrl);
  }

  /**
   * Get ML features for a supplier
   */
  async getSupplierMLFeatures(
    supplierId: number,
    orderDate?: string
  ): Promise<MLFeaturesDTO> {
    try {
      const queryParams = orderDate ? `?order_date=${orderDate}` : '';
      const url = `${this.baseUrl}/api/suppliers/${supplierId}/ml-features${queryParams}`;

      console.log('🤖 Fetching ML features for supplier:', url);

      const response = await fetch(url, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🤖 ML features fetch error:', errorText);
        throw new Error(
          `Failed to fetch ML features: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const data = await response.json();
      console.log('🤖 ML features fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('🤖 Error fetching ML features:', error);
      throw error;
    }
  }

  /**
   * Get supplier reliability score
   */
  async getSupplierScore(supplierId: number): Promise<SupplierScoreDTO> {
    try {
      const url = `${this.baseUrl}/api/ml/supplier/${supplierId}/score`;

      console.log('🤖 Fetching supplier score:', url);

      const response = await fetch(url, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🤖 Supplier score fetch error:', errorText);
        throw new Error(
          `Failed to fetch supplier score: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const data = await response.json();
      console.log('🤖 Supplier score fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('🤖 Error fetching supplier score:', error);
      throw error;
    }
  }

  /**
   * Predict supplier performance using ML model
   */
  async predictSupplierPerformance(
    request: SupplierPredictionRequest
  ): Promise<SupplierPredictionResponse> {
    try {
      const url = `${this.baseUrl}/api/ml/supplier/${request.supplierId}/predict`;

      console.log('🤖 Predicting supplier performance:', url);

      const response = await fetch(url, {
        ...createAuthenticatedRequestOptions(
          'POST',
          request.customFeatures || {}
        ),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🤖 Supplier prediction error:', errorText);
        throw new Error(
          `Failed to predict supplier performance: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const data = await response.json();
      console.log('🤖 Supplier prediction successful:', data);
      return data;
    } catch (error) {
      console.error('🤖 Error predicting supplier performance:', error);
      throw error;
    }
  }

  /**
   * Get batch predictions for multiple suppliers
   */
  async getBatchPredictions(
    supplierIds: number[]
  ): Promise<SupplierPredictionResponse[]> {
    try {
      console.log('🤖 Getting batch predictions for suppliers:', supplierIds);

      const predictions = await Promise.allSettled(
        supplierIds.map(id =>
          this.predictSupplierPerformance({ supplierId: id })
        )
      );

      const results: SupplierPredictionResponse[] = [];
      predictions.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          console.error(
            `🤖 Failed to get prediction for supplier ${supplierIds[index]}:`,
            result.reason
          );
          // Add fallback prediction
          results.push({
            supplier_id: supplierIds[index],
            reliability_score: 0.5,
            features_used: {},
            prediction_time: new Date().toISOString().split('T')[0],
          });
        }
      });

      console.log('🤖 Batch predictions completed:', results.length);
      return results;
    } catch (error) {
      console.error('🤖 Error getting batch predictions:', error);
      throw error;
    }
  }

  /**
   * Get supplier risk assessment
   */
  async getSupplierRiskAssessment(supplierId: number): Promise<{
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    riskFactors: string[];
    recommendations: string[];
  }> {
    try {
      const prediction = await this.predictSupplierPerformance({ supplierId });
      const score = prediction.reliability_score;

      let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
      const riskFactors: string[] = [];
      const recommendations: string[] = [];

      if (score >= 0.8) {
        riskLevel = 'LOW';
        recommendations.push('Continue current relationship');
        recommendations.push('Consider expanding partnership');
      } else if (score >= 0.6) {
        riskLevel = 'MEDIUM';
        riskFactors.push('Moderate reliability concerns');
        recommendations.push('Monitor performance closely');
        recommendations.push('Set up regular check-ins');
      } else {
        riskLevel = 'HIGH';
        riskFactors.push('Low reliability score');
        riskFactors.push('High risk of delivery issues');
        recommendations.push('Review supplier relationship');
        recommendations.push('Consider alternative suppliers');
        recommendations.push('Implement stricter monitoring');
      }

      return {
        riskLevel,
        riskFactors,
        recommendations,
      };
    } catch (error) {
      console.error('🤖 Error getting risk assessment:', error);
      return {
        riskLevel: 'MEDIUM',
        riskFactors: ['Unable to assess risk'],
        recommendations: ['Contact supplier for more information'],
      };
    }
  }
}

export const supplierMLService = new SupplierMLService();
