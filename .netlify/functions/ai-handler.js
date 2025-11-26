/**
 * Netlify Function to securely call the OpenAI API.
 * * This file should be placed in the 'netlify/functions' directory of your project.
 * It automatically uses the OPENAI_API_KEY environment variable you set in the Netlify dashboard.
 */
export default async (event, context) => {
    // 1. Ensure the request is a POST request
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: "Method Not Allowed. Use POST." }),
        };
    }

    // 2. Read the API Key from the Netlify Environment Variable
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        console.error("OPENAI_API_KEY is not set in environment variables.");
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Server configuration error: API Key missing." }),
        };
    }

    // 3. Parse the request body sent from the frontend
    let requestBody;
    try {
        requestBody = JSON.parse(event.body);
    } catch (e) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Invalid JSON format in request body." }),
        };
    }

    const { prompt } = requestBody;
    if (!prompt) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Missing 'prompt' in request body." }),
        };
    }

    // 4. Call the OpenAI API securely
    try {
        const openaiUrl = "https://api.openai.com/v1/chat/completions";
        
        const response = await fetch(openaiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // Crucial step: Use the secret API key in the Authorization header
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo", // You can change this to gpt-4 or any other model
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful assistant for a website called Javasim. Keep your answers concise and relevant to the user's query."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: 300,
            }),
        });

        // Check if the API call failed
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`OpenAI API Error: ${response.status} - ${errorText}`);
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: `AI API failed: ${errorText}` }),
            };
        }

        const data = await response.json();
        
        // 5. Extract the generated text and send it back to the frontend
        const aiResponseText = data.choices?.[0]?.message?.content || "No response received from AI.";
        
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ result: aiResponseText }),
        };

    } catch (error) {
        console.error("Unhandled error in function:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal Server Error during API call." }),
        };
    }
};
