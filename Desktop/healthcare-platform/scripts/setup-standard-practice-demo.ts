#!/usr/bin/env tsx

/**
 * Demo Setup Script for Standard Practice Protocols
 * 
 * This script sets up a complete demo environment with:
 * 1. Standard practice protocols marked appropriately
 * 2. Demo patients with protocols assigned
 * 3. Test data for chat interface
 * 4. Realistic recovery timelines
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface DemoPatient {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  surgeryType: string;
  daysPostOp: number; // Negative = pre-op, 0 = surgery day, positive = post-op
}

const demoPatients: DemoPatient[] = [
  {
    email: 'sarah.patient@demo.com',
    password: 'DemoPass123!',
    firstName: 'Sarah',
    lastName: 'Johnson',
    surgeryType: 'TKA',
    daysPostOp: 3 // 3 days post-op
  },
  {
    email: 'michael.patient@demo.com',
    password: 'DemoPass123!',
    firstName: 'Michael',
    lastName: 'Thompson',
    surgeryType: 'THA',
    daysPostOp: 10 // 10 days post-op
  },
  {
    email: 'lisa.patient@demo.com',
    password: 'DemoPass123!',
    firstName: 'Lisa',
    lastName: 'Chen',
    surgeryType: 'TSA',
    daysPostOp: -7 // 7 days pre-op
  },
  {
    email: 'david.patient@demo.com',
    password: 'DemoPass123!',
    firstName: 'David',
    lastName: 'Rodriguez',
    surgeryType: 'TKA',
    daysPostOp: 0 // Surgery day
  }
];

async function setupStandardPracticeDemo() {
  console.log('🚀 Setting up Standard Practice Protocol Demo...\n');

  try {
    // 1. Get test tenant ID
    const { data: tenant } = await supabase
      .from('tenants')
      .select('id')
      .eq('name', 'TJV Orthopedics')
      .single();

    if (!tenant) {
      console.error('❌ Test tenant not found. Please run basic setup first.');
      return;
    }

    const tenantId = tenant.id;
    console.log(`✅ Using tenant: ${tenantId}`);

    // 2. Update existing protocols to mark some as standard practice
    console.log('\n📋 Setting up standard practice protocols...');
    
    const { data: protocols } = await supabase
      .from('protocols')
      .select('id, name')
      .eq('tenant_id', tenantId);

    if (protocols && protocols.length > 0) {
      // Mark the first protocol as standard practice
      const { error: updateError } = await supabase
        .from('protocols')
        .update({ is_standard_practice: true })
        .eq('id', protocols[0].id);

      if (updateError) {
        console.error('❌ Failed to update protocol:', updateError);
      } else {
        console.log(`✅ Marked "${protocols[0].name}" as standard practice`);
      }
    }

    // 3. Create demo patients
    console.log('\n👥 Creating demo patients...');
    
    for (const patient of demoPatients) {
      console.log(`\n   Creating ${patient.firstName} ${patient.lastName}...`);

      // Create auth user
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: patient.email,
        password: patient.password,
        email_confirm: true,
        user_metadata: {
          first_name: patient.firstName,
          last_name: patient.lastName,
          role: 'patient'
        }
      });

      if (authError) {
        console.error(`   ❌ Auth creation failed: ${authError.message}`);
        continue;
      }

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authUser.user.id,
          first_name: patient.firstName,
          last_name: patient.lastName,
          email: patient.email,
          role: 'patient',
          tenant_id: tenantId
        });

      if (profileError) {
        console.error(`   ❌ Profile creation failed: ${profileError.message}`);
        continue;
      }

      // Calculate surgery date
      const surgeryDate = new Date();
      surgeryDate.setDate(surgeryDate.getDate() - patient.daysPostOp);

      // Create patient record
      const { data: newPatient, error: patientError } = await supabase
        .from('patients')
        .insert({
          profile_id: authUser.user.id,
          tenant_id: tenantId,
          mrn: `DEMO-${Date.now()}-${patient.firstName}`,
          status: 'active',
          surgery_date: surgeryDate.toISOString(),
          surgery_type: patient.surgeryType,
          phone_number: `555-${Math.floor(Math.random() * 9000) + 1000}`
        })
        .select()
        .single();

      if (patientError) {
        console.error(`   ❌ Patient creation failed: ${patientError.message}`);
        continue;
      }

      console.log(`   ✅ Patient created: ${patient.firstName} ${patient.lastName}`);
      console.log(`      Surgery: ${patient.surgeryType} (${patient.daysPostOp > 0 ? `${patient.daysPostOp} days post-op` : patient.daysPostOp === 0 ? 'surgery day' : `${Math.abs(patient.daysPostOp)} days pre-op`})`);

      // Assign standard practice protocol
      if (protocols && protocols.length > 0) {
        const { data: assignment, error: assignError } = await supabase
          .from('patient_protocols')
          .insert({
            patient_id: newPatient.id,
            protocol_id: protocols[0].id,
            surgery_date: surgeryDate.toISOString(),
            surgery_type: patient.surgeryType,
            assigned_by: 'system',
            status: 'active'
          })
          .select()
          .single();

        if (assignError) {
          console.error(`   ❌ Protocol assignment failed: ${assignError.message}`);
        } else {
          console.log(`   ✅ Assigned standard practice protocol`);

          // Create some sample tasks for post-op patients
          if (patient.daysPostOp >= 0) {
            const sampleTasks = [
              {
                name: 'Pain Assessment',
                type: 'form',
                day: 1,
                chat_prompt: 'Please rate your pain level and describe any concerns you may have.',
                instructions: 'Complete the daily pain assessment form',
                required: true
              },
              {
                name: 'Ankle Pumps Exercise',
                type: 'exercise',
                day: 1,
                chat_prompt: 'Time for your ankle pumps! These help prevent blood clots and improve circulation.',
                instructions: 'Perform 10 ankle pumps every hour while awake',
                required: true
              },
              {
                name: 'Ice Application',
                type: 'message',
                day: 1,
                chat_prompt: 'Remember to ice your surgical site for 15-20 minutes every 2-3 hours.',
                instructions: 'Apply ice to reduce swelling and pain',
                required: false
              }
            ];

            for (const task of sampleTasks) {
              if (task.day <= patient.daysPostOp + 1) { // Only create tasks for current and past days
                await supabase
                  .from('patient_tasks')
                  .insert({
                    patient_protocol_id: assignment.id,
                    patient_id: newPatient.id,
                    day: task.day,
                    scheduled_date: new Date(surgeryDate.getTime() + (task.day * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
                    due_date: new Date(surgeryDate.getTime() + (task.day * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
                    status: task.day < patient.daysPostOp ? 'completed' : 'pending',
                    task_data: {
                      name: task.name,
                      type: task.type,
                      chat_prompt: task.chat_prompt,
                      instructions: task.instructions,
                      required: task.required
                    }
                  });
              }
            }
            console.log(`   ✅ Created sample tasks for recovery day ${patient.daysPostOp}`);
          }
        }
      }

      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // 4. Create demo conversations and messages for active patients
    console.log('\n💬 Setting up demo chat conversations...');
    
    const { data: activePatients } = await supabase
      .from('patients')
      .select('id, profile_id, surgery_date, profiles(first_name)')
      .eq('tenant_id', tenantId)
      .gte('surgery_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days

    for (const patient of activePatients || []) {
      const profile = patient.profiles as any;
      const surgeryDate = new Date(patient.surgery_date);
      const recoveryDay = Math.floor((new Date().getTime() - surgeryDate.getTime()) / (1000 * 60 * 60 * 24));

      if (recoveryDay >= 0) { // Only for post-op patients
        // Create conversation
        const { data: conversation, error: convError } = await supabase
          .from('conversations')
          .insert({
            patient_id: patient.id,
            status: 'active',
            total_messages: 0,
            last_activity_at: new Date().toISOString(),
            conversation_metadata: {
              recovery_day: recoveryDay,
              created_date: new Date().toISOString().split('T')[0]
            }
          })
          .select()
          .single();

        if (convError) {
          console.error(`   ❌ Failed to create conversation: ${convError.message}`);
          continue;
        }

        // Add welcome message
        await supabase
          .from('messages')
          .insert({
            conversation_id: conversation.id,
            sender_type: 'system',
            content: `🌟 **Welcome to TJV Standard Recovery Protocol**

Hi ${profile?.first_name}! I'm your digital recovery assistant. I'll be guiding you through your recovery journey with evidence-based tasks and check-ins.

You're currently on day ${recoveryDay} of your recovery. Let's make sure you're progressing well! 💙`,
            metadata: {
              is_welcome_message: true,
              is_standard_practice: true,
              recovery_day: recoveryDay
            },
            completion_status: 'completed'
          });

        // Add a task delivery message
        if (recoveryDay <= 7) {
          await supabase
            .from('messages')
            .insert({
              conversation_id: conversation.id,
              sender_type: 'system',
              content: `📋 **Daily Pain Assessment**

Please take a moment to rate your pain level and let me know how you're feeling today. This helps your care team monitor your recovery progress.

*Click "Complete Form" when ready to fill this out.*`,
              metadata: {
                task_type: 'form',
                is_protocol_delivery: true,
                requires_interaction: true,
                recovery_day: recoveryDay
              },
              completion_status: 'completed'
            });
        }

        console.log(`   ✅ Created conversation for ${profile?.first_name} (day ${recoveryDay})`);
      }
    }

    // 5. Summary
    console.log('\n📊 Demo Setup Summary:');
    console.log(`   • Created ${demoPatients.length} demo patients`);
    console.log(`   • Assigned standard practice protocols`);
    console.log(`   • Set up realistic recovery timelines`);
    console.log(`   • Created demo chat conversations`);
    console.log(`   • Generated sample tasks and messages`);

    console.log('\n🎯 Demo Login Credentials:');
    demoPatients.forEach(patient => {
      const status = patient.daysPostOp > 0 ? `${patient.daysPostOp} days post-op` : 
                   patient.daysPostOp === 0 ? 'surgery day' : 
                   `${Math.abs(patient.daysPostOp)} days pre-op`;
      console.log(`   📧 ${patient.email} / ${patient.password} (${patient.surgeryType}, ${status})`);
    });

    console.log('\n✅ Standard Practice Protocol Demo setup complete!');
    console.log('\n🚀 Next Steps:');
    console.log('   1. Login as any demo patient to test the chat interface');
    console.log('   2. Verify standard practice protocols appear with star badges');
    console.log('   3. Test protocol assignment automation');
    console.log('   4. Check real-time task delivery in patient chat');

  } catch (error) {
    console.error('❌ Demo setup failed:', error);
  }
}

// Run the setup
setupStandardPracticeDemo();