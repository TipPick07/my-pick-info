function stripMarkdown(text) {
  if (!text) return "";
  // 마크다운 기호를 제거하고 평문으로 변환 (**, *, #, -, ` 등)
  return text.replace(/[#*`_~-]/g, '').trim();
}

/**
 * 키워드 매칭 기반의 간단한 RAG 로직
 */
async function getMatches(origin, query) {
  try {
    const res = await fetch(origin + "/data/search-index.json");
    if (!res.ok) return [];
    
    const index = await res.json();
    const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 1);
    
    if (queryWords.length === 0) return [];

    const scored = index.map(item => {
      let score = 0;
      // title, summary, content에서 키워드 매칭 점수 계산
      const text = (item.title + " " + (item.summary || "") + " " + (item.content || "")).toLowerCase();
      queryWords.forEach(word => {
        if (text.includes(word)) score++;
      });
      return { ...item, score };
    });

    // 점수가 높은 상위 3개 항목 반환
    return scored
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  } catch (err) {
    console.error("Search Index Fetch Error:", err);
    return [];
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const { messages } = await request.json();
    const userQuestion = messages[messages.length - 1].content;
    const origin = new URL(request.url).origin;

    // 1. RAG 로직: 관련 블로그 데이터 검색
    const matches = await getMatches(origin, userQuestion);
    
    const blogDataContext = matches.length > 0 
      ? matches.map(m => `- 제목: ${m.title}\n  요약: ${m.summary}`).join("\n")
      : "관련 데이터 없음";

    // 2. Cloudflare Workers AI 호출
    const response = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
      messages: [
        { 
          role: "system", 
          content: `You are an AI assistant for a Korean local information blog.
Answer ONLY in Korean. Keep answers to 2-3 sentences maximum.
Do NOT use any markdown symbols (**, *, #, -). Plain text only.
Base your answer ONLY on the following blog data. If not relevant, reply: 해당 내용은 블로그에서 확인이 어렵습니다. 다른 질문을 해주세요.

[블로그 데이터]
${blogDataContext}`
        },
        ...messages
      ],
      max_tokens: 150,
    });

    // 3. AI 응답에서 마크다운 기호 제거
    if (response && response.response) {
      response.response = stripMarkdown(response.response);
    }

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
