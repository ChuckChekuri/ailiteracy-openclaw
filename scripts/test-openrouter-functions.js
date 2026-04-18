import 'dotenv/config';

console.log('--- test-openrouter-functions.js ---');

{
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    console.error('Error: OPENROUTER_API_KEY not found in .env file.');
    process.exit(1);
  }

  console.log(`Using API Key: ...${apiKey.slice(-4)}`);

  const apiUrl = 'https://openrouter.ai/api/v1/chat/completions';

  const payload = {
    model: 'openai/gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant with access to functions. Use them when necessary.'
      },
      {
        role: 'user',
        content: 'What is the weather like in San Francisco?'
      }
    ],
    tools: [
      {
        type: 'function',
        function: {
          name: 'getCurrentWeather',
          description: 'Get the current weather in a given location',
          parameters: {
            type: 'object',
            properties: {
              location: {
                type: 'string',
                description: 'The city and state, e.g. San Francisco, CA',
              },
              unit: {
                type: 'string',
                enum: ['celsius', 'fahrenheit']
              },
            },
            required: ['location'],
          },
        },
      },
    ],
    tool_choice: 'auto',
    temperature: 0.3,
  };

  console.log('Sending request to OpenRouter API...');
  console.log('Model:', payload.model);
  console.log('Prompt:', payload.messages[1].content);

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/ailiteracy-openclaw',
        'X-Title': 'ailiteracy-openclaw',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`API request failed with status: ${response.status}`);
      const errorBody = await response.text();
      console.error('Response body:', errorBody);
      process.exit(1);
    }

    const data = await response.json();

    console.log('\n--- OpenRouter API Response ---');
    console.log(JSON.stringify(data, null, 2));
    console.log('-------------------------------\n');

    if (data.choices?.[0]?.message?.tool_calls) {
      console.log('✅ Success! The model correctly identified that it should use a tool.');
      console.log('Tool call:', data.choices[0].message.tool_calls[0]);
    } else {
      console.log('❌ Failure. The model did not return a tool call. It responded with a direct message instead:');
      console.log(data.choices?.[0]?.message?.content);
    }

  } catch (error) {
    console.error('An error occurred while calling the OpenRouter API:', error);
  }
}
