import { NextResponse } from "next/server";
import { getTransport } from "@/lib/mailer";

function isEmail(x: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const company = String(body.company || "").trim();
    const subject = String(body.subject || "").trim();
    const message = String(body.message || "").trim();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "Please fill all required fields." }, { status: 400 });
    }
    if (!isEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
    }
    if (message.length < 10) {
      return NextResponse.json({ error: "Message is too short." }, { status: 400 });
    }

    // Basic rate limit (best effort). For production: Upstash/Redis.
    // Works in long-lived Node runtime; serverless may reset.
    const ip = req.headers.get("x-forwarded-for") || "unknown";

    const to = process.env.CONTACT_TO!;
    const from = process.env.CONTACT_FROM!;

    const transporter = getTransport();

    await transporter.sendMail({
      from: `layer3studio <${from}>`,
      to,
      replyTo: email,
      subject: `New inquiry: ${subject}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        `Company: ${company || "-"}`,
        `IP: ${ip}`,
        "",
        message,
      ].join("\n"),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to send message. Check SMTP settings." },
      { status: 500 }
    );
  }
}