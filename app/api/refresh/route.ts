import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const cookie = req.headers.get("cookie") || "";

    const res = await fetch(
      `${process.env.BACKEND_URL}/api/users/refresh/`,
      {
        method: "POST",
        headers: {
          Cookie: cookie,
        },
        credentials: "include",
      }
    );

    const data = await res.json();
    const response = NextResponse.json(data, { status: res.status });

    const getSetCookie = (res.headers as unknown as { getSetCookie?: () => string[] })
      .getSetCookie;
    const cookies = getSetCookie
      ? getSetCookie()
      : (() => {
          const single = res.headers.get("set-cookie");
          return single ? [single] : [];
        })();

    cookies.forEach((cookieValue) => {
      response.headers.append("set-cookie", cookieValue);
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Token refresh failed" },
      { status: 500 }
    );
  }
}
