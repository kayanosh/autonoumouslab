import { NextResponse } from "next/server";
import { auditWebsite } from "@/lib/audit/checks";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const url = typeof body?.url === "string" ? body.url.trim() : "";

    if (!url) {
      return NextResponse.json(
        { error: "Please enter a website URL." },
        { status: 400 }
      );
    }

    const result = await auditWebsite(url);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong running the audit.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
