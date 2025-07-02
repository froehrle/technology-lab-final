
-- Create a table for course materials (PDF files)
CREATE TABLE public.course_materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT NOT NULL DEFAULT 'application/pdf',
  upload_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.course_materials ENABLE ROW LEVEL SECURITY;

-- Policy: Teachers can view materials for their own courses
CREATE POLICY "Teachers can view materials for their own courses" 
  ON public.course_materials 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.courses 
    WHERE courses.id = course_materials.course_id 
    AND courses.teacher_id = auth.uid()
  ));

-- Policy: Teachers can upload materials to their own courses
CREATE POLICY "Teachers can upload materials to their own courses" 
  ON public.course_materials 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.courses 
    WHERE courses.id = course_materials.course_id 
    AND courses.teacher_id = auth.uid()
  ));

-- Policy: Teachers can update materials for their own courses
CREATE POLICY "Teachers can update materials for their own courses" 
  ON public.course_materials 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.courses 
    WHERE courses.id = course_materials.course_id 
    AND courses.teacher_id = auth.uid()
  ));

-- Policy: Teachers can delete materials for their own courses
CREATE POLICY "Teachers can delete materials for their own courses" 
  ON public.course_materials 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.courses 
    WHERE courses.id = course_materials.course_id 
    AND courses.teacher_id = auth.uid()
  ));
