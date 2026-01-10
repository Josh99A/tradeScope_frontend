import { NextRequest,  NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const cookie = req.headers.get("cookie") || "";

    const res = await fetch(
      `${process.env.BACKEND_URL}/api/users/logout/`,
      {
        method: "POST",
        headers: {
          Cookie: cookie, // forward auth cookies
        },
        credentials: "include",
      }
    );

    // Forward backend response
    const data = await res.json();

    // Create Next.js response
    const response = NextResponse.json(data, {
      status: res.status,
    });

    // Explicitly clear cookies on frontend domain as well
    response.cookies.delete("access_token");
    response.cookies.delete("refresh_token");

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Logout failed" },
      { status: 500 }
    );
  }
}
