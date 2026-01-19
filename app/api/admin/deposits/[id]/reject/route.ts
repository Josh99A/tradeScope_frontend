import { NextResponse } from "next/server";
import { appendSetCookies } from "@/lib/forwardCookies";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  if (!resolvedParams.id || resolvedParams.id === "undefined") {
    return NextResponse.json(
      { detail: "Invalid deposit id." },
      { status: 400 }
    );
  }
  const cookie = req.headers.get("cookie") || "";

  const res = await fetch(
    `${process.env.BACKEND_URL}/api/admin/deposits/${resolvedParams.id}/reject/`,
    {
      method: "POST",
      headers: {
        Cookie: cookie,
      },
    }
  );

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await res.json()
    : { detail: await res.text() };
  const response = NextResponse.json(data, { status: res.status });
  appendSetCookies(res, response);
  return response;
}
