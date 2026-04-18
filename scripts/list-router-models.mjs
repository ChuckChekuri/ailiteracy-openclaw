import 'dotenv/config';
import fetch from 'node-fetch';

async function listOpenRouterModels() {
  const openRouterApiKey = process.env.OPENROUTER_API_KEY;

  if (!openRouterApiKey) {
    console.error('Error: OPENROUTER_API_KEY not found in your .env file.');
    process.exit(1);
  }

  const apiUrl = 'https://openrouter.ai/api/v1/models';

  console.log('Fetching models from OpenRouter API...');

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`API request failed with status: ${response.status}`);
      const errorBody = await response.text();
      console.error('Response body:', errorBody);
      return;
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const body = await response.text();
      console.error('Expected JSON but got:', contentType || 'unknown content-type');
      console.error('Body preview:', body.slice(0, 300));
      return;
    }

    const data = await response.json();

    console.log('\n--- Available OpenRouter Models ---');
    console.log(JSON.stringify(data, null, 2));
    console.log('---------------------------\n');

  } catch (error) {
    console.error('An error occurred while calling the OpenRouter API:', error);
  }
}

listOpenRouterModels();
