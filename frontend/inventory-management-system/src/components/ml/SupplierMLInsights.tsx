'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Brain,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Shield,
  Target,
} from 'lucide-react';
import {
  supplierMLService,
  SupplierPredictionResponse,
  SupplierScoreDTO,
} from '@/lib/services/supplierMLService';

interface SupplierMLInsightsProps {
  supplierId: number;
  supplierName?: string;
  className?: string;
}

export default function SupplierMLInsights({
  supplierId,
  supplierName,
  className,
}: SupplierMLInsightsProps) {
  const [prediction, setPrediction] =
    useState<SupplierPredictionResponse | null>(null);
  const [score, setScore] = useState<SupplierScoreDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMLData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [predictionResult, scoreResult] = await Promise.all([
        supplierMLService.predictSupplierPerformance({ supplierId }),
        supplierMLService.getSupplierScore(supplierId),
      ]);

      setPrediction(predictionResult);
      setScore(scoreResult);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load ML insights'
      );
    } finally {
      setLoading(false);
    }
  }, [supplierId]);

  useEffect(() => {
    if (supplierId) {
      loadMLData();
    }
  }, [supplierId, loadMLData]);

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
      icon: AlertTriangle,
    };
  };

  const formatScore = (score: number) => {
    return `${(score * 100).toFixed(1)}%`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className='pt-4'>
          <div className='flex items-center justify-center py-8'>
            <Loader2 className='h-6 w-6 animate-spin text-blue-600' />
            <span className='ml-2 text-gray-600'>Loading ML insights...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Brain className='h-5 w-5 text-blue-600' />
            ML Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant='destructive'>
            <AlertTriangle className='h-4 w-4' />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button
            onClick={loadMLData}
            variant='outline'
            className='mt-2'
            size='sm'
          >
            <RefreshCw className='h-4 w-4 mr-2' />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!prediction && !score) {
    return null;
  }

  const currentScore =
    prediction?.reliability_score || score?.reliabilityScore || 0;
  const risk = getRiskLevel(currentScore);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Brain className='h-5 w-5 text-blue-600' />
            ML Insights
            {supplierName && (
              <span className='text-sm font-normal text-gray-600'>
                for {supplierName}
              </span>
            )}
          </div>
          <Button
            onClick={loadMLData}
            variant='outline'
            size='sm'
            disabled={loading}
          >
            {loading ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <RefreshCw className='h-4 w-4' />
            )}
          </Button>
        </CardTitle>
        <CardDescription>
          AI-powered supplier performance and reliability analysis
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Reliability Score */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='text-center p-4 bg-gray-50 rounded-lg'>
            <div
              className={`text-3xl font-bold ${getScoreColor(currentScore)}`}
            >
              {formatScore(currentScore)}
            </div>
            <div className='text-sm text-gray-600'>Reliability Score</div>
            <Badge
              variant={
                currentScore >= 0.8
                  ? 'default'
                  : currentScore >= 0.6
                    ? 'secondary'
                    : 'destructive'
              }
              className='mt-2'
            >
              {risk.level} RISK
            </Badge>
          </div>

          <div className='space-y-2'>
            <div className='flex items-center gap-2'>
              {(() => {
                const Icon = risk.icon;
                return <Icon className='h-4 w-4' />;
              })()}
              <span className='text-sm font-medium'>Risk Assessment</span>
            </div>
            <div className='text-xs text-gray-600'>
              {prediction?.prediction_time && (
                <>Last updated: {prediction.prediction_time}</>
              )}
              {score?.lastUpdated && !prediction?.prediction_time && (
                <>Last updated: {score.lastUpdated}</>
              )}
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        {prediction?.performance_metrics && (
          <div>
            <h4 className='font-medium mb-3'>Performance Metrics</h4>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
              {prediction.performance_metrics.on_time_delivery_rate && (
                <div className='text-center p-3 bg-green-50 rounded'>
                  <div className='text-lg font-semibold text-green-600'>
                    {formatScore(
                      prediction.performance_metrics.on_time_delivery_rate
                    )}
                  </div>
                  <div className='text-xs text-gray-600'>On-Time Delivery</div>
                </div>
              )}
              {prediction.performance_metrics.defect_rate && (
                <div className='text-center p-3 bg-red-50 rounded'>
                  <div className='text-lg font-semibold text-red-600'>
                    {formatScore(prediction.performance_metrics.defect_rate)}
                  </div>
                  <div className='text-xs text-gray-600'>Defect Rate</div>
                </div>
              )}
              {prediction.performance_metrics.dispute_rate && (
                <div className='text-center p-3 bg-orange-50 rounded'>
                  <div className='text-lg font-semibold text-orange-600'>
                    {formatScore(prediction.performance_metrics.dispute_rate)}
                  </div>
                  <div className='text-xs text-gray-600'>Dispute Rate</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Risk Assessment */}
        {prediction?.risk_assessment && (
          <div>
            <h4 className='font-medium mb-3'>Risk Assessment</h4>
            <div className='space-y-3'>
              {prediction.risk_assessment.risk_factors.length > 0 && (
                <div>
                  <h5 className='text-sm font-medium text-red-600 mb-1'>
                    Risk Factors
                  </h5>
                  <ul className='text-xs text-gray-700 space-y-1'>
                    {prediction.risk_assessment.risk_factors.map(
                      (factor, index) => (
                        <li key={index} className='flex items-start gap-1'>
                          <span className='text-red-500 mt-0.5'>•</span>
                          {factor}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

              {prediction.risk_assessment.recommendations.length > 0 && (
                <div>
                  <h5 className='text-sm font-medium text-green-600 mb-1'>
                    Recommendations
                  </h5>
                  <ul className='text-xs text-gray-700 space-y-1'>
                    {prediction.risk_assessment.recommendations.map(
                      (rec, index) => (
                        <li key={index} className='flex items-start gap-1'>
                          <span className='text-green-500 mt-0.5'>•</span>
                          {rec}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className='pt-2 border-t'>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() =>
                window.open(`/ml-services/supplier-predictions`, '_blank')
              }
            >
              <Target className='h-4 w-4 mr-1' />
              Detailed Analysis
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={loadMLData}
              disabled={loading}
            >
              <RefreshCw className='h-4 w-4 mr-1' />
              Refresh
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
