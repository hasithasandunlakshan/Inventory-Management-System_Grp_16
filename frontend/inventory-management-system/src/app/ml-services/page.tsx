'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, FileImage, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

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
