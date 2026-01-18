import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    const cookie = req.headers.get("cookie") || "";
    let body: BodyInit | null = null;
    const headers: Record<string, string> = { Cookie: cookie };

    if (contentType.includes("multipart/form-data")) {
      body = await req.formData();
    } else {
      const json = await req.json();
      body = JSON.stringify(json);
      headers["Content-Type"] = "application/json";
      
    }
    console.log("Register request body:", body);
    const res = await fetch(
      `${process.env.BACKEND_URL}/api/users/register/`,
      {
        method: "POST",
        headers,
        body,
        credentials: "include",
      }
    );

    const data = await res.json();

    const response = NextResponse.json(data, {
      status: res.status,
    });

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

    cookies.forEach((cookieValue) => {
      response.headers.append("set-cookie", cookieValue);
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
