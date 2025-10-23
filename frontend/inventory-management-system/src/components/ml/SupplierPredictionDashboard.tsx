'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Brain,
  AlertTriangle,
  CheckCircle,
  Loader2,
  RefreshCw,
  BarChart3,
  PieChart,
} from 'lucide-react';
import {
  supplierMLService,
  SupplierPredictionResponse,
} from '@/lib/services/supplierMLService';
import { supplierService, SupplierDTO } from '@/lib/services/supplierService';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface SupplierPredictionDashboardProps {
  className?: string;
}

export default function SupplierPredictionDashboard({
  className,
}: SupplierPredictionDashboardProps) {
  const [suppliers, setSuppliers] = useState<SupplierDTO[]>([]);
  const [predictions, setPredictions] = useState<SupplierPredictionResponse[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load suppliers and predictions on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [supplierData, supplierIds] = await Promise.all([
        supplierService.getAllSuppliers(),
        supplierService
          .getAllSuppliers()
          .then(suppliers => suppliers.map(s => s.supplierId)),
      ]);

      setSuppliers(supplierData);

      if (supplierIds.length > 0) {
        const batchPredictions =
          await supplierMLService.getBatchPredictions(supplierIds);
        setPredictions(batchPredictions);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getSupplierName = (supplierId: number) => {
    const supplier = suppliers.find(s => s.supplierId === supplierId);
    return supplier ? supplier.userName : `Supplier ${supplierId}`;
  };

  const getRiskLevel = (score: number) => {
    if (score >= 0.8) return { level: 'LOW', color: '#10B981' };
    if (score >= 0.6) return { level: 'MEDIUM', color: '#F59E0B' };
    return { level: 'HIGH', color: '#EF4444' };
  };

  const formatScore = (score: number) => {
    return `${(score * 100).toFixed(1)}%`;
  };

  // Prepare data for charts
  const riskDistribution = predictions.reduce(
    (acc, prediction) => {
      const risk = getRiskLevel(prediction.reliability_score);
      acc[risk.level] = (acc[risk.level] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const pieChartData = [
    { name: 'Low Risk', value: riskDistribution.LOW || 0, color: '#10B981' },
    {
      name: 'Medium Risk',
      value: riskDistribution.MEDIUM || 0,
      color: '#F59E0B',
    },
    { name: 'High Risk', value: riskDistribution.HIGH || 0, color: '#EF4444' },
  ];

  const barChartData = predictions
    .sort((a, b) => b.reliability_score - a.reliability_score)
    .slice(0, 10)
    .map(prediction => ({
      name: getSupplierName(prediction.supplier_id).substring(0, 15) + '...',
      score: prediction.reliability_score * 100,
      risk: getRiskLevel(prediction.reliability_score).level,
    }));

  const averageScore =
    predictions.length > 0
      ? predictions.reduce((sum, p) => sum + p.reliability_score, 0) /
        predictions.length
      : 0;

  const highRiskCount = predictions.filter(
    p => p.reliability_score < 0.6
  ).length;
  const mediumRiskCount = predictions.filter(
    p => p.reliability_score >= 0.6 && p.reliability_score < 0.8
  ).length;
  const lowRiskCount = predictions.filter(
    p => p.reliability_score >= 0.8
  ).length;

  return (
    <div className={`space-y-6 ${className}`}>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-2'>
          <Brain className='h-6 w-6 text-blue-600' />
          <h2 className='text-2xl font-bold'>Supplier Prediction Dashboard</h2>
        </div>
        <Button
          onClick={loadData}
          disabled={loading}
          className='flex items-center gap-2'
        >
          {loading ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <RefreshCw className='h-4 w-4' />
          )}
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant='destructive'>
          <AlertTriangle className='h-4 w-4' />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='pt-4'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-blue-600'>
                {suppliers.length}
              </div>
              <div className='text-sm text-gray-600'>Total Suppliers</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-4'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-green-600'>
                {lowRiskCount}
              </div>
              <div className='text-sm text-gray-600'>Low Risk</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-4'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-yellow-600'>
                {mediumRiskCount}
              </div>
              <div className='text-sm text-gray-600'>Medium Risk</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='pt-4'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-red-600'>
                {highRiskCount}
              </div>
              <div className='text-sm text-gray-600'>High Risk</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Risk Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <PieChart className='h-5 w-5' />
              Risk Distribution
            </CardTitle>
            <CardDescription>
              Distribution of suppliers by risk level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='h-64'>
              <ResponsiveContainer width='100%' height='100%'>
                <RechartsPieChart>
                  <Pie
                    data={pieChartData}
                    cx='50%'
                    cy='50%'
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey='value'
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Suppliers Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <BarChart3 className='h-5 w-5' />
              Top Suppliers by Score
            </CardTitle>
            <CardDescription>
              Top 10 suppliers ranked by reliability score
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='h-64'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis
                    dataKey='name'
                    angle={-45}
                    textAnchor='end'
                    height={80}
                  />
                  <YAxis />
                  <Tooltip formatter={value => [`${value}%`, 'Score']} />
                  <Bar dataKey='score' fill='#3B82F6' />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Risk Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Risk Analysis</CardTitle>
          <CardDescription>
            Comprehensive view of supplier risk levels and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-6'>
            {/* High Risk Suppliers */}
            {highRiskCount > 0 && (
              <div>
                <h4 className='font-medium text-red-600 mb-3 flex items-center gap-2'>
                  <AlertTriangle className='h-4 w-4' />
                  High Risk Suppliers ({highRiskCount})
                </h4>
                <div className='grid gap-3'>
                  {predictions
                    .filter(p => p.reliability_score < 0.6)
                    .sort((a, b) => a.reliability_score - b.reliability_score)
                    .map(prediction => (
                      <div
                        key={prediction.supplier_id}
                        className='flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200'
                      >
                        <div>
                          <div className='font-medium'>
                            {getSupplierName(prediction.supplier_id)}
                          </div>
                          <div className='text-sm text-gray-600'>
                            ID: {prediction.supplier_id}
                          </div>
                        </div>
                        <div className='text-right'>
                          <div className='text-lg font-bold text-red-600'>
                            {formatScore(prediction.reliability_score)}
                          </div>
                          <div className='text-xs text-red-600'>HIGH RISK</div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Medium Risk Suppliers */}
            {mediumRiskCount > 0 && (
              <div>
                <h4 className='font-medium text-yellow-600 mb-3 flex items-center gap-2'>
                  <AlertTriangle className='h-4 w-4' />
                  Medium Risk Suppliers ({mediumRiskCount})
                </h4>
                <div className='grid gap-3'>
                  {predictions
                    .filter(
                      p =>
                        p.reliability_score >= 0.6 && p.reliability_score < 0.8
                    )
                    .sort((a, b) => b.reliability_score - a.reliability_score)
                    .map(prediction => (
                      <div
                        key={prediction.supplier_id}
                        className='flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200'
                      >
                        <div>
                          <div className='font-medium'>
                            {getSupplierName(prediction.supplier_id)}
                          </div>
                          <div className='text-sm text-gray-600'>
                            ID: {prediction.supplier_id}
                          </div>
                        </div>
                        <div className='text-right'>
                          <div className='text-lg font-bold text-yellow-600'>
                            {formatScore(prediction.reliability_score)}
                          </div>
                          <div className='text-xs text-yellow-600'>
                            MEDIUM RISK
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Low Risk Suppliers */}
            {lowRiskCount > 0 && (
              <div>
                <h4 className='font-medium text-green-600 mb-3 flex items-center gap-2'>
                  <CheckCircle className='h-4 w-4' />
                  Low Risk Suppliers ({lowRiskCount})
                </h4>
                <div className='grid gap-3'>
                  {predictions
                    .filter(p => p.reliability_score >= 0.8)
                    .sort((a, b) => b.reliability_score - a.reliability_score)
                    .map(prediction => (
                      <div
                        key={prediction.supplier_id}
                        className='flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200'
                      >
                        <div>
                          <div className='font-medium'>
                            {getSupplierName(prediction.supplier_id)}
                          </div>
                          <div className='text-sm text-gray-600'>
                            ID: {prediction.supplier_id}
                          </div>
                        </div>
                        <div className='text-right'>
                          <div className='text-lg font-bold text-green-600'>
                            {formatScore(prediction.reliability_score)}
                          </div>
                          <div className='text-xs text-green-600'>LOW RISK</div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Summary Statistics</CardTitle>
          <CardDescription>
            Overall performance metrics and insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-blue-600'>
                {formatScore(averageScore)}
              </div>
              <div className='text-sm text-gray-600'>Average Score</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-green-600'>
                {predictions.length > 0
                  ? ((lowRiskCount / predictions.length) * 100).toFixed(1)
                  : 0}
                %
              </div>
              <div className='text-sm text-gray-600'>Low Risk %</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-red-600'>
                {predictions.length > 0
                  ? ((highRiskCount / predictions.length) * 100).toFixed(1)
                  : 0}
                %
              </div>
              <div className='text-sm text-gray-600'>High Risk %</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
