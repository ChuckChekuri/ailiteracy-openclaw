import 'dotenv/config';
import fetch from 'node-fetch';

async function listGroqModels() {
  const groqApiKey = process.env.GROQ_API_KEY;

  if (!groqApiKey) {
    console.error('Error: GROQ_API_KEY not found in your .env file.');
    process.exit(1);
  }

  const apiUrl = 'https://api.groq.com/openai/v1/models';

  console.log('Fetching models from Groq API...');

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`API request failed with status: ${response.status}`);
      const errorBody = await response.text();
      console.error('Response body:', errorBody);
      return;
    }

    const data = await response.json();

    console.log('\n--- Available Groq Models ---');
    console.log(JSON.stringify(data, null, 2));
    console.log('---------------------------\n');

  } catch (error) {
    console.error('An error occurred while calling the Groq API:', error);
  }
}

listGroqModels();
