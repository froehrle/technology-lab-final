-- Clean up all user data from the application
-- Delete in order to avoid foreign key constraint violations

-- Delete student-related data first
DELETE FROM student_answers;
DELETE FROM student_achievements; 
DELETE FROM student_coins;
DELETE FROM student_xp;
DELETE FROM student_streaks;
DELETE FROM student_purchases;
DELETE FROM student_badge_purchases;
DELETE FROM student_farm_purchases;

-- Delete quiz and course related data
DELETE FROM quiz_attempts;
DELETE FROM course_enrollments;
DELETE FROM course_materials;

-- Delete questions and pending questions
DELETE FROM pending_questions;
DELETE FROM questions;

-- Delete courses
DELETE FROM courses;

-- Delete user profiles (this should be done last)
DELETE FROM profiles;