import { NextResponse } from "next/server";
import { appendSetCookies } from "@/lib/forwardCookies";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  if (!resolvedParams.id || resolvedParams.id === "undefined") {
    return NextResponse.json(
      { detail: "Invalid user id." },
      { status: 400 }
    );
  }
  const cookie = req.headers.get("cookie") || "";
  console.log(`Disabling user with id: ${resolvedParams.id}`);
  const res = await fetch(
    `${process.env.BACKEND_URL}/api/admin/users/${resolvedParams.id}/disable/`,
    {
      method: "POST",
      headers: {
        Cookie: cookie,
      },
    }
  );

  const data = await res.json();
  const response = NextResponse.json(data, { status: res.status });
  appendSetCookies(res, response);
  return response;
}
