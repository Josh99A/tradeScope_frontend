import { NextResponse } from "next/server";
import { appendSetCookies } from "@/lib/forwardCookies";

export async function GET(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const url = new URL(req.url);
  const resource = url.searchParams.get("resource");
  if (resource === "trade-requests") {
    const params = new URLSearchParams(url.searchParams);
    params.delete("resource");
    const query = params.toString();
    const res = await fetch(
      `${process.env.BACKEND_URL}/api/admin/trade-requests/${query ? `?${query}` : ""}`,
      { headers: { Cookie: cookie } }
    );
    const data = await res.json();
    const response = NextResponse.json(data, { status: res.status });
    appendSetCookies(res, response);
    return response;
  }
  const res = await fetch(`${process.env.BACKEND_URL}/api/admin/assets/`, {
    headers: { Cookie: cookie },
  });
  const data = await res.json();
  const response = NextResponse.json(data, { status: res.status });
  appendSetCookies(res, response);
  return response;
}

export async function POST(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const url = new URL(req.url);
  const resource = url.searchParams.get("resource");
  if (resource === "trade-requests") {
    return NextResponse.json(
      { detail: "Unsupported request." },
      { status: 400 }
    );
  }
  const contentType = req.headers.get("content-type") || "";
  let body: BodyInit | null = null;
  const headers: Record<string, string> = { Cookie: cookie };

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const forward = new FormData();
    form.forEach((value, key) => {
      forward.append(key, value);
    });
    body = forward;
  } else {
    const json = await req.json();
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(json);
  }

  const res = await fetch(`${process.env.BACKEND_URL}/api/admin/assets/`, {
    method: "POST",
    headers,
    body,
  });
  const data = await res.json();
  const response = NextResponse.json(data, { status: res.status });
  appendSetCookies(res, response);
  return response;
}
