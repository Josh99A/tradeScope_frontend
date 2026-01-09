import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const cookie = req.headers.get("cookie") || "";

  const res = await fetch(`${process.env.BACKEND_URL}/auth/me/`, {
    headers: {
      Cookie: cookie,
    },
  });

  if (!res.ok) {
    return NextResponse.json(null, { status: 401 });
  }

  const user = await res.json();
  return NextResponse.json(user);
}
