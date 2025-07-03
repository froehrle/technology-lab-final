
import { supabase } from '@/integrations/supabase/client';

export interface UploadResult {
  success: boolean;
  error?: string;
  filename?: string;
}

export const uploadPdfFiles = async (
  files: File[],
  courseId: string,
  teacherId: string
): Promise<UploadResult[]> => {
  const results: UploadResult[] = [];

  for (const file of files) {
    try {
      console.log('Uploading file:', file.name, 'for course:', courseId);
      
      // Validate file type
      if (file.type !== 'application/pdf') {
        results.push({
          success: false,
          error: 'Nur PDF-Dateien sind erlaubt',
        });
        continue;
      }

      // Create FormData for multipart/form-data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('course_id', courseId);

      console.log('Sending file to upload API:', file.name);

      const response = await fetch(
        'https://z9thk5d426.execute-api.eu-central-1.amazonaws.com/dev/upload',
        {
          method: 'POST',
          body: formData,
        }
      );

      console.log('Upload API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload API error:', errorText);
        results.push({
          success: false,
          error: `Upload fehlgeschlagen: ${response.status}`,
        });
        continue;
      }

      const result = await response.json();
      console.log('Upload API response:', result);

      // Store metadata in Supabase database
      try {
        const pdfTitle = file.name.replace(/\.[^/.]+$/, ''); // Remove file extension
        const s3Key = `${courseId}/${file.name}`;
        
        const { error: dbError } = await supabase
          .from('course_materials')
          .insert({
            course_id: courseId,
            teacher_id: teacherId,
            pdf_title: pdfTitle,
            filename: file.name,
            file_size: file.size,
            s3_key: s3Key,
          });

        if (dbError) {
          console.error('Database insertion error:', dbError);
          results.push({
            success: false,
            error: 'Upload erfolgreich, aber Metadaten-Speicherung fehlgeschlagen',
          });
          continue;
        }

        results.push({
          success: true,
          filename: file.name,
        });
      } catch (dbError) {
        console.error('Database error:', dbError);
        results.push({
          success: false,
          error: 'Upload erfolgreich, aber Metadaten-Speicherung fehlgeschlagen',
        });
      }

    } catch (error) {
      console.error('Upload error for file:', file.name, error);
      results.push({
        success: false,
        error: 'Netzwerkfehler beim Upload',
      });
    }
  }

  return results;
};
