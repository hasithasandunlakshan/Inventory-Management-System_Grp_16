'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, FileText, CheckCircle, AlertCircle, Clock } from 'lucide-react';

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

interface DocumentTranslatorCardProps {
  onTranslationComplete: (result: DocumentTranslationResult) => void;
}

const COMMON_LANGUAGES = [
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
  { code: 'tr', name: 'Turkish' }
];

export default function DocumentTranslatorCard({ onTranslationComplete }: DocumentTranslatorCardProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetLanguage, setTargetLanguage] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('auto');
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentOperation, setCurrentOperation] = useState<DocumentTranslationResult | null>(null);
  const [operationStatus, setOperationStatus] = useState<string | null>(null);

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

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('target_language', targetLanguage);
      if (sourceLanguage !== 'auto') {
        formData.append('source_language', sourceLanguage);
      }

      const response = await fetch('/api/ml/translate/document', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Translation failed');
      }

      const result: DocumentTranslationResult = await response.json();
      setCurrentOperation(result);
      setOperationStatus(result.status);
      
      if (result.status === 'accepted') {
        // Start polling for status updates
        pollTranslationStatus(result.operation_id);
      }

      onTranslationComplete(result);
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
        const response = await fetch(`/api/ml/translate/document/status/${operationId}`);
        
        if (response.ok) {
          const statusResult = await response.json();
          setOperationStatus(statusResult.status);
          
          if (statusResult.status === 'Succeeded' || statusResult.status === 'Failed') {
            setCurrentOperation(statusResult);
            return; // Stop polling
          }
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000); // Poll every 10 seconds
        } else {
          setError('Translation is taking longer than expected. Please check the status manually.');
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
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'Running':
      case 'NotStarted':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
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

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="documentFile">Select Document</Label>
        <div className="flex items-center gap-4">
          <Input
            id="documentFile"
            type="file"
            accept=".pdf,.doc,.docx,.txt,.rtf"
            onChange={handleFileSelect}
            disabled={isTranslating}
            className="flex-1"
          />
          {selectedFile && (
            <div className="text-sm text-gray-600">
              {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500">
          Supported formats: PDF, DOC, DOCX, TXT, RTF (Max 50MB)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="targetLanguage">Target Language</Label>
          <Select value={targetLanguage} onValueChange={setTargetLanguage} disabled={isTranslating}>
            <SelectTrigger>
              <SelectValue placeholder="Select target language" />
            </SelectTrigger>
            <SelectContent>
              {COMMON_LANGUAGES.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name} ({lang.code.toUpperCase()})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

      <div className="space-y-2">
        <Label htmlFor="sourceLanguage">Source Language (Optional)</Label>
        <Select value={sourceLanguage} onValueChange={setSourceLanguage} disabled={isTranslating}>
          <SelectTrigger>
            <SelectValue placeholder="Auto-detect source language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">Auto-detect</SelectItem>
            {COMMON_LANGUAGES.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                {lang.name} ({lang.code.toUpperCase()})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button 
        onClick={handleTranslate} 
        disabled={isTranslating || !selectedFile || !targetLanguage}
        className="w-full"
      >
        {isTranslating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Translating Document...
          </>
        ) : (
          <>
            <FileText className="mr-2 h-4 w-4" />
            Translate Document
          </>
        )}
      </Button>

      {currentOperation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(operationStatus || currentOperation.status)}
              Translation Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(operationStatus || currentOperation.status)}>
                {operationStatus || currentOperation.status}
              </Badge>
              <span className="text-sm text-gray-600">
                Operation ID: {currentOperation.operation_id}
              </span>
            </div>

            {currentOperation.created_date_time && (
              <div className="text-sm text-gray-600">
                <strong>Started:</strong> {new Date(currentOperation.created_date_time).toLocaleString()}
              </div>
            )}

            {currentOperation.last_action_date_time && (
              <div className="text-sm text-gray-600">
                <strong>Last Update:</strong> {new Date(currentOperation.last_action_date_time).toLocaleString()}
              </div>
            )}

            {currentOperation.summary && (
              <div className="text-sm">
                <strong>Summary:</strong>
                <pre className="mt-1 p-2 bg-gray-50 rounded text-xs overflow-auto">
                  {JSON.stringify(currentOperation.summary, null, 2)}
                </pre>
              </div>
            )}

            {currentOperation.results && currentOperation.results.length > 0 && (
              <div className="text-sm">
                <strong>Results:</strong>
                <div className="mt-2 space-y-2">
                  {currentOperation.results.map((result, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded">
                      <div className="font-medium">{result.status}</div>
                      {result.path && (
                        <div className="text-xs text-gray-600">Path: {result.path}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
    </div>
  );
}
