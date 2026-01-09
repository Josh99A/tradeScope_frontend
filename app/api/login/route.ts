import { NextResponse, NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const res = await fetch(
    `${process.env.BACKEND_URL}/api/users/login/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      credentials: "include",
    }
  );

  const data = await res.json();

  const response = NextResponse.json(data, { status: res.status });

  // 🔑 Forward cookies from Django → Browser
  const cookies = res.headers.get("set-cookie");
  if (cookies) {
    response.headers.set("set-cookie", cookies);
  }

  return response;
}
