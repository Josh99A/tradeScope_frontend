import { NextResponse } from "next/server";

export function appendSetCookies(res: Response, response: NextResponse) {
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
}
