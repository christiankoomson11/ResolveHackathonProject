-- Seed demo data for Resolve Student Case Management System
-- This script creates sample cases across all types, statuses, and priorities

-- First, we need to create some demo user profiles
-- Note: These will be linked to actual auth users when they sign up

-- Create demo staff and admin profiles (using placeholder UUIDs that will be replaced by real users)
-- For demo purposes, we'll insert cases with NULL created_by initially

-- Insert sample cases with various types, statuses, and priorities
INSERT INTO cases (case_number, title, description, type, status, priority, created_by, assigned_to)
VALUES
  -- Academic Cases
  ('CASE-2024-001', 'Grade Appeal for MATH 301 Final Exam', 
   'I believe my final exam for MATH 301 was graded incorrectly. I scored 72% but after reviewing the rubric, I believe several answers were marked wrong that should have received partial credit. Specifically, questions 5, 8, and 12 had correct methodology but minor calculation errors. I am requesting a re-evaluation of my exam paper.',
   'academic', 'open', 'high', NULL, NULL),
  
  ('CASE-2024-002', 'Academic Probation Appeal', 
   'Due to family medical emergency during Fall semester, my GPA dropped below 2.0. My mother was diagnosed with cancer and I had to travel home frequently. I am requesting removal from academic probation and consideration of my circumstances. I have documentation from the hospital and can provide proof of travel.',
   'academic', 'in_progress', 'urgent', NULL, NULL),
  
  ('CASE-2024-003', 'Course Withdrawal After Deadline', 
   'I need to withdraw from CHEM 201 after the withdrawal deadline. I was involved in a car accident on October 15th and missed 3 weeks of classes. I have medical documentation and police report available. My professor has confirmed I was performing well before the accident.',
   'academic', 'pending_review', 'high', NULL, NULL),
  
  ('CASE-2024-004', 'Credit Transfer Evaluation Request', 
   'Requesting evaluation of 12 credits from my previous institution (State University) for transfer. Courses include: Introduction to Psychology (PSY 101), English Composition II (ENG 102), and Calculus I (MATH 151). I have official transcripts and course syllabi available.',
   'academic', 'resolved', 'medium', NULL, NULL),
  
  ('CASE-2024-005', 'Incomplete Grade Extension', 
   'Requesting extension for incomplete grade in HIST 205. Original deadline was December 15th. I need additional 30 days due to ongoing research project complications. Professor Martinez has approved this request pending administrative approval.',
   'academic', 'open', 'medium', NULL, NULL),

  -- Financial Cases
  ('CASE-2024-006', 'Financial Aid Appeal - SAP', 
   'I am appealing my Satisfactory Academic Progress (SAP) suspension. I failed to meet the 67% completion rate due to withdrawing from two courses last semester. The withdrawals were due to my work schedule changing unexpectedly when my employer required overtime. I have since adjusted my course load and work schedule.',
   'financial', 'in_progress', 'urgent', NULL, NULL),
  
  ('CASE-2024-007', 'Emergency Financial Assistance Request', 
   'Requesting emergency funds due to unexpected housing situation. My apartment building had a fire and I lost all belongings. I need assistance with temporary housing and replacing essential items like textbooks and laptop. Fire department report attached.',
   'financial', 'pending_review', 'urgent', NULL, NULL),
  
  ('CASE-2024-008', 'Tuition Payment Plan Modification', 
   'Requesting modification to my current payment plan. I recently lost my part-time job and need to extend payments over additional months. Current plan requires $1,500/month but I can only manage $800/month until I find new employment. I am actively job searching.',
   'financial', 'open', 'high', NULL, NULL),
  
  ('CASE-2024-009', 'Scholarship Renewal Appeal', 
   'My Dean''s List scholarship was not renewed due to GPA falling to 3.4 (requirement is 3.5). I was dealing with depression and anxiety last semester and have since begun treatment. I am requesting consideration for scholarship reinstatement. Counseling center documentation available.',
   'financial', 'resolved', 'medium', NULL, NULL),
  
  ('CASE-2024-010', 'Billing Dispute - Duplicate Charges', 
   'I was charged twice for the Fall 2024 meal plan. My account shows two charges of $2,450 each on August 15th and August 17th. I only have one meal plan. Requesting refund of the duplicate charge.',
   'financial', 'resolved', 'low', NULL, NULL),

  -- Conduct Cases
  ('CASE-2024-011', 'Academic Integrity Violation - First Offense', 
   'Student reported for potential plagiarism in ENGL 102 research paper. Turnitin report shows 45% similarity with online sources. Student claims improper citation rather than intentional plagiarism. First academic integrity violation on record.',
   'conduct', 'in_progress', 'high', NULL, NULL),
  
  ('CASE-2024-012', 'Residence Hall Policy Violation', 
   'Student found with prohibited items (candles and hot plate) during routine room inspection in Wilson Hall, Room 312. Items confiscated. Student cooperative during inspection. First housing violation.',
   'conduct', 'pending_review', 'medium', NULL, NULL),
  
  ('CASE-2024-013', 'Noise Complaint - Multiple Incidents', 
   'Third noise complaint filed against student in Morrison Hall, Room 205. Previous warnings issued on September 5th and October 12th. Latest incident on November 3rd at 2:00 AM involved loud music and multiple guests.',
   'conduct', 'open', 'medium', NULL, NULL),
  
  ('CASE-2024-014', 'Alcohol Policy Violation', 
   'Underage student found with alcohol in campus parking lot during football game. Student is 19 years old. Campus police report filed. Student was cooperative and no other violations noted.',
   'conduct', 'resolved', 'high', NULL, NULL),
  
  ('CASE-2024-015', 'Guest Policy Violation', 
   'Unregistered overnight guest found in Adams Hall for 5 consecutive nights. Roommate filed complaint. Guest is not affiliated with the university. Student claims they were unaware of the 3-night limit policy.',
   'conduct', 'closed', 'low', NULL, NULL),

  -- Support Cases
  ('CASE-2024-016', 'Disability Accommodation Request - Testing', 
   'Requesting extended time (1.5x) and separate testing location for all exams. Diagnosed with ADHD and anxiety disorder. Documentation from licensed psychologist provided. Previous accommodations at high school included.',
   'support', 'in_progress', 'high', NULL, NULL),
  
  ('CASE-2024-017', 'Mental Health Support Referral', 
   'Student self-referred for counseling services. Reporting symptoms of depression and difficulty concentrating. No immediate safety concerns identified. Requesting appointment with counselor specializing in academic stress.',
   'support', 'resolved', 'medium', NULL, NULL),
  
  ('CASE-2024-018', 'Housing Accommodation - Medical', 
   'Requesting single room accommodation due to severe sleep apnea requiring CPAP machine. Current roommate has complained about noise. Medical documentation from sleep specialist attached. Willing to pay single room rate.',
   'support', 'pending_review', 'medium', NULL, NULL),
  
  ('CASE-2024-019', 'Note-Taking Services Request', 
   'Student with documented hearing impairment requesting note-taking services for BIOL 201 and CHEM 101. Currently using hearing aids but large lecture halls make it difficult to hear clearly. Previous accommodation at community college.',
   'support', 'open', 'medium', NULL, NULL),
  
  ('CASE-2024-020', 'Wellness Check Follow-Up', 
   'Follow-up case after wellness check initiated by professor. Student had missed two weeks of classes without communication. Student made contact and reported family emergency. Connecting with academic advisor and counseling services.',
   'support', 'in_progress', 'urgent', NULL, NULL),

  -- Administrative Cases
  ('CASE-2024-021', 'Name Change Request', 
   'Requesting legal name change on all university records. Court order for name change attached. New name: Alexandra Chen (previously Alexander Chen). Please update student ID, email, and all official documents.',
   'administrative', 'in_progress', 'medium', NULL, NULL),
  
  ('CASE-2024-022', 'Transcript Rush Request', 
   'Need official transcript sent to employer within 48 hours for job offer verification. Employer: TechCorp Inc., HR Department. Willing to pay rush processing fee. Job offer contingent on verification by Friday.',
   'administrative', 'resolved', 'high', NULL, NULL),
  
  ('CASE-2024-023', 'Enrollment Verification Letter', 
   'Requesting enrollment verification letter for insurance purposes. Need letter confirming full-time status (12+ credits) for Fall 2024 semester. Parent''s insurance requires annual verification.',
   'administrative', 'resolved', 'low', NULL, NULL),
  
  ('CASE-2024-024', 'Graduation Application Review', 
   'Submitted graduation application for Spring 2025 but received notice of missing requirement. Believe COMM 201 should satisfy the oral communication requirement. Requesting review of degree audit.',
   'administrative', 'pending_review', 'high', NULL, NULL),
  
  ('CASE-2024-025', 'Major Declaration Change', 
   'Requesting change of major from Biology to Computer Science. Currently in sophomore year with 45 credits completed. Have already taken CS 101 and CS 102 as electives with A grades. Advisor meeting completed.',
   'administrative', 'open', 'medium', NULL, NULL),

  -- Additional varied cases for more realistic data
  ('CASE-2024-026', 'Lab Fee Refund Request', 
   'Dropped CHEM 201 within refund period but lab fee was not refunded. Course dropped on September 8th, within the 100% refund period. Requesting refund of $150 lab fee.',
   'financial', 'open', 'low', NULL, NULL),
  
  ('CASE-2024-027', 'Classroom Accessibility Concern', 
   'Reporting accessibility issue in Science Building Room 305. Wheelchair access is blocked by new lab equipment arrangement. Need rearrangement before next semester when I have class scheduled there.',
   'support', 'open', 'medium', NULL, NULL),
  
  ('CASE-2024-028', 'Research Misconduct Report', 
   'Anonymous report of potential research misconduct in Dr. Smith''s laboratory. Allegation involves data fabrication in recent publication. Requires formal investigation per university policy.',
   'conduct', 'in_progress', 'urgent', NULL, NULL),
  
  ('CASE-2024-029', 'International Student Work Authorization', 
   'F-1 student requesting CPT authorization for summer internship. Internship at local tech company, directly related to Computer Science major. Offer letter and job description attached.',
   'administrative', 'pending_review', 'high', NULL, NULL),
  
  ('CASE-2024-030', 'Retroactive Medical Withdrawal', 
   'Requesting retroactive withdrawal from Fall 2023 semester due to hospitalization. Was hospitalized for 3 weeks in October 2023 and unable to complete paperwork at the time. All medical records available.',
   'academic', 'in_progress', 'high', NULL, NULL);

-- Add some case history entries for resolved/closed cases
INSERT INTO case_history (case_id, changed_by, field_changed, old_value, new_value)
SELECT id, NULL, 'status', 'open', 'resolved'
FROM cases 
WHERE status = 'resolved';

INSERT INTO case_history (case_id, changed_by, field_changed, old_value, new_value)
SELECT id, NULL, 'status', 'pending_review', 'closed'
FROM cases 
WHERE status = 'closed';

-- Add some sample comments to cases
INSERT INTO case_comments (case_id, author_id, content, is_internal)
SELECT id, NULL, 'Case received and under review. We will contact you within 3-5 business days with an update.', false
FROM cases
WHERE status IN ('open', 'in_progress', 'pending_review')
LIMIT 10;

INSERT INTO case_comments (case_id, author_id, content, is_internal)
SELECT id, NULL, 'Internal note: Verified documentation received. Ready for supervisor review.', true
FROM cases
WHERE status = 'pending_review';

INSERT INTO case_comments (case_id, author_id, content, is_internal)
SELECT id, NULL, 'Your case has been resolved. Please contact us if you have any further questions.', false
FROM cases
WHERE status = 'resolved';
