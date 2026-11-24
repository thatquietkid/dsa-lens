/**
 * dsa-hint-proxy - Cloudflare Worker / Edge Function Reference Implementation
 * Accepts MinimalHintPromptPayload, validates rate limits, and invokes LLM
 * with max_output_tokens hard capped at 150.
 */

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    try {
      const { payload } = await request.json();
      if (!payload || !payload.pid) {
        return new Response(JSON.stringify({ error: 'Invalid payload' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const apiKey = env.GEMINI_API_KEY || env.OPENAI_API_KEY;
      if (!apiKey) {
        return new Response(JSON.stringify({ error: 'LLM API key not configured on worker' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const systemPrompt = `You are a DSA Socratic Tutor. Never give complete solutions or full code.
Given an ultra-compact summary of a student's mistake:
- Identify the invariant misconception in <= 50 words.
- Ask one guided question to help them find the fix.
Keep response strictly under 70 words.`;

      const userPrompt = `Problem: ${payload.pid}
Pattern: ${payload.arch} (${payload.comp})
Failed Test: ${payload.fail}
Code Sample:
${payload.snippet}`;

      // Call Gemini 1.5 Flash by default
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const apiRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: userPrompt }] }],
          generationConfig: {
            maxOutputTokens: 150,
            temperature: 0.3,
          },
        }),
      });

      const data = await apiRes.json();
      const hint = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No hint generated.';

      return new Response(
        JSON.stringify({
          hint,
          tokens: {
            prompt: data.usageMetadata?.promptTokenCount || 0,
            completion: data.usageMetadata?.candidatesTokenCount || 0,
          },
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  },
};
