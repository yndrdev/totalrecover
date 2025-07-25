import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Pre-op questions sequence based on your documentation
const PREOP_QUESTIONS = [
  {
    id: 'smoking',
    question: "Do you smoke or use any tobacco products?",
    type: 'yes_no',
    options: ['No, I don\'t use tobacco', 'Yes, I smoke cigarettes', 'I use other tobacco products', 'I recently quit']
  },
  {
    id: 'diabetes',
    question: "Do you have diabetes?",
    type: 'yes_no',
    options: ['No', 'Yes, Type 1', 'Yes, Type 2', 'Pre-diabetes']
  },
  {
    id: 'heart_disease',
    question: "Do you have any heart conditions or heart disease?",
    type: 'yes_no',
    options: ['No', 'Yes, coronary artery disease', 'Yes, heart failure', 'Yes, arrhythmia', 'Yes, other heart condition']
  },
  {
    id: 'blood_thinners',
    question: "Are you taking any blood thinners?",
    type: 'yes_no',
    options: ['No', 'Yes, Warfarin', 'Yes, aspirin', 'Yes, other blood thinner']
  },
  {
    id: 'medications',
    question: "Please list all current medications you are taking, including dosage:",
    type: 'text',
    followUp: 'Include prescription medications, over-the-counter drugs, vitamins, and supplements.'
  },
  {
    id: 'allergies',
    question: "Do you have any drug allergies?",
    type: 'yes_no_text',
    options: ['No known drug allergies', 'Yes, I have drug allergies'],
    followUp: 'If yes, please describe your allergies and reactions.'
  },
  {
    id: 'previous_surgeries',
    question: "Have you had any previous surgeries?",
    type: 'yes_no_text',
    options: ['No previous surgeries', 'Yes, I have had surgery before'],
    followUp: 'If yes, please list the surgeries and approximate dates.'
  },
  {
    id: 'medical_conditions',
    question: "Do you have any other medical conditions we should know about?",
    type: 'text',
    followUp: 'Include conditions like high blood pressure, kidney disease, liver disease, etc.'
  }
]

export async function POST(request: NextRequest) {
  try {
    const { message, patientName, phase, questionIndex, responses } = await request.json()

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-mock-key') {
      return handleMockResponse(message, patientName, phase, questionIndex, responses)
    }

    // Handle pre-op questionnaire flow
    if (phase === 'pre-op') {
      return handlePreOpQuestionnaire(message, patientName, questionIndex, responses)
    }

    // Handle regular chat with OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a compassionate healthcare recovery assistant for TJV Recovery Platform. You're helping ${patientName} with their ${phase === 'pre-op' ? 'pre-operative preparation' : 'post-operative recovery'} for Total Knee Replacement surgery. 

Key guidelines:
- Be warm, supportive, and professional
- Use the patient's name occasionally
- Provide helpful, accurate medical information
- Encourage patients and acknowledge their concerns
- If asked about serious medical issues, recommend consulting their healthcare provider
- Keep responses concise but caring
- Focus on recovery progress and patient well-being`
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    })

    return NextResponse.json({
      message: completion.choices[0].message.content,
      type: 'ai_response'
    })

  } catch (error) {
    console.error('OpenAI API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    )
  }
}

async function handlePreOpQuestionnaire(message: string, patientName: string, questionIndex: number = 0, responses: any = {}) {
  // Start of questionnaire
  if (questionIndex === 0 && !message) {
    return NextResponse.json({
      message: `Hi ${patientName}! I'm your recovery assistant. Let's complete your pre-operative assessment to ensure you're well-prepared for your Total Knee Replacement surgery. This will only take a few minutes.`,
      type: 'questionnaire_start',
      nextQuestion: PREOP_QUESTIONS[0],
      questionIndex: 0
    })
  }

  // Process current response and move to next question
  if (questionIndex < PREOP_QUESTIONS.length) {
    const currentQuestion = PREOP_QUESTIONS[questionIndex]
    const nextIndex = questionIndex + 1
    
    // Store the response
    responses[currentQuestion.id] = message

    // Check if we have more questions
    if (nextIndex < PREOP_QUESTIONS.length) {
      const nextQuestion = PREOP_QUESTIONS[nextIndex]
      return NextResponse.json({
        message: `Thank you. ${nextQuestion.question}`,
        type: 'questionnaire_question',
        question: nextQuestion,
        questionIndex: nextIndex,
        responses: responses
      })
    } else {
      // Questionnaire complete
      return NextResponse.json({
        message: `Perfect! Thank you for completing your pre-operative assessment, ${patientName}. Your surgical team now has all the information they need to provide you with the best possible care. Is there anything else you'd like to discuss about your upcoming surgery?`,
        type: 'questionnaire_complete',
        responses: responses
      })
    }
  }

  // Regular conversation after questionnaire
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a healthcare recovery assistant helping ${patientName} prepare for Total Knee Replacement surgery. The patient has completed their pre-operative questionnaire. Be supportive and answer any questions they have about their upcoming surgery, recovery process, or preparation steps.`
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    })

    return NextResponse.json({
      message: completion.choices[0].message.content,
      type: 'ai_response'
    })
  } catch (error) {
    return handleMockResponse(message, patientName, 'pre-op', -1, responses)
  }
}

function handleMockResponse(message: string, patientName: string, phase: string, questionIndex: number, responses: any) {
  // Mock responses when OpenAI API is not configured
  const mockResponses = {
    'pre-op': [
      `Hi ${patientName}! I'm your recovery assistant. Let's complete your pre-operative assessment for your Total Knee Replacement surgery.`,
      "Thank you for that information. This helps us provide you with the best possible care.",
      "I understand your concerns about the upcoming surgery. Your surgical team is highly experienced and will take excellent care of you.",
      "That's great information to have in your medical record. Let's continue with the next question."
    ],
    'post-op': [
      `Hello ${patientName}! How are you feeling today during your recovery?`,
      "It's normal to experience some discomfort during recovery. Keep following your exercise routine and taking medications as prescribed.",
      "Your progress sounds encouraging! Remember to ice the area and elevate your leg when resting.",
      "I'm here to support you through your recovery journey. Feel free to ask me anything about your exercises or pain management."
    ]
  }

  const responses_array = mockResponses[phase as keyof typeof mockResponses] || mockResponses['post-op']
  const randomResponse = responses_array[Math.floor(Math.random() * responses_array.length)]

  return NextResponse.json({
    message: randomResponse,
    type: 'mock_response',
    note: 'Using mock response - OpenAI API key not configured'
  })
}