export async function onRequestPost({ request, env }) {
  try {
    const { messages } = await request.json();
    
    // Cloudflare Workers AI 호출
    // binding: AI, model: @cf/meta/llama-3.1-8b-instruct
    const response = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
      messages: [
        { role: "system", content: "You are an AI assistant for a Korean local information blog. Answer in Korean." },
        ...messages
      ],
      max_tokens: 300,
    });

    return new Response(JSON.stringify(response), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("AI Chat Error:", error);
    return new Response(JSON.stringify({ error: "AI 응답을 가져오는 중 오류가 발생했습니다." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
