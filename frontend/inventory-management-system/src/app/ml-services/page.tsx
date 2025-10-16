'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, FileImage, ArrowRight, Sparkles, Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import SupplierPredictionCard from '@/components/ml/SupplierPredictionCard';

export default function MLServicesPage() {
  const features = [
    {
      title: 'Document Intelligence',
      description: 'Extract text, tables, and structured data from documents using Azure AI',
      icon: FileImage,
      href: '/ml-services/document-intelligence',
      color: 'bg-blue-500',
      features: [
        'Invoice processing',
        'Receipt analysis',
        'Form data extraction',
        'Table recognition'
      ]
    },
    {
      title: 'Supplier Predictions',
      description: 'AI-powered supplier performance and reliability predictions',
      icon: Users,
      href: '/ml-services/supplier-predictions',
      color: 'bg-green-500',
      features: [
        'Reliability scoring',
        'Risk assessment',
        'Performance predictions',
        'Delivery forecasting'
      ]
    },
    {
      title: 'AI Search',
      description: 'Intelligent search across all your data using Azure Cognitive Search',
      icon: TrendingUp,
      href: '/ml-services/ai-search',
      color: 'bg-purple-500',
      features: [
        'Semantic search',
        'Multi-entity search',
        'Faceted filtering',
        'Real-time indexing'
      ]
    },
  ];

  return (
    <div className='space-y-6'>
      <div className='flex items-center space-x-2'>
        <Brain className='h-8 w-8 text-blue-600' />
        <div>
          <h1 className='text-3xl font-bold'>ML Services</h1>
          <p className='text-gray-600'>
            Leverage AI and machine learning to automate document processing and gain insights
          </p>
        </div>
      </div>

      <div className='grid gap-6 md:grid-cols-1 lg:grid-cols-2'>
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card key={index} className='hover:shadow-lg transition-shadow duration-200'>
              <CardHeader>
                <div className='flex items-center space-x-3'>
                  <div className={`p-2 rounded-lg ${feature.color} text-white`}>
                    <Icon className='h-6 w-6' />
                  </div>
                  <div>
                    <CardTitle className='text-xl'>{feature.title}</CardTitle>
                    <CardDescription className='text-sm'>
                      {feature.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  <div className='flex flex-wrap gap-2'>
                    {feature.features.map((item, idx) => (
                      <span
                        key={idx}
                        className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'
                      >
                        <Sparkles className='h-3 w-3 mr-1' />
                        {item}
                      </span>
                    ))}
                  </div>
                  <Link href={feature.href}>
                    <Button className='w-full group'>
                      Explore {feature.title}
                      <ArrowRight className='ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform' />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Preview Section */}
      <div className='mt-8'>
        <h2 className='text-2xl font-bold mb-4'>Quick Preview</h2>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <SupplierPredictionCard />
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Brain className='h-5 w-5 text-blue-600' />
                ML Services Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-gray-600 mb-4'>
                Our ML services provide intelligent insights and automation for your inventory management system.
              </p>
              <div className='space-y-2'>
                <div className='flex items-center gap-2'>
                  <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                  <span className='text-sm'>Document Intelligence - Active</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                  <span className='text-sm'>Supplier Predictions - Active</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                  <span className='text-sm'>AI Search - Active</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className='bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <Brain className='h-5 w-5 text-blue-600' />
            <span>AI-Powered Automation</span>
          </CardTitle>
          <CardDescription>
            Our ML services are built on Azure AI services, providing enterprise-grade security and reliability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-3'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-blue-600'>99.9%</div>
              <div className='text-sm text-gray-600'>Uptime SLA</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-blue-600'>256-bit</div>
              <div className='text-sm text-gray-600'>Encryption</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-blue-600'>SOC 2</div>
              <div className='text-sm text-gray-600'>Compliant</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
