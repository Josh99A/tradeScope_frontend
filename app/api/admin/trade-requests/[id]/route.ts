import { NextResponse } from "next/server";
import { appendSetCookies } from "@/lib/forwardCookies";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id?: string }> }
) {
  const cookie = req.headers.get("cookie") || "";
  const resolved = await params;
  const id = resolved?.id;
  const res = await fetch(
    `${process.env.BACKEND_URL}/api/admin/trade-requests/${id}/`,
    { headers: { Cookie: cookie } }
  );
  const data = await res.json();
  const response = NextResponse.json(data, { status: res.status });
  appendSetCookies(res, response);
  return response;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id?: string }> }
) {
  const cookie = req.headers.get("cookie") || "";
  const url = new URL(req.url);
  const action = url.searchParams.get("action");
  const resolved = await params;
  const id = resolved?.id;
  if (!action) {
    return NextResponse.json({ detail: "Missing action." }, { status: 400 });
  }
  const body = await req.json();
  const res = await fetch(
    `${process.env.BACKEND_URL}/api/admin/trade-requests/${id}/${action}/`,
    {
      method: "POST",
      headers: {
        Cookie: cookie,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
  const data = await res.json();
  const response = NextResponse.json(data, { status: res.status });
  appendSetCookies(res, response);
  return response;
}
