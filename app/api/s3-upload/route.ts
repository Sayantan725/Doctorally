import { NextRequest, NextResponse } from 'next/server';
import s3 from '@/lib/s3';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fileName = searchParams.get('fileName');
  const fileType = searchParams.get('fileType');

  const key = `uploads/${Date.now()}-${fileName}`;
  const params = {
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: key,
    ContentType: fileType!,
    Expires: 60,
  };

  const uploadUrl = await s3.getSignedUrlPromise('putObject', params);

  return NextResponse.json({ uploadUrl, key });
}