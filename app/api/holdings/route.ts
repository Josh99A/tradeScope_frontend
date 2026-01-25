import { NextResponse } from "next/server";
import { appendSetCookies } from "@/lib/forwardCookies";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const url = new URL(req.url);
  const resource = url.searchParams.get("resource");
  if (resource === "trade-requests") {
    const params = new URLSearchParams(url.searchParams);
    params.delete("resource");
    const query = params.toString();
    const res = await fetch(
      `${process.env.BACKEND_URL}/api/trade-requests/${query ? `?${query}` : ""}`,
      { headers: { Cookie: cookie }, cache: "no-store" }
    );
    const data = await res.json();
    const response = NextResponse.json(data, { status: res.status });
    appendSetCookies(res, response);
    return response;
  }

  const res = await fetch(`${process.env.BACKEND_URL}/api/holdings/`, {
    headers: {
      Cookie: cookie,
    },
    cache: "no-store",
  });

  const data = await res.json();
  const response = NextResponse.json(data, { status: res.status });
  appendSetCookies(res, response);
  return response;
}

export async function POST(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const url = new URL(req.url);
  const resource = url.searchParams.get("resource");
  if (resource !== "trade-requests") {
    return NextResponse.json({ detail: "Unsupported request." }, { status: 400 });
  }
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
