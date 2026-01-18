import { NextResponse, NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log("Login request body:", body);

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
  const headersWithCookies = res.headers as Headers & {
    getSetCookie?: (this: Headers) => string[];
  };
  const getSetCookie = headersWithCookies.getSetCookie;
  const cookies = getSetCookie
    ? getSetCookie.call(res.headers)
    : (() => {
        const single = res.headers.get("set-cookie");
        return single ? [single] : [];
      })();

  cookies.forEach((cookie) => {
    response.headers.append("set-cookie", cookie);
  });

  return response;
}
