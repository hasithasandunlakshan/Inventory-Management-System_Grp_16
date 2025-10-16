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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Languages,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Copy,
  RefreshCw,
} from 'lucide-react';
import {
  translatorService,
  TranslationResponse,
} from '@/lib/services/translatorService';

interface TranslatorCardProps {
  onTranslationComplete?: (result: TranslationResponse) => void;
}

export default function TranslatorCard({
  onTranslationComplete,
}: TranslatorCardProps) {
  const [text, setText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [translation, setTranslation] = useState<TranslationResponse | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const languageOptions = translatorService.getCommonLanguageOptions();

  const handleTranslate = async () => {
    if (!text.trim()) {
      setError('Please enter text to translate');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await translatorService.translateText({
        text: text.trim(),
        target_language: targetLanguage,
      });

      setTranslation(result);
      onTranslationComplete?.(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Translation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyTranslation = () => {
    if (translation?.translated_text) {
      navigator.clipboard.writeText(translation.translated_text);
    }
  };

  const handleClear = () => {
    setText('');
    setTranslation(null);
    setError(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Languages className='h-5 w-5' />
          Text Translator
        </CardTitle>
        <CardDescription>
          Translate text using Azure AI Translator
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {error && (
          <Alert variant='destructive'>
            <AlertTriangle className='h-4 w-4' />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className='space-y-2'>
          <label className='text-sm font-medium'>Text to Translate</label>
          <Textarea
            placeholder='Enter text to translate...'
            value={text}
            onChange={e => setText(e.target.value)}
            rows={4}
            className='resize-none'
          />
        </div>

        <div className='space-y-2'>
          <label className='text-sm font-medium'>Target Language</label>
          <Select value={targetLanguage} onValueChange={setTargetLanguage}>
            <SelectTrigger>
              <SelectValue placeholder='Select language' />
            </SelectTrigger>
            <SelectContent>
              {languageOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='flex gap-2'>
          <Button
            onClick={handleTranslate}
            disabled={loading || !text.trim()}
            className='flex-1'
          >
            {loading ? (
              <Loader2 className='h-4 w-4 animate-spin mr-2' />
            ) : (
              <Languages className='h-4 w-4 mr-2' />
            )}
            Translate
          </Button>

          <Button variant='outline' onClick={handleClear} disabled={loading}>
            <RefreshCw className='h-4 w-4' />
          </Button>
        </div>

        {translation && (
          <div className='space-y-3 p-4 bg-green-50 rounded-lg border'>
            <div className='flex items-center justify-between'>
              <h4 className='font-medium text-green-800'>Translation Result</h4>
              <div className='flex gap-2'>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={handleCopyTranslation}
                >
                  <Copy className='h-4 w-4 mr-1' />
                  Copy
                </Button>
              </div>
            </div>

            <div className='space-y-2'>
              <div>
                <label className='text-xs font-medium text-gray-600'>
                  Original ({translation.source_language})
                </label>
                <p className='text-sm text-gray-700 bg-white p-2 rounded border'>
                  {translation.original_text}
                </p>
              </div>

              <div>
                <label className='text-xs font-medium text-gray-600'>
                  Translated ({translation.target_language})
                </label>
                <p className='text-sm text-gray-900 bg-white p-2 rounded border font-medium'>
                  {translation.translated_text}
                </p>
              </div>
            </div>

            {translation.confidence && (
              <div className='text-xs text-gray-600'>
                Confidence: {(translation.confidence * 100).toFixed(1)}%
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
