import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ summary: 'Summary unavailable (no file).' });

  try {
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const dataUri = `data:${file.type};base64,${base64}`;

    // Perplexity API endpoint
    const API_URL = 'https://api.perplexity.ai/chat/completions';
    const API_KEY = process.env.PERPLEXITY_API_KEY; // Set your API key in environment variables

    const payload = {
      model: 'sonar-pro', // or 'sonar-medium-online', adjust as needed
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: dataUri } },
            { type: 'text', text: 'Summarize the pathological test report attached. If some parameters are out of range then mention about that parameter and potential risks of it. Do not return data as markdown. Return only the summary and elaborate it to make at least 3 sentences and almost 6 sentences. The summary should not exceed 300 words. Strictly do not mention any referrences like [1][2] etc' }
          ]
        }
      ]
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    const summary = result?.choices?.[0]?.message?.content?.trim() || 'Summary unavailable.';
    return NextResponse.json({ summary });
  } catch (err) {
    console.error('Perplexity API error', err);
    return NextResponse.json({ summary: 'Summary unavailable (Perplexity API error).' });
  }
}
