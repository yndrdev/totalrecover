const { populateExercises } = require('./populate-exercises-fixed');
const { populateForms } = require('./populate-forms-fixed');

async function populateAllData() {
  console.log('🚀 Starting comprehensive data population...\n');
  
  try {
    // Populate exercises first
    console.log('📋 Step 1: Populating exercises...');
    await populateExercises();
    console.log('✅ Exercises population completed!\n');
    
    // Populate forms second
    console.log('📝 Step 2: Populating forms...');
    await populateForms();
    console.log('✅ Forms population completed!\n');
    
    console.log('🎉 All data population completed successfully!');
    console.log('');
    console.log('Summary:');
    console.log('- ✅ Exercises table populated with comprehensive workout data');
    console.log('- ✅ Forms table populated with medical questionnaires');
    console.log('');
    console.log('Your healthcare platform database is now ready for use!');
    
  } catch (error) {
    console.error('❌ Error during data population:', error);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  populateAllData().then(() => {
    process.exit(0);
  }).catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}

module.exports = { populateAllData };