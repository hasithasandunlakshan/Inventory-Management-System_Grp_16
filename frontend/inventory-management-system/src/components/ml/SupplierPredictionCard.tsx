'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  Loader2,
  AlertCircle,
  Shield,
  AlertTriangle,
} from 'lucide-react';
import {
  supplierMLService,
  SupplierPredictionResponse,
} from '@/lib/services/supplierMLService';

interface SupplierPredictionCardProps {
  supplierId?: number;
  onPredictionComplete?: (prediction: SupplierPredictionResponse) => void;
}

export default function SupplierPredictionCard({
  supplierId: initialSupplierId,
  onPredictionComplete,
}: SupplierPredictionCardProps) {
  const [supplierId, setSupplierId] = useState<number | ''>(
    initialSupplierId || ''
  );
  const [prediction, setPrediction] =
    useState<SupplierPredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePredict = async () => {
    if (!supplierId) {
      setError('Please enter a supplier ID');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get both prediction and score
      const [predictionResult] = await Promise.all([
        supplierMLService.predictSupplierPerformance({
          supplierId: Number(supplierId),
        }),
        supplierMLService.getSupplierScore(Number(supplierId)),
      ]);

      setPrediction(predictionResult);

      if (onPredictionComplete) {
        onPredictionComplete(predictionResult);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get prediction');
    } finally {
      setLoading(false);
    }
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 0.8) return 'default';
    if (score >= 0.6) return 'secondary';
    return 'destructive';
  };

  const getRiskLevel = (score: number) => {
    if (score >= 0.8)
      return {
        level: 'LOW',
        color: 'bg-green-100 text-green-800',
        icon: Shield,
      };
    if (score >= 0.6)
      return {
        level: 'MEDIUM',
        color: 'bg-yellow-100 text-yellow-800',
        icon: AlertTriangle,
      };
    return {
      level: 'HIGH',
      color: 'bg-red-100 text-red-800',
      icon: AlertCircle,
    };
  };

  const formatScore = (score: number) => {
    return `${(score * 100).toFixed(1)}%`;
  };

  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Brain className='h-5 w-5 text-blue-600' />
          Supplier Performance Prediction
        </CardTitle>
        <CardDescription>
          Get AI-powered predictions for supplier reliability and performance
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='supplier-id'>Supplier ID</Label>
          <div className='flex gap-2'>
            <Input
              id='supplier-id'
              type='number'
              placeholder='Enter supplier ID'
              value={supplierId}
              onChange={e =>
                setSupplierId(e.target.value ? Number(e.target.value) : '')
              }
              disabled={loading}
            />
            <Button onClick={handlePredict} disabled={loading || !supplierId}>
              {loading ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                'Predict'
              )}
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {prediction && (
          <div className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* Reliability Score */}
              <Card>
                <CardContent className='pt-4'>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-blue-600'>
                      {formatScore(prediction.reliability_score)}
                    </div>
                    <div className='text-sm text-gray-600'>
                      Reliability Score
                    </div>
                    <Badge
                      variant={getScoreBadgeVariant(
                        prediction.reliability_score
                      )}
                      className='mt-2'
                    >
                      {getRiskLevel(prediction.reliability_score).level} RISK
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Risk Assessment */}
              <Card>
                <CardContent className='pt-4'>
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2'>
                      {(() => {
                        const risk = getRiskLevel(prediction.reliability_score);
                        const Icon = risk.icon;
                        return (
                          <>
                            <Icon className='h-4 w-4' />
                            <span
                              className={`text-sm font-medium px-2 py-1 rounded ${risk.color}`}
                            >
                              {risk.level} RISK
                            </span>
                          </>
                        );
                      })()}
                    </div>
                    <div className='text-xs text-gray-600'>
                      Predicted on {prediction.prediction_time}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Metrics */}
            {prediction.performance_metrics && (
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    {prediction.performance_metrics.on_time_delivery_rate && (
                      <div className='text-center'>
                        <div className='text-lg font-semibold text-green-600'>
                          {formatScore(
                            prediction.performance_metrics.on_time_delivery_rate
                          )}
                        </div>
                        <div className='text-sm text-gray-600'>
                          On-Time Delivery
                        </div>
                      </div>
                    )}
                    {prediction.performance_metrics.defect_rate && (
                      <div className='text-center'>
                        <div className='text-lg font-semibold text-red-600'>
                          {formatScore(
                            prediction.performance_metrics.defect_rate
                          )}
                        </div>
                        <div className='text-sm text-gray-600'>Defect Rate</div>
                      </div>
                    )}
                    {prediction.performance_metrics.dispute_rate && (
                      <div className='text-center'>
                        <div className='text-lg font-semibold text-orange-600'>
                          {formatScore(
                            prediction.performance_metrics.dispute_rate
                          )}
                        </div>
                        <div className='text-sm text-gray-600'>
                          Dispute Rate
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Risk Assessment Details */}
            {prediction.risk_assessment && (
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>Risk Assessment</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {prediction.risk_assessment.risk_factors.length > 0 && (
                    <div>
                      <h4 className='font-medium text-red-600 mb-2'>
                        Risk Factors
                      </h4>
                      <ul className='list-disc list-inside space-y-1'>
                        {prediction.risk_assessment.risk_factors.map(
                          (factor, index) => (
                            <li key={index} className='text-sm text-gray-700'>
                              {factor}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                  {prediction.risk_assessment.recommendations.length > 0 && (
                    <div>
                      <h4 className='font-medium text-green-600 mb-2'>
                        Recommendations
                      </h4>
                      <ul className='list-disc list-inside space-y-1'>
                        {prediction.risk_assessment.recommendations.map(
                          (rec, index) => (
                            <li key={index} className='text-sm text-gray-700'>
                              {rec}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Features Used */}
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Features Used</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-sm text-gray-600'>
                  <pre className='bg-gray-50 p-3 rounded overflow-x-auto'>
                    {JSON.stringify(prediction.features_used, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
