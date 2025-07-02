
export interface UploadResult {
  success: boolean;
  error?: string;
  filename?: string;
}

export const uploadPdfFiles = async (
  files: File[],
  courseId: string
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

      results.push({
        success: true,
        filename: file.name,
      });

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
