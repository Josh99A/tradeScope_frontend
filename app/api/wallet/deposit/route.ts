import { NextResponse } from "next/server";
import { appendSetCookies } from "@/lib/forwardCookies";

export async function POST(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const body = await req.json();

  const res = await fetch(
    `${process.env.BACKEND_URL}/api/deposits/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      body: JSON.stringify(body),
    }
  );

  const data = await res.json();
  const response = NextResponse.json(data, { status: res.status });
  appendSetCookies(res, response);
  return response;
}
