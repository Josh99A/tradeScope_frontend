import { NextResponse } from "next/server";
import { appendSetCookies } from "@/lib/forwardCookies";

export async function GET(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const res = await fetch(`${process.env.BACKEND_URL}/api/assets/`, {
    headers: {
      Cookie: cookie,
    },
  });
  const data = await res.json();
  const response = NextResponse.json(data, { status: res.status });
  appendSetCookies(res, response);
  return response;
}
