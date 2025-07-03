-- Create enhanced course_materials table with metadata
CREATE TABLE public.course_materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID NOT NULL,
  pdf_title TEXT NOT NULL,
  filename TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  s3_key TEXT NOT NULL,
  upload_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.course_materials ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Teachers
CREATE POLICY "Teachers can view materials for their own courses" 
ON public.course_materials 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.courses 
  WHERE courses.id = course_materials.course_id 
  AND courses.teacher_id = auth.uid()
));

CREATE POLICY "Teachers can upload materials to their own courses" 
ON public.course_materials 
FOR INSERT 
WITH CHECK (
  auth.uid() = teacher_id AND 
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE courses.id = course_materials.course_id 
    AND courses.teacher_id = auth.uid()
  )
);

CREATE POLICY "Teachers can update materials for their own courses" 
ON public.course_materials 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.courses 
  WHERE courses.id = course_materials.course_id 
  AND courses.teacher_id = auth.uid()
));

CREATE POLICY "Teachers can delete materials for their own courses" 
ON public.course_materials 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.courses 
  WHERE courses.id = course_materials.course_id 
  AND courses.teacher_id = auth.uid()
));

-- RLS Policies for Students
CREATE POLICY "Students can view materials for enrolled courses" 
ON public.course_materials 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.course_enrollments 
  WHERE course_enrollments.course_id = course_materials.course_id 
  AND course_enrollments.student_id = auth.uid()
));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_course_materials_updated_at
BEFORE UPDATE ON public.course_materials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();