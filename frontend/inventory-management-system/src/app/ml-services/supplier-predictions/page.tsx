'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  Users, 
  AlertTriangle, 
  CheckCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import SupplierPredictionCard from '@/components/ml/SupplierPredictionCard';
import { supplierMLService, SupplierPredictionResponse } from '@/lib/services/supplierMLService';
import { supplierService, SupplierDTO } from '@/lib/services/supplierService';

export default function SupplierPredictionsPage() {
  const [suppliers, setSuppliers] = useState<SupplierDTO[]>([]);
  const [predictions, setPredictions] = useState<SupplierPredictionResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSupplier] = useState<number | null>(null);

  // Load suppliers on component mount
  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);
      const supplierData = await supplierService.getAllSuppliers();
      setSuppliers(supplierData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  const handleBatchPrediction = async () => {
    if (suppliers.length === 0) return;

    try {
      setLoading(true);
      setError(null);
      
      const supplierIds = suppliers.map(s => s.supplierId);
      const batchPredictions = await supplierMLService.getBatchPredictions(supplierIds);
      setPredictions(batchPredictions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get batch predictions');
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevel = (score: number) => {
    if (score >= 0.8) return { level: 'LOW', color: 'bg-green-100 text-green-800' };
    if (score >= 0.6) return { level: 'MEDIUM', color: 'bg-yellow-100 text-yellow-800' };
    return { level: 'HIGH', color: 'bg-red-100 text-red-800' };
  };

  const formatScore = (score: number) => {
    return `${(score * 100).toFixed(1)}%`;
  };

  const getSupplierName = (supplierId: number) => {
    const supplier = suppliers.find(s => s.supplierId === supplierId);
    return supplier ? supplier.userName : `Supplier ${supplierId}`;
  };

  const highRiskSuppliers = predictions.filter(p => p.reliability_score < 0.6);
  const mediumRiskSuppliers = predictions.filter(p => p.reliability_score >= 0.6 && p.reliability_score < 0.8);
  const lowRiskSuppliers = predictions.filter(p => p.reliability_score >= 0.8);

  return (
    <div className='space-y-6'>
      <div className='flex items-center space-x-2'>
        <Brain className='h-8 w-8 text-blue-600' />
        <div>
          <h1 className='text-3xl font-bold'>Supplier Predictions</h1>
          <p className='text-gray-600'>
            AI-powered supplier performance and reliability predictions
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="single" className="space-y-4">
        <TabsList>
          <TabsTrigger value="single">Single Prediction</TabsTrigger>
          <TabsTrigger value="batch">Batch Analysis</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Individual Supplier Prediction</CardTitle>
              <CardDescription>
                Get detailed predictions for a specific supplier
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SupplierPredictionCard 
                supplierId={selectedSupplier || undefined}
                onPredictionComplete={(prediction) => {
                  console.log('Prediction completed:', prediction);
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="batch" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Batch Supplier Analysis</span>
                <Button 
                  onClick={handleBatchPrediction} 
                  disabled={loading || suppliers.length === 0}
                  className="flex items-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Analyze All Suppliers
                </Button>
              </CardTitle>
              <CardDescription>
                Get predictions for all suppliers at once
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {lowRiskSuppliers.length}
                      </div>
                      <div className="text-sm text-gray-600">Low Risk</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {mediumRiskSuppliers.length}
                      </div>
                      <div className="text-sm text-gray-600">Medium Risk</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {highRiskSuppliers.length}
                      </div>
                      <div className="text-sm text-gray-600">High Risk</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {predictions.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Supplier Predictions</h3>
                  <div className="grid gap-4">
                    {predictions.map((prediction) => {
                      const risk = getRiskLevel(prediction.reliability_score);
                      return (
                        <Card key={prediction.supplier_id}>
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">
                                  {getSupplierName(prediction.supplier_id)}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  ID: {prediction.supplier_id}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className={`text-lg font-bold ${risk.color.includes('green') ? 'text-green-600' : risk.color.includes('yellow') ? 'text-yellow-600' : 'text-red-600'}`}>
                                  {formatScore(prediction.reliability_score)}
                                </div>
                                <div className={`text-xs px-2 py-1 rounded-full ${risk.color}`}>
                                  {risk.level} RISK
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{suppliers.length}</div>
                  <div className="text-sm text-gray-600">Total Suppliers</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{lowRiskSuppliers.length}</div>
                  <div className="text-sm text-gray-600">Low Risk</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <AlertTriangle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{mediumRiskSuppliers.length}</div>
                  <div className="text-sm text-gray-600">Medium Risk</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{highRiskSuppliers.length}</div>
                  <div className="text-sm text-gray-600">High Risk</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {predictions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Risk Distribution</CardTitle>
                <CardDescription>
                  Overview of supplier risk levels based on ML predictions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {highRiskSuppliers.length > 0 && (
                    <div>
                      <h4 className="font-medium text-red-600 mb-2">High Risk Suppliers</h4>
                      <div className="space-y-2">
                        {highRiskSuppliers.map((prediction) => (
                          <div key={prediction.supplier_id} className="flex items-center justify-between p-2 bg-red-50 rounded">
                            <span>{getSupplierName(prediction.supplier_id)}</span>
                            <span className="text-red-600 font-medium">
                              {formatScore(prediction.reliability_score)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {mediumRiskSuppliers.length > 0 && (
                    <div>
                      <h4 className="font-medium text-yellow-600 mb-2">Medium Risk Suppliers</h4>
                      <div className="space-y-2">
                        {mediumRiskSuppliers.map((prediction) => (
                          <div key={prediction.supplier_id} className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                            <span>{getSupplierName(prediction.supplier_id)}</span>
                            <span className="text-yellow-600 font-medium">
                              {formatScore(prediction.reliability_score)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {lowRiskSuppliers.length > 0 && (
                    <div>
                      <h4 className="font-medium text-green-600 mb-2">Low Risk Suppliers</h4>
                      <div className="space-y-2">
                        {lowRiskSuppliers.map((prediction) => (
                          <div key={prediction.supplier_id} className="flex items-center justify-between p-2 bg-green-50 rounded">
                            <span>{getSupplierName(prediction.supplier_id)}</span>
                            <span className="text-green-600 font-medium">
                              {formatScore(prediction.reliability_score)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
