import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Loader2, AlertCircle } from 'lucide-react';
import { fetchCourseMaterials, formatFileSize, formatDate, type S3Material } from '@/utils/s3Materials';

interface CourseMaterialsProps {
  courseId: string;
}

const CourseMaterials = ({ courseId }: CourseMaterialsProps) => {
  const { data: materials = [], isLoading, error, refetch } = useQuery({
    queryKey: ['course-materials', courseId],
    queryFn: () => fetchCourseMaterials(courseId),
    enabled: !!courseId,
  });

  const handleDownload = (material: S3Material) => {
    window.open(material.downloadUrl, '_blank');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Kursmaterialien</CardTitle>
          <CardDescription>
            PDF-Dateien für diesen Kurs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Materialien werden geladen...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Kursmaterialien</CardTitle>
          <CardDescription>
            PDF-Dateien für diesen Kurs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-destructive">
            <AlertCircle className="h-8 w-8" />
            <span className="ml-2">Fehler beim Laden der Materialien</span>
          </div>
          <div className="flex justify-center mt-4">
            <Button variant="outline" onClick={() => refetch()}>
              Erneut versuchen
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kursmaterialien ({materials.length})</CardTitle>
        <CardDescription>
          PDF-Dateien für diesen Kurs
        </CardDescription>
      </CardHeader>
      <CardContent>
        {materials.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Noch keine Materialien hochgeladen</p>
            <p className="text-sm text-muted-foreground mt-2">
              Laden Sie PDF-Dateien hoch, um sie hier zu sehen!
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {materials.map((material) => (
              <div
                key={material.key}
                className="border rounded-lg p-4 hover:bg-accent transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <FileText className="h-8 w-8 text-destructive flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{material.filename}</h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>{formatFileSize(material.size)}</p>
                        {material.lastModified && (
                          <p>{formatDate(material.lastModified)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(material)}
                    className="flex-shrink-0 ml-2"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CourseMaterials;