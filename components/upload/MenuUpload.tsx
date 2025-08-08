'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, Image, Link2, Loader2, CheckCircle } from 'lucide-react';
import { Upload as UploadIcon } from 'lucide-react';

interface MenuUploadProps {
  restaurantId: string;
  onUploadSuccess?: () => void;
}

export default function MenuUpload({ restaurantId, onUploadSuccess }: MenuUploadProps) {
  const [uploadType, setUploadType] = useState<'file' | 'url'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const getSourceType = (): 'pdf' | 'image' | 'url' => {
    if (uploadType === 'url') return 'url';
    if (file?.type.includes('pdf')) return 'pdf';
    return 'image';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setError(null);

    try {
      if (uploadType === 'file' && !file) {
        throw new Error('Selecteer een bestand om te uploaden');
      }
      if (uploadType === 'url' && !url.trim()) {
        throw new Error('Voer een geldige URL in');
      }

      let uploadedUrl: string | undefined = undefined;
      if (uploadType === 'file' && file) {
        const form = new FormData();
        form.append('file', file);
        const res = await fetch('/api/uploads', { method: 'POST', body: form });
        if (!res.ok) throw new Error(await res.text());
        const { url: fileUrl } = await res.json();
        uploadedUrl = fileUrl;
      }

      const res = await fetch('/api/menus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          sourceType: getSourceType(),
          sourceUrl: uploadType === 'url' ? url : uploadedUrl,
        }),
      });
      if (!res.ok) throw new Error(await res.text());

      setUploadSuccess(true);
      if (onUploadSuccess) {
        onUploadSuccess();
      }

      // Reset form
      setFile(null);
      setUrl('');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload mislukt');
    } finally {
      setIsUploading(false);
    }
  };

  if (uploadSuccess) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Menu succesvol geüpload!
          </h3>
          <p className="text-gray-600 mb-4">
            Uw menu wordt nu verwerkt en zal binnenkort beschikbaar zijn na goedkeuring door onze moderators.
          </p>
          <Button
            onClick={() => setUploadSuccess(false)}
            className="bg-orange-600 hover:bg-orange-700"
          >
            Nog een menu uploaden
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UploadIcon className="h-5 w-5" />
          Menu uploaden
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Upload Type Selection */}
          <div>
            <Label>Upload methode</Label>
            <Select 
              value={uploadType} 
              onValueChange={(value: 'file' | 'url') => setUploadType(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="file">Bestand uploaden (PDF/JPG/PNG)</SelectItem>
                <SelectItem value="url">Website URL</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* File Upload */}
          {uploadType === 'file' && (
            <div>
              <Label htmlFor="file">Menu bestand</Label>
              <div className="mt-1">
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                />
              </div>
              {file && (
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                  {file.type.includes('pdf') ? (
                    <FileText className="h-4 w-4" />
                  ) : (
                    <Image className="h-4 w-4" />
                  )}
                  <span>{file.name}</span>
                  <span className="text-gray-400">
                    ({(file.size / 1024 / 1024).toFixed(1)} MB)
                  </span>
                </div>
              )}
            </div>
          )}

          {/* URL Input */}
          {uploadType === 'url' && (
            <div>
              <Label htmlFor="url">Menu URL</Label>
              <div className="mt-1 relative">
                <Link2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="url"
                  type="url"
                  placeholder="https://restaurant.nl/menu"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="pl-10"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Voer de URL in van de online menukaart van het restaurant
              </p>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Upload Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h4 className="font-medium text-blue-900 mb-2">Upload informatie</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Ondersteunde formaten: PDF, JPG, PNG of website URL</li>
              <li>• Maximum bestandsgrootte: 10MB</li>
              <li>• Menu's worden automatisch verwerkt met AI</li>
              <li>• Na upload krijgt u een preview om te controleren</li>
              <li>• Goedkeuring duurt meestal 24 uur</li>
            </ul>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isUploading || (uploadType === 'file' && !file) || (uploadType === 'url' && !url.trim())}
            className="w-full bg-orange-600 hover:bg-orange-700"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploaden...
              </>
            ) : (
              <>
                <UploadIcon className="mr-2 h-4 w-4" />
                Menu uploaden
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}