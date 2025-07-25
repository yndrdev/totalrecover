require('dotenv').config({ path: '.env.local' });

console.log('🔍 Checking OpenAI API setup...\n');

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error('❌ OPENAI_API_KEY is not set in .env.local');
  console.log('\n📋 To fix this:');
  console.log('1. Get your OpenAI API key from https://platform.openai.com/api-keys');
  console.log('2. Add it to your .env.local file:');
  console.log('   OPENAI_API_KEY=sk-...\n');
} else {
  console.log('✅ OPENAI_API_KEY is configured');
  console.log(`   Key starts with: ${apiKey.substring(0, 7)}...`);
  console.log(`   Key length: ${apiKey.length} characters\n`);
  
  // Test the API key
  console.log('🧪 Testing OpenAI API connection...');
  testOpenAI(apiKey);
}

async function testOpenAI(apiKey) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Say "API test successful" in 5 words or less.' }
        ],
        max_tokens: 10
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ OpenAI API test successful!');
      console.log(`   Response: ${data.choices[0].message.content}`);
    } else {
      console.error('❌ OpenAI API test failed:', data.error?.message || 'Unknown error');
      if (data.error?.type === 'invalid_api_key') {
        console.log('\n💡 Your API key appears to be invalid. Please check it.');
      }
    }
  } catch (error) {
    console.error('❌ Failed to connect to OpenAI:', error.message);
  }
}