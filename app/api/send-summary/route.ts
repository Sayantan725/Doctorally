import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email, name, summary, type } = await req.json();
    await sendEmail({ email, name, summary, type });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Email sending failed", err);
    return NextResponse.json(
      { success: false, error: "Email failed to send" },
      { status: 500 }
    );
  }
}
