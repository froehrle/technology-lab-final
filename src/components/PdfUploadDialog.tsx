
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { uploadPdfFiles } from '@/utils/pdfUpload';
import { useAuth } from '@/contexts/AuthContext';

interface PdfUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  onUploadSuccess?: () => void;
}

interface UploadFile {
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

const PdfUploadDialog = ({ open, onOpenChange, courseId, onUploadSuccess }: PdfUploadDialogProps) => {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const pdfFiles = files.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length !== files.length) {
      toast({
        title: "Ungültige Dateien",
        description: "Nur PDF-Dateien sind erlaubt.",
        variant: "destructive",
      });
    }

    const newUploadFiles = pdfFiles.map(file => ({
      file,
      status: 'pending' as const,
    }));

    setUploadFiles(prev => [...prev, ...newUploadFiles]);
    event.target.value = '';
  };

  const removeFile = (index: number) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (uploadFiles.length === 0) return;

    setIsUploading(true);
    
    try {
      const filesToUpload = uploadFiles.filter(uf => uf.status === 'pending');
      
      // Update status to uploading
      setUploadFiles(prev => prev.map(uf => 
        uf.status === 'pending' ? { ...uf, status: 'uploading' } : uf
      ));

      if (!user?.id) {
        toast({
          title: "Fehler",
          description: "Benutzer nicht authentifiziert.",
          variant: "destructive",
        });
        setIsUploading(false);
        return;
      }

      const results = await uploadPdfFiles(filesToUpload.map(uf => uf.file), courseId, user.id);
      
      // Update status based on results
      setUploadFiles(prev => prev.map((uf, index) => {
        if (uf.status === 'uploading') {
          const result = results[filesToUpload.findIndex(f => f.file === uf.file)];
          return {
            ...uf,
            status: result.success ? 'success' : 'error',
            error: result.success ? undefined : result.error,
          };
        }
        return uf;
      }));

      const successCount = results.filter(r => r.success).length;
      const errorCount = results.filter(r => !r.success).length;

      if (successCount > 0) {
        toast({
          title: "Upload erfolgreich",
          description: `${successCount} PDF-Datei(en) erfolgreich hochgeladen.`,
        });
      }

      if (errorCount > 0) {
        toast({
          title: "Upload-Fehler",
          description: `${errorCount} Datei(en) konnten nicht hochgeladen werden.`,
          variant: "destructive",
        });
      }

      // Auto-close dialog if all uploads successful
      if (errorCount === 0) {
        onUploadSuccess?.(); // Refresh materials list
        setTimeout(() => {
          onOpenChange(false);
          setUploadFiles([]);
        }, 1500);
      }

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload fehlgeschlagen",
        description: "Ein unerwarteter Fehler ist aufgetreten.",
        variant: "destructive",
      });
      
      setUploadFiles(prev => prev.map(uf => 
        uf.status === 'uploading' ? { ...uf, status: 'error', error: 'Unerwarteter Fehler' } : uf
      ));
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      onOpenChange(false);
      setUploadFiles([]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'uploading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
      case 'success':
        return <div className="h-4 w-4 bg-green-600 rounded-full flex items-center justify-center">
          <div className="h-2 w-2 bg-white rounded-full" />
        </div>;
      case 'error':
        return <X className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>PDF-Dateien hochladen</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-4">
              Wählen Sie PDF-Dateien zum Hochladen aus
            </p>
            <input
              type="file"
              accept=".pdf,application/pdf"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id="pdf-upload"
              disabled={isUploading}
            />
            <label htmlFor="pdf-upload">
              <Button variant="outline" disabled={isUploading} asChild>
                <span>Dateien auswählen</span>
              </Button>
            </label>
          </div>

          {uploadFiles.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {uploadFiles.map((uploadFile, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2 flex-1">
                    {getStatusIcon(uploadFile.status)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {uploadFile.file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(uploadFile.file.size)}
                      </p>
                      {uploadFile.status === 'error' && uploadFile.error && (
                        <p className="text-xs text-red-600">{uploadFile.error}</p>
                      )}
                    </div>
                  </div>
                  {uploadFile.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      disabled={isUploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleClose} disabled={isUploading}>
              Abbrechen
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={uploadFiles.length === 0 || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Hochladen...
                </>
              ) : (
                `${uploadFiles.filter(uf => uf.status === 'pending').length} Datei(en) hochladen`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PdfUploadDialog;
