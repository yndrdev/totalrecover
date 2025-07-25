#!/usr/bin/env tsx
/**
 * Test script to verify custom views and functions work correctly:
 * 1. staff view (user-friendly view of providers)
 * 2. staff_patient_tags view (provider-patient assignments)
 * 3. Helper functions for task generation
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

// Create service role client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function testStaffView() {
  console.log('\n🧪 Testing: staff view')
  console.log('=======================')
  
  try {
    const { data: staff, error } = await supabase
      .from('staff')
      .select('*')
      .order('role', { ascending: true })
    
    if (error) {
      throw new Error(`Failed to query staff view: ${error.message}`)
    }
    
    console.log(`✅ Found ${staff.length} staff members:`)
    staff.forEach(member => {
      console.log(`   - ${member.first_name} ${member.last_name} (${member.role})`)
      console.log(`     Email: ${member.email}`)
      console.log(`     Department: ${member.department || 'Not specified'}`)
      console.log(`     License: ${member.license_number || 'Not specified'}`)
      console.log('')
    })
    
  } catch (error: any) {
    console.error('❌ Test failed:', error.message)
  }
}

async function testStaffPatientTags() {
  console.log('\n🧪 Testing: staff_patient_tags view')
  console.log('=====================================')
  
  try {
    const { data: tags, error } = await supabase
      .from('staff_patient_tags')
      .select(`
        *,
        staff:providers!staff_id(
          profile:profiles!profile_id(
            first_name,
            last_name,
            role
          )
        ),
        patient:patients!patient_id(
          mrn,
          patient_type,
          profile:profiles!profile_id(
            first_name,
            last_name
          )
        )
      `)
      .eq('status', 'active')
    
    if (error) {
      throw new Error(`Failed to query staff_patient_tags view: ${error.message}`)
    }
    
    console.log(`✅ Found ${tags.length} active staff-patient assignments:`)
    
    // Group by patient for better display
    const patientGroups: any = {}
    tags.forEach(tag => {
      const patientName = tag.patient?.profile?.first_name && tag.patient?.profile?.last_name
        ? `${tag.patient.profile.first_name} ${tag.patient.profile.last_name}`
        : 'Unknown'
      const patientKey = `${patientName} (${tag.patient?.mrn})`
      
      if (!patientGroups[patientKey]) {
        patientGroups[patientKey] = []
      }
      
      const staffName = tag.staff?.profile?.first_name && tag.staff?.profile?.last_name
        ? `${tag.staff.profile.first_name} ${tag.staff.profile.last_name}`
        : 'Unknown'
      
      patientGroups[patientKey].push({
        staffName,
        role: tag.staff?.profile?.role,
        tagType: tag.tag_type
      })
    })
    
    // Display grouped results
    Object.entries(patientGroups).forEach(([patient, assignments]: [string, any[]]) => {
      console.log(`\n   Patient: ${patient}`)
      assignments.forEach(assignment => {
        console.log(`     - ${assignment.staffName} (${assignment.role}) - ${assignment.tagType}`)
      })
    })
    
  } catch (error: any) {
    console.error('❌ Test failed:', error.message)
  }
}

async function testPatientDaysCalculation() {
  console.log('\n🧪 Testing: days_relative_to_surgery calculation')
  console.log('=================================================')
  
  try {
    const { data: patients, error } = await supabase
      .from('patients')
      .select(`
        mrn,
        patient_type,
        surgery_date,
        days_relative_to_surgery,
        profile:profiles!profile_id(
          first_name,
          last_name
        )
      `)
      .not('surgery_date', 'is', null)
    
    if (error) {
      throw new Error(`Failed to query patients: ${error.message}`)
    }
    
    console.log(`✅ Checking days calculation for ${patients.length} patients:`)
    patients.forEach(patient => {
      const name = patient.profile?.first_name && patient.profile?.last_name
        ? `${patient.profile.first_name} ${patient.profile.last_name}`
        : 'Unknown'
      
      console.log(`\n   ${name} (${patient.mrn})`)
      console.log(`     Type: ${patient.patient_type}`)
      console.log(`     Surgery Date: ${patient.surgery_date}`)
      console.log(`     Days Relative to Surgery: ${patient.days_relative_to_surgery}`)
      
      // Verify calculation
      if (patient.surgery_date) {
        const surgeryDate = new Date(patient.surgery_date)
        const today = new Date()
        const diffDays = Math.floor((today.getTime() - surgeryDate.getTime()) / (1000 * 60 * 60 * 24))
        const expectedDays = patient.patient_type === 'preop' ? -diffDays : diffDays
        
        if (Math.abs(expectedDays - (patient.days_relative_to_surgery || 0)) <= 1) {
          console.log(`     ✅ Calculation correct`)
        } else {
          console.log(`     ❌ Calculation incorrect (expected: ${expectedDays})`)
        }
      }
    })
    
  } catch (error: any) {
    console.error('❌ Test failed:', error.message)
  }
}

async function testTaskCategories() {
  console.log('\n🧪 Testing: task_categories table')
  console.log('===================================')
  
  try {
    const { data: categories, error } = await supabase
      .from('task_categories')
      .select('*')
      .order('display_order', { ascending: true })
    
    if (error) {
      throw new Error(`Failed to query task_categories: ${error.message}`)
    }
    
    console.log(`✅ Found ${categories.length} task categories:`)
    categories.forEach(category => {
      console.log(`   - ${category.name} (${category.patient_type})`)
      console.log(`     ${category.description}`)
    })
    
    // Check tasks by category
    const { data: tasksByCategory, error: tasksError } = await supabase
      .from('tasks')
      .select('category_id, task_type')
      .not('category_id', 'is', null)
    
    if (!tasksError) {
      const categoryCounts: any = {}
      tasksByCategory.forEach(task => {
        categoryCounts[task.category_id] = (categoryCounts[task.category_id] || 0) + 1
      })
      
      console.log('\n📊 Tasks per category:')
      categories.forEach(category => {
        const count = categoryCounts[category.id] || 0
        console.log(`   - ${category.name}: ${count} tasks`)
      })
    }
    
  } catch (error: any) {
    console.error('❌ Test failed:', error.message)
  }
}

async function runAllTests() {
  console.log('🚀 Starting Demo Views and Functions Tests')
  console.log('==========================================')
  
  await testStaffView()
  await testStaffPatientTags()
  await testPatientDaysCalculation()
  await testTaskCategories()
  
  console.log('\n✅ All view tests completed!')
}

// Run the tests
runAllTests().catch(console.error)