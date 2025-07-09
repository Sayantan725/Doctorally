import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import { Image } from '@/models/Image';

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  const doc = await Image.create(body);
  return NextResponse.json({ _id: doc._id });
}