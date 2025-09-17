// app/api/save-metadata/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { connectDB } from "@/lib/mongoose";
import { Image } from "@/models/Image";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  await connectDB();

  const doc = await Image.create({
    userId: session.user.id,
    fileName: body.fileName,
    imageKey: body.imageKey,
    imageUrl: body.imageUrl,
    summary: body.summary,
    reportName: body.reportName || null,
    reportDate: body.reportDate || null,
    doctorId: body.doctorId || null, // reference to Doctor collection
  });

  return NextResponse.json({ _id: doc._id });
}
