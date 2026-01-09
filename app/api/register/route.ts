import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const cookie = req.headers.get("cookie") || "";

  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL
}/api/users/user-info/`, {
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
