export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const senderFilter = url.searchParams.get("sender"); // 선택적 sender 필터

    // KV에서 "msg_" 접두사를 가진 모든 키 목록 조회
    const listResult = await env.CHAT_KV.list({ prefix: "msg_" });

    const messages = [];
    for (const key of listResult.keys) {
      const raw = await env.CHAT_KV.get(key.name);
      if (raw) {
        const msg = JSON.parse(raw);
        // sender 필터가 있으면 해당 발신자만 포함
        if (!senderFilter || msg.sender === senderFilter) {
          messages.push(msg);
        }
      }
    }

    // timestamp 기준 오름차순 정렬
    messages.sort((a, b) => a.timestamp - b.timestamp);

    return new Response(JSON.stringify({ messages }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("chat-poll Error:", error);
    return new Response(JSON.stringify({ error: "메시지 조회 중 오류가 발생했습니다." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
