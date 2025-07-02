
-- Erstelle eine Tabelle für Kurse
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Aktiviere Row Level Security (RLS) für die Kurse
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Policy: Lehrer können ihre eigenen Kurse einsehen
CREATE POLICY "Teachers can view their own courses" 
  ON public.courses 
  FOR SELECT 
  USING (auth.uid() = teacher_id);

-- Policy: Lehrer können neue Kurse erstellen
CREATE POLICY "Teachers can create courses" 
  ON public.courses 
  FOR INSERT 
  WITH CHECK (auth.uid() = teacher_id);

-- Policy: Lehrer können ihre eigenen Kurse aktualisieren
CREATE POLICY "Teachers can update their own courses" 
  ON public.courses 
  FOR UPDATE 
  USING (auth.uid() = teacher_id);

-- Policy: Lehrer können ihre eigenen Kurse löschen
CREATE POLICY "Teachers can delete their own courses" 
  ON public.courses 
  FOR DELETE 
  USING (auth.uid() = teacher_id);
