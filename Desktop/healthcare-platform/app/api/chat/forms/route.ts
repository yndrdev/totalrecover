import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { conversationId, tenantId, formType, formData } = await request.json();
    console.log("Form delivery API called:", { conversationId, tenantId, formType });
    
    const supabase = await createClient();

    // Get user to ensure they're authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile for tenant isolation
    const { data: profile } = await supabase
      .from("profiles")
      .select("tenant_id")
      .eq("id", user.id)
      .single();

    if (!profile || profile.tenant_id !== tenantId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Generate form-specific AI message
    const formMessage = generateFormMessage(formType, formData);

    // Save form message to database
    const { data: messageData, error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      tenant_id: tenantId,
      sender_type: "ai",
      sender_id: null,
      content: formMessage.content,
      metadata: {
        message_type: "form_delivery",
        form_type: formType,
        form_data: formData,
        interactive: true,
        current_question: 0
      },
      created_at: new Date().toISOString()
    }).select().single();

    if (error) {
      throw error;
    }

    // Update conversation analytics
    await supabase
      .from("conversations")
      .update({
        last_activity_at: new Date().toISOString(),
      })
      .eq("id", conversationId)
      .eq("tenant_id", tenantId);

    return NextResponse.json({ 
      success: true, 
      message: messageData,
      form_type: formType
    });
  } catch (error) {
    console.error("Form delivery API error:", error);
    return NextResponse.json(
      { error: "Failed to deliver form" },
      { status: 500 }
    );
  }
}

function generateFormMessage(formType: string, formData: any) {
  switch (formType) {
    case 'pain_assessment':
      return {
        content: `Let's complete your pain assessment. I'll ask you a few questions about your current pain level and how it's affecting your daily activities.`,
        form: {
          id: 'pain_assessment',
          title: 'Pain Assessment',
          description: 'Help us understand your current pain level',
          questions: [
            {
              id: 'pain_level',
              type: 'rating',
              question: 'How would you rate your pain level right now?',
              description: 'Rate from 1 (no pain) to 10 (worst possible pain)',
              required: true,
              min: 1,
              max: 10
            },
            {
              id: 'pain_location',
              type: 'multiple_choice',
              question: 'Where is your pain located?',
              required: true,
              options: [
                'Surgical site',
                'Surrounding muscles',
                'Joint above surgery',
                'Joint below surgery',
                'Other location'
              ]
            },
            {
              id: 'pain_description',
              type: 'multiple_choice',
              question: 'How would you describe your pain?',
              required: true,
              options: [
                'Sharp and stabbing',
                'Dull and aching',
                'Throbbing',
                'Burning',
                'Shooting'
              ]
            },
            {
              id: 'pain_interference',
              type: 'rating',
              question: 'How much does pain interfere with your daily activities?',
              description: 'Rate from 1 (no interference) to 5 (completely interferes)',
              required: true,
              min: 1,
              max: 5
            },
            {
              id: 'medication_effectiveness',
              type: 'yes_no',
              question: 'Are your pain medications helping?',
              required: true
            }
          ]
        }
      };
    
    case 'daily_symptoms':
      return {
        content: `Time for your daily symptom check. I'll ask you about any symptoms you might be experiencing today.`,
        form: {
          id: 'daily_symptoms',
          title: 'Daily Symptom Check',
          description: 'Let us know about any symptoms you\'re experiencing',
          questions: [
            {
              id: 'swelling',
              type: 'rating',
              question: 'How much swelling do you have at the surgical site?',
              description: 'Rate from 1 (no swelling) to 5 (severe swelling)',
              required: true,
              min: 1,
              max: 5
            },
            {
              id: 'redness',
              type: 'yes_no',
              question: 'Do you notice any redness around the surgical site?',
              required: true
            },
            {
              id: 'warmth',
              type: 'yes_no',
              question: 'Does the surgical site feel warm to the touch?',
              required: true
            },
            {
              id: 'drainage',
              type: 'multiple_choice',
              question: 'Is there any drainage from the surgical site?',
              required: true,
              options: [
                'No drainage',
                'Clear fluid',
                'Bloody fluid',
                'Thick/cloudy fluid',
                'Pus or unusual discharge'
              ]
            },
            {
              id: 'mobility',
              type: 'rating',
              question: 'How would you rate your mobility today?',
              description: 'Rate from 1 (very limited) to 5 (moving well)',
              required: true,
              min: 1,
              max: 5
            }
          ]
        }
      };
    
    case 'medication_tracking':
      return {
        content: `Let's review your medication routine. I'll ask you about your pain medications and how they're working for you.`,
        form: {
          id: 'medication_tracking',
          title: 'Medication Review',
          description: 'Help us track your medication effectiveness',
          questions: [
            {
              id: 'pain_meds_taken',
              type: 'yes_no',
              question: 'Have you taken your pain medication as prescribed today?',
              required: true
            },
            {
              id: 'pain_relief',
              type: 'rating',
              question: 'How effective has your pain medication been?',
              description: 'Rate from 1 (not effective) to 5 (very effective)',
              required: true,
              min: 1,
              max: 5
            },
            {
              id: 'side_effects',
              type: 'multiple_choice',
              question: 'Are you experiencing any side effects from your medication?',
              required: true,
              options: [
                'No side effects',
                'Nausea',
                'Drowsiness',
                'Constipation',
                'Dizziness',
                'Other'
              ]
            },
            {
              id: 'other_medications',
              type: 'text',
              question: 'Are you taking any other medications or supplements?',
              placeholder: 'List any other medications, vitamins, or supplements',
              required: false
            }
          ]
        }
      };
    
    case 'weekly_progress':
      return {
        content: `Time for your weekly progress review! Let's discuss how you're feeling about your recovery this week.`,
        form: {
          id: 'weekly_progress',
          title: 'Weekly Progress Review',
          description: 'Reflect on your recovery progress this week',
          questions: [
            {
              id: 'overall_progress',
              type: 'rating',
              question: 'How would you rate your overall progress this week?',
              description: 'Rate from 1 (poor progress) to 5 (excellent progress)',
              required: true,
              min: 1,
              max: 5
            },
            {
              id: 'goals_achieved',
              type: 'multiple_choice',
              question: 'Which recovery goals did you achieve this week?',
              required: true,
              options: [
                'Completed all prescribed exercises',
                'Improved range of motion',
                'Reduced pain levels',
                'Increased walking distance',
                'Better sleep quality',
                'None of the above'
              ]
            },
            {
              id: 'challenges',
              type: 'textarea',
              question: 'What challenges did you face this week?',
              placeholder: 'Describe any difficulties or concerns you experienced',
              required: false
            },
            {
              id: 'next_week_goals',
              type: 'textarea',
              question: 'What are your goals for next week?',
              placeholder: 'What would you like to focus on or improve?',
              required: false
            },
            {
              id: 'support_needed',
              type: 'yes_no',
              question: 'Do you need additional support from your care team?',
              required: true
            }
          ]
        }
      };
    
    default:
      return {
        content: `I have a form for you to complete. This will help your care team better understand your progress.`,
        form: {
          id: 'generic_form',
          title: 'Health Assessment',
          description: 'Please answer these questions about your health',
          questions: [
            {
              id: 'general_feeling',
              type: 'multiple_choice',
              question: 'How are you feeling overall today?',
              required: true,
              options: [
                'Excellent',
                'Good',
                'Fair',
                'Poor'
              ]
            },
            {
              id: 'additional_comments',
              type: 'textarea',
              question: 'Is there anything else you\'d like your care team to know?',
              placeholder: 'Share any additional thoughts or concerns',
              required: false
            }
          ]
        }
      };
  }
}