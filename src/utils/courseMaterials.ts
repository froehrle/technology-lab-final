import { supabase } from '@/integrations/supabase/client';

export interface CourseMaterial {
  id: string;
  course_id: string;
  teacher_id: string;
  pdf_title: string;
  filename: string;
  file_size: number;
  s3_key: string;
  upload_date: string;
  created_at: string;
  updated_at: string;
}

export const fetchCourseMaterials = async (courseId: string): Promise<CourseMaterial[]> => {
  try {
    console.log('Fetching materials for course:', courseId);
    
    const { data: materials, error } = await supabase
      .from('course_materials')
      .select('*')
      .eq('course_id', courseId)
      .order('upload_date', { ascending: false });

    if (error) {
      console.error('Error fetching course materials:', error);
      throw new Error('Failed to load course materials');
    }

    console.log(`Found ${materials?.length || 0} materials for course ${courseId}`);
    return materials || [];

  } catch (error) {
    console.error('Error fetching course materials:', error);
    throw new Error('Failed to load course materials');
  }
};

export const getDownloadUrl = (s3Key: string): string => {
  return `https://tl-course-materials.s3.eu-central-1.amazonaws.com/${s3Key}`;
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

export const deleteMaterial = async (materialId: string): Promise<void> => {
  const { error } = await supabase
    .from('course_materials')
    .delete()
    .eq('id', materialId);

  if (error) {
    console.error('Error deleting material:', error);
    throw new Error('Failed to delete material');
  }
};

export const updateMaterialTitle = async (materialId: string, newTitle: string): Promise<void> => {
  const { error } = await supabase
    .from('course_materials')
    .update({ pdf_title: newTitle })
    .eq('id', materialId);

  if (error) {
    console.error('Error updating material title:', error);
    throw new Error('Failed to update material title');
  }
};