Deno.serve(async (req: Request) => {
  const acsBase = "http://172.16.0.2:7557";
  const url = new URL(req.url);
  const path = url.pathname.replace("/functions/v1/genieacs-proxy", "") || "/devices";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  try {
    const targetUrl = `${acsBase}${path}`;
    const body = req.method !== "GET" && req.method !== "HEAD" ? await req.text() : undefined;

    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
    });

    const data = await response.text();
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    return new Response(data, {
      status: response.status,
      headers: { ...corsHeaders, "Content-Type": response.headers.get("Content-Type") || "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "GenieACS unreachable", detail: String(error) }), {
      status: 502,
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
    });
  }
});