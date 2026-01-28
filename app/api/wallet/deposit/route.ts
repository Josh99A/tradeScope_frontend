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

  let data: unknown;
  const contentType = res.headers.get("content-type") || "";
  const rawText = await res.text();
  if (contentType.includes("application/json")) {
    try {
      data = JSON.parse(rawText);
    } catch (error) {
      console.error("[Deposit] Invalid JSON from backend", {
        status: res.status,
        contentType,
        error,
        rawText: rawText.slice(0, 200),
      });
      data = { error: "Invalid response from backend." };
    }
  } else {
    console.error("[Deposit] Non-JSON response from backend", {
      status: res.status,
      contentType,
      rawText: rawText.slice(0, 200),
    });
    data = { error: "Unexpected response from backend." };
  }
  const response = NextResponse.json(data, { status: res.status });
  appendSetCookies(res, response);
  return response;
}
