-- Update avatar items with German descriptions
UPDATE public.avatar_items SET 
  description = CASE name
    WHEN 'Classic Blue Frame' THEN 'Ein klassischer blauer Rahmen um deinen Avatar'
    WHEN 'Royal Purple Frame' THEN 'Ein königlicher violetter Rahmen für ausgezeichnete Nutzer'
    WHEN 'Golden Frame' THEN 'Ein prestigeträchtiger goldener Rahmen'
    WHEN 'Emerald Frame' THEN 'Ein lebendiger smaragdgrüner Rahmen'
    WHEN 'Ruby Frame' THEN 'Ein mutiger rubinroter Rahmen'
    WHEN 'Silver Frame' THEN 'Ein eleganter silberner Rahmen'
    ELSE description
  END;

-- Update profile badges with German descriptions
UPDATE public.profile_badges SET 
  description = CASE name
    WHEN 'Quiz Master' THEN 'Schließe 10 Quiz mit perfekten Ergebnissen ab'
    WHEN 'Speed Demon' THEN 'Schließe 5 Quiz in unter 2 Minuten ab'
    WHEN 'Scholar' THEN 'Schließe 3 verschiedene Kurse ab'
    WHEN 'Dedicated Learner' THEN 'Logge dich 7 Tage hintereinander ein'
    WHEN 'The Wise' THEN 'Zeige Weisheit in deiner Lernreise'
    WHEN 'Champion' THEN 'Zeige deinen Champion-Status'
    WHEN 'Prodigy' THEN 'Zeige deine außergewöhnlichen Fähigkeiten'
    WHEN 'Mastermind' THEN 'Der ultimative Titel für wahre Meister'
    ELSE description
  END;