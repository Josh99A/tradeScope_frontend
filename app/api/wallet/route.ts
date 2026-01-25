import { NextResponse } from "next/server";
import { appendSetCookies } from "@/lib/forwardCookies";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const cookie = req.headers.get("cookie") || "";

  const res = await fetch(`${process.env.BACKEND_URL}/api/wallet/`, {
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
