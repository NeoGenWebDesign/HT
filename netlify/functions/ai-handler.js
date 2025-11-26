/**
 * Netlify Function: AI Handler
 * 
 * This function accepts POST requests with JSON payload: { input: "user text" }
 * and returns a processed response: { result: "processed text" }
 * 
 * Usage from frontend:
 *   fetch('/netlify/functions/ai-handler', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ input: 'user input text' })
 *   }).then(res => res.json()).then(data => console.log(data.result))
 */

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed. Use POST.' })
    };
  }

  try {
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    const userInput = body.input || '';

    if (!userInput.trim()) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No input provided. Send { input: "text" }' })
      };
    }

    // --- Process the input ---
    // Example 1: Echo with metadata
    // const result = `You sent: "${userInput}" (${userInput.length} characters)`;

    // Example 2: Simple uppercase transformation
    // const result = userInput.toUpperCase();

    // Example 3: Simulate AI analysis (count words, detect keywords, etc.)
    const wordCount = userInput.trim().split(/\s+/).length;
    const hasNetworking = /network|protocol|dns|tcp|ip|routing|vlan|osi/i.test(userInput);
    const hasSecurity = /security|ssl|tls|firewall|encryption|hash/i.test(userInput);

    const analysis = {
      input: userInput,
      wordCount,
      detectedTopics: [],
      summary: ''
    };

    if (hasNetworking) analysis.detectedTopics.push('Networking');
    if (hasSecurity) analysis.detectedTopics.push('Security');

    if (analysis.detectedTopics.length > 0) {
      analysis.summary = `Detected ${analysis.detectedTopics.length} topic(s): ${analysis.detectedTopics.join(', ')}. Input has ${wordCount} word(s).`;
    } else {
      analysis.summary = `Generic input with ${wordCount} word(s). No networking/security keywords detected.`;
    }

    // Return response
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ result: analysis.summary })
    };
  } catch (err) {
    console.error('AI Handler Error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error: ' + err.message })
    };
  }
};
