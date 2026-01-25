import { NextResponse } from "next/server";
import { appendSetCookies } from "@/lib/forwardCookies";

export async function GET(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const url = new URL(req.url);
  const res = await fetch(
    `${process.env.BACKEND_URL}/api/trade-requests/${url.search}`,
    { headers: { Cookie: cookie } }
  );
  const data = await res.json();
  const response = NextResponse.json(data, { status: res.status });
  appendSetCookies(res, response);
  return response;
}

export async function POST(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const body = await req.json();
  const res = await fetch(`${process.env.BACKEND_URL}/api/trade-requests/`, {
    method: "POST",
    headers: {
      Cookie: cookie,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  const response = NextResponse.json(data, { status: res.status });
  appendSetCookies(res, response);
  return response;
}
