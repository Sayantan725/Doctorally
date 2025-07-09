import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ summary: 'Summary unavailable (no file).' });

  try {
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    const resp = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: `data:${file.type};base64,${base64}` } },
            { type: 'text', text: 'Give a concise plain‑text summary (≤60 words).' },
          ],
        },
      ],
    });

    const summary = resp.choices[0].message.content?.trim() || 'Summary unavailable.';
    return NextResponse.json({ summary });
  } catch (err) {
    console.error('OpenAI error', err);
    return NextResponse.json({ summary: 'Summary unavailable (OpenAI error).' });
  }
}