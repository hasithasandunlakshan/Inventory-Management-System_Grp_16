'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileImage, 
  Upload, 
  Download, 
  Eye, 
  Trash2, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Table,
  Image as ImageIcon,
  Languages
} from 'lucide-react';
import { DocumentIntelligenceService } from '@/lib/services/documentIntelligenceService';
import DocumentTranslatorCard from '@/components/ml/DocumentTranslatorCard';
import { TranslationResponse } from '@/lib/services/translatorService';
import { Badge } from '@/components/ui/badge';

interface ExtractedData {
  text?: string;
  tables?: Array<{
    rows: string[][];
    headers: string[];
  }>;
  keyValuePairs?: Array<{
    key: string;
    value: string;
    confidence: number;
  }>;
}

export default function DocumentIntelligencePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [translations, setTranslations] = useState<(TranslationResponse | unknown)[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setExtractedData(null);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setError(null);
      setExtractedData(null);
      
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const processDocument = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);

    try {
      const result = await DocumentIntelligenceService.analyzeDocument(selectedFile);
      setExtractedData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process document');
    } finally {
      setIsProcessing(false);
    }
  };

  const clearAll = () => {
    setSelectedFile(null);
    setExtractedData(null);
    setError(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadResults = () => {
    if (!extractedData) return;

    const dataStr = JSON.stringify(extractedData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'extracted-data.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center space-x-2'>
        <FileImage className='h-8 w-8 text-blue-600' />
        <div>
          <h1 className='text-3xl font-bold'>Document Intelligence</h1>
          <p className='text-gray-600'>
            Extract text, tables, and structured data from documents using Azure AI
          </p>
        </div>
      </div>

      <Tabs defaultValue="document" className="space-y-4">
        <TabsList>
          <TabsTrigger value="document">Document Analysis</TabsTrigger>
          <TabsTrigger value="translation">Translation</TabsTrigger>
        </TabsList>

        <TabsContent value="document" className="space-y-4">
          <div className='grid gap-6 lg:grid-cols-2'>
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center space-x-2'>
              <Upload className='h-5 w-5' />
              <span>Upload Document</span>
            </CardTitle>
            <CardDescription>
              Upload images or PDFs to extract text, tables, and key-value pairs
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div
              className='border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer'
              onDrop={handleFileDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <FileImage className='h-12 w-12 mx-auto text-gray-400 mb-4' />
              <p className='text-sm text-gray-600 mb-2'>
                Drag and drop your document here, or click to browse
              </p>
              <p className='text-xs text-gray-500'>
                Supports: JPG, PNG, PDF (max 50MB)
              </p>
            </div>

            <Input
              ref={fileInputRef}
              type='file'
              accept='image/*,.pdf'
              onChange={handleFileSelect}
              className='hidden'
            />

            {selectedFile && (
              <div className='space-y-2'>
                <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                  <div className='flex items-center space-x-2'>
                    <FileText className='h-4 w-4 text-blue-600' />
                    <span className='text-sm font-medium'>{selectedFile.name}</span>
                    <span className='text-xs text-gray-500'>
                      ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={clearAll}
                    className='text-red-600 hover:text-red-700'
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </div>

                {previewUrl && (
                  <div className='mt-4'>
                    <Label className='text-sm font-medium'>Preview</Label>
                    <div className='mt-2 border rounded-lg overflow-hidden'>
                      <Image
                        src={previewUrl}
                        alt='Document preview'
                        width={400}
                        height={192}
                        className='w-full h-48 object-contain bg-gray-50'
                      />
                    </div>
                  </div>
                )}

                <Button
                  onClick={processDocument}
                  disabled={isProcessing}
                  className='w-full'
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Eye className='mr-2 h-4 w-4' />
                      Analyze Document
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center space-x-2'>
              <FileText className='h-5 w-5' />
              <span>Extracted Data</span>
            </CardTitle>
            <CardDescription>
              View and download the extracted information
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className='mb-4 border-red-200 bg-red-50'>
                <AlertCircle className='h-4 w-4 text-red-600' />
                <AlertDescription className='text-red-800'>
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {extractedData ? (
              <div className='space-y-4'>
                <div className='flex justify-between items-center'>
                  <div className='flex items-center space-x-2 text-green-600'>
                    <CheckCircle className='h-4 w-4' />
                    <span className='text-sm font-medium'>Analysis Complete</span>
                  </div>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={downloadResults}
                  >
                    <Download className='h-4 w-4 mr-2' />
                    Download JSON
                  </Button>
                </div>

                <Tabs defaultValue='text' className='w-full'>
                  <TabsList className='grid w-full grid-cols-3'>
                    <TabsTrigger value='text'>Text</TabsTrigger>
                    <TabsTrigger value='tables'>Tables</TabsTrigger>
                    <TabsTrigger value='keyvalue'>Key-Value</TabsTrigger>
                  </TabsList>

                  <TabsContent value='text' className='mt-4'>
                    <div className='bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto'>
                      <pre className='text-sm whitespace-pre-wrap'>
                        {extractedData.text || 'No text extracted'}
                      </pre>
                    </div>
                  </TabsContent>

                  <TabsContent value='tables' className='mt-4'>
                    <div className='space-y-4 max-h-64 overflow-y-auto'>
                      {extractedData.tables?.length ? (
                        extractedData.tables.map((table, index) => (
                          <div key={index} className='border rounded-lg overflow-hidden'>
                            <div className='bg-gray-100 px-4 py-2 font-medium text-sm'>
                              Table {index + 1}
                            </div>
                            <div className='overflow-x-auto'>
                              <table className='w-full text-sm'>
                                <thead className='bg-gray-50'>
                                  <tr>
                                    {table.headers.map((header, i) => (
                                      <th key={i} className='px-3 py-2 text-left font-medium'>
                                        {header}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {table.rows.map((row, i) => (
                                    <tr key={i} className='border-t'>
                                      {row.map((cell, j) => (
                                        <td key={j} className='px-3 py-2'>
                                          {cell}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className='text-center text-gray-500 py-8'>
                          <Table className='h-8 w-8 mx-auto mb-2 text-gray-400' />
                          <p>No tables found</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value='keyvalue' className='mt-4'>
                    <div className='space-y-2 max-h-64 overflow-y-auto'>
                      {extractedData.keyValuePairs?.length ? (
                        extractedData.keyValuePairs.map((pair, index) => (
                          <div key={index} className='flex justify-between items-center p-3 bg-gray-50 rounded-lg'>
                            <div>
                              <div className='font-medium text-sm'>{pair.key}</div>
                              <div className='text-sm text-gray-600'>{pair.value}</div>
                            </div>
                            <div className='text-xs text-gray-500'>
                              {Math.round(pair.confidence * 100)}%
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className='text-center text-gray-500 py-8'>
                          <FileText className='h-8 w-8 mx-auto mb-2 text-gray-400' />
                          <p>No key-value pairs found</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <div className='text-center text-gray-500 py-12'>
                <ImageIcon className='h-12 w-12 mx-auto mb-4 text-gray-400' />
                <p>Upload a document to see extracted data here</p>
              </div>
            )}
          </CardContent>
        </Card>
          </div>
        </TabsContent>

                <TabsContent value="translation" className="space-y-4">
                  <div className="grid grid-cols-1 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Languages className="h-5 w-5" />
                          Document Translation
                        </CardTitle>
                        <CardDescription>
                          Translate entire documents using Azure Document Translation service
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <DocumentTranslatorCard 
                          onTranslationComplete={(translation) => {
                            setTranslations(prev => [...prev, translation]);
                          }}
                        />
                      </CardContent>
                    </Card>
                  </div>
          
          {translations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Languages className="h-5 w-5" />
                  Recent Translations
                </CardTitle>
                <CardDescription>
                  History of your recent translations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {translations.slice(-5).reverse().map((translation: any, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded border">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">
                          {translation.source_language} → {translation.target_language}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(translation.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-700">
                          <strong>Original:</strong> {translation.original_text}
                        </p>
                        <p className="text-sm text-gray-900 font-medium">
                          <strong>Translated:</strong> {translation.translated_text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
