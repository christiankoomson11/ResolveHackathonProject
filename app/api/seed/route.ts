"use server"

import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

const caseTemplates = [
  // Academic Cases
  { title: "Grade Appeal - Calculus II Final Exam", description: "I believe there was an error in grading my final exam. I answered question 5 correctly using the chain rule method as taught in class, but received zero points. I have attached my work and the textbook reference showing the correct methodology.", type: "academic", priority: "high" },
  { title: "Academic Probation Review Request", description: "I am requesting a review of my academic probation status. My GPA dropped last semester due to a family medical emergency. I have documentation from the hospital and am requesting consideration for extenuating circumstances.", type: "academic", priority: "high" },
  { title: "Course Withdrawal After Deadline", description: "I need to withdraw from PHYS 201 after the deadline due to a sudden illness that required hospitalization. I have medical documentation and am requesting an exception to the withdrawal policy.", type: "academic", priority: "medium" },
  { title: "Credit Transfer Evaluation Dispute", description: "My transfer credits from Community College were not properly evaluated. The course descriptions match your requirements but were marked as electives instead of major requirements.", type: "academic", priority: "medium" },
  { title: "Incomplete Grade Extension Request", description: "I am requesting an extension on my incomplete grade for ENG 301. The original deadline is approaching but I am still recovering from surgery and need additional time to complete my final paper.", type: "academic", priority: "low" },
  { title: "Plagiarism Allegation Appeal", description: "I received a plagiarism notice for my research paper but I believe this is a misunderstanding. I properly cited all sources using APA format. I am requesting a review of my paper and citations.", type: "academic", priority: "urgent" },
  
  -- Financial Cases
  { title: "Financial Aid Appeal - Changed Circumstances", description: "My family's financial situation has changed dramatically since filing FAFSA. My father lost his job and we need a reassessment of our financial aid package.", type: "financial", priority: "urgent" },
  { title: "Scholarship Renewal Question", description: "I am concerned about my scholarship renewal. My GPA is 3.48 but the requirement is 3.5. I had one difficult semester but have otherwise maintained excellent grades.", type: "financial", priority: "high" },
  { title: "Tuition Payment Plan Request", description: "I am requesting a payment plan for this semester's tuition. I am waiting on my employer's tuition reimbursement which will arrive mid-semester.", type: "financial", priority: "medium" },
  { title: "Refund Processing Delay", description: "I dropped a course within the full refund period three weeks ago but have not received my refund yet. The registrar confirmed the drop was processed on time.", type: "financial", priority: "medium" },
  { title: "Work-Study Position Inquiry", description: "I was approved for work-study but haven't been able to find a position. Can someone help me identify available opportunities that fit my class schedule?", type: "financial", priority: "low" },
  { title: "Emergency Student Loan Request", description: "I have an unexpected car repair that is essential for my commute to campus. I am requesting information about emergency student loans.", type: "financial", priority: "high" },

  -- Conduct Cases
  { title: "Noise Complaint Response", description: "I received a noise complaint from my RA but I was not in my room at the time of the alleged incident. My roommate may have had guests while I was at the library studying.", type: "conduct", priority: "low" },
  { title: "Academic Integrity Hearing Request", description: "I was accused of unauthorized collaboration on a lab assignment. I would like to request a formal hearing to present my case and the evidence showing my work was independent.", type: "conduct", priority: "high" },
  { title: "Parking Violation Appeal", description: "I received a parking ticket but my permit was displayed correctly. The ticket states the permit was not visible but I have photos showing it was properly displayed.", type: "conduct", priority: "low" },
  { title: "Guest Policy Violation Explanation", description: "I received a warning for a guest policy violation. My younger sibling visited unexpectedly and I was not aware they needed to be registered. I am requesting this be noted as a first-time misunderstanding.", type: "conduct", priority: "medium" },

  -- Support Cases
  { title: "Disability Accommodation Request", description: "I have recently been diagnosed with ADHD and would like to request testing accommodations including extended time and a reduced-distraction environment.", type: "support", priority: "high" },
  { title: "Mental Health Resources Inquiry", description: "I have been struggling with anxiety this semester and would like information about counseling services available on campus.", type: "support", priority: "medium" },
  { title: "Housing Accommodation - Medical", description: "I need to request a housing accommodation due to a medical condition. I have documentation from my physician explaining why I need a single room.", type: "support", priority: "high" },
  { title: "Academic Coaching Request", description: "I am struggling with time management and study skills. I would like to be connected with an academic coach or tutor services.", type: "support", priority: "low" },
  { title: "Dietary Accommodation Request", description: "I have recently been diagnosed with celiac disease and need to request dietary accommodations for the campus meal plan.", type: "support", priority: "medium" },
  { title: "Interpreter Services Request", description: "I am a Deaf student transferring next semester and need to arrange for ASL interpreter services for my classes.", type: "support", priority: "urgent" },

  -- Administrative Cases
  { title: "Transcript Request - Rush Processing", description: "I need official transcripts sent to three graduate schools by next week. I am requesting rush processing due to application deadlines.", type: "administrative", priority: "high" },
  { title: "Name Change Request", description: "I recently got married and need to update my name in the university system. I have attached a copy of my marriage certificate.", type: "administrative", priority: "low" },
  { title: "Enrollment Verification Letter", description: "I need an enrollment verification letter for my employer's tuition reimbursement program. They require it to include my expected graduation date.", type: "administrative", priority: "medium" },
  { title: "Major Change Request", description: "I would like to change my major from Biology to Computer Science. I have already spoken with an advisor in the CS department.", type: "administrative", priority: "medium" },
  { title: "Graduation Audit Request", description: "I am planning to graduate next semester and would like a formal audit of my credits to ensure I am on track to complete all requirements.", type: "administrative", priority: "high" },
  { title: "Student ID Card Replacement", description: "My student ID card was lost during a campus event. I need a replacement card to access the library and dining facilities.", type: "administrative", priority: "low" },
  { title: "Address Update Request", description: "I have moved to a new off-campus apartment and need to update my mailing address for important university correspondence.", type: "administrative", priority: "low" },
  { title: "Readmission Application", description: "I took a leave of absence two years ago for personal reasons. I am now ready to return and complete my degree.", type: "administrative", priority: "high" },
]

const statuses = ["open", "in_progress", "pending", "resolved", "closed"] as const
const priorities = ["low", "medium", "high", "urgent"] as const

export async function POST() {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Check if user is staff or admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (!profile || !["staff", "admin"].includes(profile.role)) {
    return NextResponse.json({ error: "Only staff and admin can seed data" }, { status: 403 })
  }

  // Generate case number prefix
  const generateCaseNumber = (index: number) => {
    const year = new Date().getFullYear()
    const num = String(index + 1).padStart(5, "0")
    return `CASE-${year}-${num}`
  }

  // Create cases with random statuses
  const casesToInsert = caseTemplates.map((template, index) => {
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
    const randomDaysAgo = Math.floor(Math.random() * 60) // Random date within last 60 days
    const createdAt = new Date(Date.now() - randomDaysAgo * 24 * 60 * 60 * 1000).toISOString()
    
    return {
      case_number: generateCaseNumber(index),
      title: template.title,
      description: template.description,
      type: template.type,
      status: randomStatus,
      priority: template.priority,
      submitter_id: user.id,
      assigned_to: randomStatus !== "open" ? user.id : null,
      created_at: createdAt,
      updated_at: createdAt,
    }
  })

  const { data: insertedCases, error: insertError } = await supabase
    .from("cases")
    .insert(casesToInsert)
    .select()

  if (insertError) {
    console.error("[v0] Error inserting cases:", insertError)
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  // Add some comments to random cases
  const comments = [
    "Thank you for submitting your case. We are reviewing your request.",
    "Additional documentation has been received and added to your file.",
    "Your case has been assigned to a specialist for review.",
    "We have contacted the relevant department for further information.",
    "Your case is progressing well. We expect a resolution soon.",
    "Please provide additional details regarding your request.",
  ]

  const commentsToInsert = insertedCases?.slice(0, 15).map((c) => ({
    case_id: c.id,
    author_id: user.id,
    content: comments[Math.floor(Math.random() * comments.length)],
    is_internal: Math.random() > 0.7,
  })) || []

  if (commentsToInsert.length > 0) {
    await supabase.from("case_comments").insert(commentsToInsert)
  }

  return NextResponse.json({ 
    success: true, 
    casesCreated: insertedCases?.length || 0 
  })
}
