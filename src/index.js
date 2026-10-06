const ALLOWED_ORIGIN = "*";

const cors = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method !== "POST")
      return new Response("Method not allowed", { status: 405, headers: cors });

    const body = await request.text();
    let parsed;
    try {
      parsed = JSON.parse(body);
    } catch(e) {
      return Response.json({ error: "Invalid JSON" }, { status: 400, headers: cors });
    }
    const { prompt } = parsed;
    if (!prompt || typeof prompt !== "string" || prompt.length > 500)
      return Response.json({ error: "وصف غير صالح" }, { status: 400, headers: cors });

    try {
      const result = await env.AI.run("@cf/black-forest-labs/flux-1-schnell", {
        prompt,
        steps: 4,
      });
      return Response.json({ image: result.image }, { headers: cors });
    } catch (e) {
      return Response.json(
        { error: "انتهى الحد اليومي، جرّب غدًا" },
        { status: 429, headers: cors }
      );
    }
  },
};
