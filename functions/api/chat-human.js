export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const { message, sender } = body;

    if (!message || !sender) {
      return new Response(JSON.stringify({ error: "message와 sender는 필수입니다." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const key = "msg_" + Date.now();
    const value = JSON.stringify({
      message,
      sender,
      timestamp: Date.now(),
    });

    await env.CHAT_KV.put(key, value);

    return new Response(JSON.stringify({ success: true, key }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("chat-human Error:", error);
    return new Response(JSON.stringify({ error: "메시지 저장 중 오류가 발생했습니다." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
