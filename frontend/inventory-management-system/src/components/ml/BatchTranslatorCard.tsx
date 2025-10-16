'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Languages, 
  Loader2, 
  CheckCircle, 
  AlertTriangle,
  Copy,
  RefreshCw,
  FileText
} from 'lucide-react';
import { translatorService, TranslationResponse } from '@/lib/services/translatorService';

interface BatchTranslatorCardProps {
  onBatchTranslationComplete?: (results: TranslationResponse[]) => void;
}

export default function BatchTranslatorCard({ onBatchTranslationComplete }: BatchTranslatorCardProps) {
  const [texts, setTexts] = useState<string[]>([]);
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [translations, setTranslations] = useState<TranslationResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const languageOptions = translatorService.getCommonLanguageOptions();

  const handleTextInput = (value: string) => {
    // Split by newlines and filter out empty strings
    const textArray = value.split('\n').filter(text => text.trim() !== '');
    setTexts(textArray);
  };

  const handleBatchTranslate = async () => {
    if (texts.length === 0) {
      setError('Please enter at least one text to translate');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await translatorService.translateTextBatch({
        texts,
        target_language: targetLanguage
      });
      
      setTranslations(result.translations);
      onBatchTranslationComplete?.(result.translations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Batch translation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAllTranslations = () => {
    const allTranslations = translations.map(t => t.translated_text).join('\n');
    navigator.clipboard.writeText(allTranslations);
  };

  const handleClear = () => {
    setTexts([]);
    setTranslations([]);
    setError(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Batch Translator
        </CardTitle>
        <CardDescription>
          Translate multiple texts at once using Azure AI Translator
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Texts to Translate (one per line)
            <Badge variant="secondary" className="ml-2">
              {texts.length} texts
            </Badge>
          </label>
          <Textarea
            placeholder="Enter texts to translate, one per line..."
            onChange={(e) => handleTextInput(e.target.value)}
            rows={6}
            className="resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Target Language</label>
          <Select value={targetLanguage} onValueChange={setTargetLanguage}>
            <SelectTrigger>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {languageOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleBatchTranslate} 
            disabled={loading || texts.length === 0}
            className="flex-1"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Languages className="h-4 w-4 mr-2" />
            )}
            Translate All ({texts.length})
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleClear}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {translations.length > 0 && (
          <div className="space-y-3 p-4 bg-green-50 rounded-lg border">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-green-800">
                Translation Results ({translations.length})
              </h4>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyAllTranslations}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy All
                </Button>
              </div>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {translations.map((translation, index) => (
                <div key={index} className="p-3 bg-white rounded border">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigator.clipboard.writeText(translation.translated_text)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs font-medium text-gray-600">Original</label>
                      <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                        {translation.original_text}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-xs font-medium text-gray-600">Translated</label>
                      <p className="text-sm text-gray-900 bg-green-50 p-2 rounded font-medium">
                        {translation.translated_text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
