'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Loader2,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  Upload,
  Download,
  RefreshCw,
  BookOpen,
  Eye,
  Copy,
} from 'lucide-react';
import { translatorService } from '@/lib/services/translatorService';

interface DocumentTranslationResult {
  operation_id: string;
  status: string;
  source_url: string;
  target_language: string;
  created_date_time?: string;
  last_action_date_time?: string;
  summary?: any;
  results?: any[];
  metadata: {
    timestamp: string;
    service: string;
  };
}

interface PDFTranslationResult {
  status: string;
  total_pages: number;
  translated_pages: number;
  source_language: string;
  target_language: string;
  pages: Array<{
    page_number: number;
    original_text: string;
    translated_text: string;
    character_count: number;
  }>;
  combined_translation: string;
  metadata: {
    timestamp: string;
    service: string;
    total_characters: number;
  };
}

interface DocumentTranslatorCardProps {
  onTranslationComplete: (result: DocumentTranslationResult | PDFTranslationResult) => void;
}

const COMMON_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ar', name: 'Arabic' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'it', name: 'Italian' },
  { code: 'hi', name: 'Hindi' },
  { code: 'pl', name: 'Polish' },
  { code: 'tr', name: 'Turkish' },
];

export default function DocumentTranslatorCard({
  onTranslationComplete,
}: DocumentTranslatorCardProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetLanguage, setTargetLanguage] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('auto');
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentOperation, setCurrentOperation] =
    useState<DocumentTranslationResult | null>(null);
  const [operationStatus, setOperationStatus] = useState<string | null>(null);
  const [translationJobs, setTranslationJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [jobDocuments, setJobDocuments] = useState<any[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [pdfTranslationResult, setPdfTranslationResult] = useState<PDFTranslationResult | null>(null);
  const [usePdfTranslation, setUsePdfTranslation] = useState(true);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleTranslate = async () => {
    if (!selectedFile || !targetLanguage) {
      setError('Please select a document and target language');
      return;
    }

    setIsTranslating(true);
    setError(null);
    setPdfTranslationResult(null);

    try {
      // Check if it's a PDF and use PDF translation
      if (usePdfTranslation && selectedFile.type === 'application/pdf') {
        const result = await translatorService.translatePDFDocument(
          selectedFile,
          targetLanguage,
          sourceLanguage !== 'auto' ? sourceLanguage : undefined
        );

        setPdfTranslationResult(result);
        onTranslationComplete(result);
      } else {
        // Use legacy document translation
        const result = await translatorService.translateDocumentUpload(
          selectedFile,
          targetLanguage,
          sourceLanguage !== 'auto' ? sourceLanguage : undefined
        );

        setCurrentOperation(result);
        setOperationStatus(result.status);

        if (result.status === 'accepted') {
          // Start polling for status updates
          pollTranslationStatus(result.operation_id);
        }

        onTranslationComplete(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Translation failed');
    } finally {
      setIsTranslating(false);
    }
  };

  const pollTranslationStatus = async (operationId: string) => {
    const maxAttempts = 30; // Poll for up to 5 minutes (10 seconds * 30)
    let attempts = 0;

    const poll = async () => {
      try {
        const statusResult = await translatorService.checkDocumentTranslationStatus(operationId);
        setOperationStatus(statusResult.status);

        if (
          statusResult.status === 'Succeeded' ||
          statusResult.status === 'Failed'
        ) {
          setCurrentOperation(statusResult);
          return; // Stop polling
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000); // Poll every 10 seconds
        } else {
          setError(
            'Translation is taking longer than expected. Please check the status manually.'
          );
        }
      } catch (err) {
        console.error('Status polling error:', err);
        setError('Failed to check translation status');
      }
    };

    poll();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Succeeded':
        return <CheckCircle className='h-4 w-4 text-green-500' />;
      case 'Failed':
        return <AlertCircle className='h-4 w-4 text-red-500' />;
      case 'Running':
      case 'NotStarted':
        return <Clock className='h-4 w-4 text-blue-500' />;
      default:
        return <Clock className='h-4 w-4 text-gray-500' />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Succeeded':
        return 'bg-green-100 text-green-800';
      case 'Failed':
        return 'bg-red-100 text-red-800';
      case 'Running':
      case 'NotStarted':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const loadTranslationJobs = async () => {
    setIsLoadingJobs(true);
    try {
      const result = await translatorService.getAllTranslationJobs();
      setTranslationJobs(result.jobs);
    } catch (err) {
      setError('Failed to load translation jobs');
    } finally {
      setIsLoadingJobs(false);
    }
  };

  const loadJobDocuments = async (jobId: string) => {
    try {
      const result = await translatorService.getJobDocumentsStatus(jobId);
      setJobDocuments(result.documents);
      setSelectedJob(jobId);
    } catch (err) {
      setError('Failed to load job documents');
    }
  };

  const refreshJobStatus = async (jobId: string) => {
    try {
      const result = await translatorService.getTranslationJobStatus(jobId);
      setTranslationJobs(prev => 
        prev.map(job => job.id === jobId ? { ...job, ...result } : job)
      );
    } catch (err) {
      setError('Failed to refresh job status');
    }
  };

  return (
    <div className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='documentFile'>Select Document</Label>
        <div className='flex items-center gap-4'>
          <Input
            id='documentFile'
            type='file'
            accept='.pdf,.doc,.docx,.txt,.rtf'
            onChange={handleFileSelect}
            disabled={isTranslating}
            className='flex-1'
          />
          {selectedFile && (
            <div className='text-sm text-gray-600'>
              {selectedFile.name} (
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </div>
          )}
        </div>
        <p className='text-xs text-gray-500'>
          Supported formats: PDF, DOC, DOCX, TXT, RTF (Max 50MB)
        </p>
      </div>

      {/* PDF Translation Toggle */}
      {/* <div className='flex items-center space-x-2'>
        <Switch
          checked={usePdfTranslation}
          onCheckedChange={setUsePdfTranslation}
        />
        <Label className='text-sm'>
          Use AI-powered PDF translation (page-by-page with OpenAI)
        </Label>
      </div> */}

      <div className='flex flex-col gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='targetLanguage'>Target Language</Label>
          <Select
            value={targetLanguage}
            onValueChange={setTargetLanguage}
            disabled={isTranslating}
          >
            <SelectTrigger>
              <SelectValue placeholder='Select target language' />
            </SelectTrigger>
            <SelectContent>
              {COMMON_LANGUAGES.map(lang => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name} ({lang.code.toUpperCase()})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='sourceLanguage'>Source Language (Optional)</Label>
          <Select
            value={sourceLanguage}
            onValueChange={setSourceLanguage}
            disabled={isTranslating}
          >
            <SelectTrigger>
              <SelectValue placeholder='Auto-detect source language' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='auto'>Auto-detect</SelectItem>
              {COMMON_LANGUAGES.map(lang => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name} ({lang.code.toUpperCase()})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {error && (
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleTranslate}
          disabled={isTranslating || !selectedFile || !targetLanguage}
          className='w-full'
        >
          {isTranslating ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Translating Document...
            </>
          ) : (
            <>
              <FileText className='mr-2 h-4 w-4' />
              Translate Document
            </>
          )}
        </Button>

        {currentOperation && (
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                {getStatusIcon(operationStatus || currentOperation.status)}
                Translation Status
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='flex items-center gap-2'>
                <Badge
                  className={getStatusColor(
                    operationStatus || currentOperation.status
                  )}
                >
                  {operationStatus || currentOperation.status}
                </Badge>
                <span className='text-sm text-gray-600'>
                  Operation ID: {currentOperation.operation_id}
                </span>
              </div>

              {currentOperation.created_date_time && (
                <div className='text-sm text-gray-600'>
                  <strong>Started:</strong>{' '}
                  {new Date(
                    currentOperation.created_date_time
                  ).toLocaleString()}
                </div>
              )}

              {currentOperation.last_action_date_time && (
                <div className='text-sm text-gray-600'>
                  <strong>Last Update:</strong>{' '}
                  {new Date(
                    currentOperation.last_action_date_time
                  ).toLocaleString()}
                </div>
              )}

              {currentOperation.summary && (
                <div className='text-sm'>
                  <strong>Summary:</strong>
                  <pre className='mt-1 p-2 bg-gray-50 rounded text-xs overflow-auto'>
                    {JSON.stringify(currentOperation.summary, null, 2)}
                  </pre>
                </div>
              )}

              {currentOperation.results &&
                currentOperation.results.length > 0 && (
                  <div className='text-sm'>
                    <strong>Results:</strong>
                    <div className='mt-2 space-y-2'>
                      {currentOperation.results.map((result, index) => (
                        <div key={index} className='p-2 bg-gray-50 rounded'>
                          <div className='font-medium'>{result.status}</div>
                          {result.path && (
                            <div className='text-xs text-gray-600'>
                              Path: {result.path}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </CardContent>
          </Card>
        )}

        {/* PDF Translation Results */}
        {pdfTranslationResult && (
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <BookOpen className='h-4 w-4 text-green-500' />
                PDF Translation Results
              </CardTitle>
              <CardDescription>
                AI-powered page-by-page translation completed
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
                <div className='text-center p-3 bg-blue-50 rounded-lg'>
                  <div className='font-semibold text-blue-600'>{pdfTranslationResult.total_pages}</div>
                  <div className='text-blue-500'>Total Pages</div>
                </div>
                <div className='text-center p-3 bg-green-50 rounded-lg'>
                  <div className='font-semibold text-green-600'>{pdfTranslationResult.translated_pages}</div>
                  <div className='text-green-500'>Translated</div>
                </div>
                <div className='text-center p-3 bg-purple-50 rounded-lg'>
                  <div className='font-semibold text-purple-600'>{pdfTranslationResult.metadata.total_characters}</div>
                  <div className='text-purple-500'>Characters</div>
                </div>
                <div className='text-center p-3 bg-orange-50 rounded-lg'>
                  <div className='font-semibold text-orange-600'>{pdfTranslationResult.target_language.toUpperCase()}</div>
                  <div className='text-orange-500'>Target Lang</div>
                </div>
              </div>

              <Tabs defaultValue='combined' className='w-full'>
                <TabsList className='grid w-full grid-cols-3'>
                  <TabsTrigger value='combined'>Combined Translation</TabsTrigger>
                  <TabsTrigger value='pages'>Page by Page</TabsTrigger>
                  <TabsTrigger value='download'>Download</TabsTrigger>
                </TabsList>
                
                <TabsContent value='combined' className='space-y-4'>
                  <div className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      <Label>Complete Translation</Label>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => {
                          navigator.clipboard.writeText(pdfTranslationResult.combined_translation);
                        }}
                      >
                        <Copy className='h-4 w-4 mr-2' />
                        Copy
                      </Button>
                    </div>
                    <Textarea
                      value={pdfTranslationResult.combined_translation}
                      readOnly
                      className='min-h-[300px] font-mono text-sm'
                      placeholder='Translation will appear here...'
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value='pages' className='space-y-4'>
                  <div className='space-y-4 max-h-96 overflow-y-auto'>
                    {pdfTranslationResult.pages.map((page: any, index: number) => (
                      <div key={index} className='border rounded-lg p-4 space-y-3'>
                        <div className='flex items-center justify-between'>
                          <Badge variant='outline'>Page {page.page_number}</Badge>
                          <span className='text-sm text-gray-500'>{page.character_count} characters</span>
                        </div>
                        
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                          <div className='space-y-2'>
                            <Label className='text-sm font-medium text-gray-600'>Original Text</Label>
                            <Textarea
                              value={page.original_text}
                              readOnly
                              className='min-h-[100px] text-sm'
                              placeholder='Original text...'
                            />
                          </div>
                          <div className='space-y-2'>
                            <Label className='text-sm font-medium text-gray-600'>Translated Text</Label>
                            <Textarea
                              value={page.translated_text}
                              readOnly
                              className='min-h-[100px] text-sm'
                              placeholder='Translated text...'
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value='download' className='space-y-4'>
                  <div className='text-center space-y-4'>
                    <div className='p-6 border-2 border-dashed border-gray-300 rounded-lg'>
                      <Download className='h-12 w-12 mx-auto text-gray-400 mb-4' />
                      <h3 className='text-lg font-medium mb-2'>Download Translation</h3>
                      <p className='text-gray-600 mb-4'>
                        Download the complete translation as a text file
                      </p>
                      <Button
                        onClick={() => {
                          const blob = new Blob([pdfTranslationResult.combined_translation], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `translation_${pdfTranslationResult.target_language}.txt`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                        }}
                        className='w-full'
                      >
                        <Download className='h-4 w-4 mr-2' />
                        Download as Text File
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
