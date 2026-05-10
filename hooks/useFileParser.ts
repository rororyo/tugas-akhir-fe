'use client';
import { useState } from 'react';
import { parseFile } from '@/lib/utils/fileParser';

export function useFileParser() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<any[] | null>(null);

  const parseUploadedFile = async (file: File) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await parseFile(file);
      setParsedData(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal memproses file';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setParsedData(null);
    setError(null);
    setIsLoading(false);
  };

  return {
    parseUploadedFile,
    isLoading,
    error,
    parsedData,
    reset
  };
}