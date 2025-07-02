export interface S3Material {
  key: string;
  filename: string;
  size: number;
  lastModified: string;
  downloadUrl: string;
}

export const fetchCourseMaterials = async (courseId: string): Promise<S3Material[]> => {
  try {
    console.log('Fetching materials for course:', courseId);
    
    // The S3 bucket URL with course-specific prefix
    const bucketUrl = `https://tl-course-materials.s3.eu-central-1.amazonaws.com/?list-type=2&prefix=${courseId}/`;
    
    const response = await fetch(bucketUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/xml',
      },
    });

    if (!response.ok) {
      console.error('S3 fetch failed:', response.status, response.statusText);
      throw new Error(`Failed to fetch materials: ${response.status}`);
    }

    const xmlText = await response.text();
    console.log('S3 response received');
    
    // Parse XML response from S3
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    // Check for XML parsing errors
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
      console.error('XML parsing error:', parseError.textContent);
      throw new Error('Failed to parse S3 response');
    }

    const contents = xmlDoc.querySelectorAll('Contents');
    const materials: S3Material[] = [];

    contents.forEach((content) => {
      const key = content.querySelector('Key')?.textContent;
      const size = content.querySelector('Size')?.textContent;
      const lastModified = content.querySelector('LastModified')?.textContent;

      if (key && key.endsWith('.pdf')) {
        const filename = key.split('/').pop() || key;
        const downloadUrl = `https://tl-course-materials.s3.eu-central-1.amazonaws.com/${key}`;
        
        materials.push({
          key,
          filename,
          size: parseInt(size || '0'),
          lastModified: lastModified || '',
          downloadUrl,
        });
      }
    });

    console.log(`Found ${materials.length} materials for course ${courseId}`);
    return materials;

  } catch (error) {
    console.error('Error fetching course materials:', error);
    throw new Error('Failed to load course materials');
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};