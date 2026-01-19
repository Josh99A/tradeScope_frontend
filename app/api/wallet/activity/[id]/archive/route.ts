import { NextResponse } from "next/server";
import { appendSetCookies } from "@/lib/forwardCookies";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id?: string }> }
) {
  const cookie = req.headers.get("cookie") || "";
  const resolvedParams = await params;
  const trimmed = String(resolvedParams?.id || "").trim().toLowerCase();
  if (!trimmed || trimmed === "undefined" || trimmed === "null") {
    return NextResponse.json(
      { detail: "Invalid activity id." },
      { status: 400 }
    );
  }

  const res = await fetch(
    `${process.env.BACKEND_URL}/api/transactions/${resolvedParams.id}/archive/`,
    {
      method: "POST",
      headers: {
        Cookie: cookie,
      },
    }
  );

  const data = await res.json();
  const response = NextResponse.json(data, { status: res.status });
  appendSetCookies(res, response);
  return response;
}
