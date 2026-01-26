import { NextResponse } from "next/server";
import { appendSetCookies } from "@/lib/forwardCookies";

export async function GET(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const { search } = new URL(req.url);

  const res = await fetch(`${process.env.BACKEND_URL}/api/transactions/${search}`, {
    headers: {
      Cookie: cookie,
    },
  });

  const contentType = res.headers.get("content-type") || "";
  let payload;
  if (contentType.includes("application/json")) {
    payload = await res.json();
  } else {
    const text = await res.text();
    payload = {
      detail: "Upstream error while loading activity.",
      status: res.status,
      response: text.slice(0, 1000),
    };
  }
  const response = NextResponse.json(payload, { status: res.status });
  appendSetCookies(res, response);
  return response;
}
