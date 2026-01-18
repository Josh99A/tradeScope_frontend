import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const cookie = req.headers.get("cookie") || "";

  const res = await fetch(`${process.env.BACKEND_URL}/api/users/user-info/`, {
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

export async function PATCH(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const contentType = req.headers.get("content-type") || "";
  let body: BodyInit | null = null;
  const headers: Record<string, string> = { Cookie: cookie };

  if (contentType.includes("multipart/form-data")) {
    body = await req.formData();
  } else {
    const json = await req.json();
    body = JSON.stringify(json);
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${process.env.BACKEND_URL}/api/users/user-info/`, {
    method: "PATCH",
    headers,
    body,
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
