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
    // 문맥 유지를 위해 이전 메시지들의 내용도 검색 키워드에 포함합니다.
    const searchContext = messages.map(m => m.content).join(" ");
    const origin = new URL(request.url).origin;

    // 1. RAG 로직: 관련 블로그 데이터 검색
    const matches = await getMatches(origin, searchContext);

    const blogDataContext = matches.length > 0
      ? matches.map(m => `- 제목: ${m.title}\n  요약: ${m.summary}\n  내용: ${m.content}`).join("\n\n")
      : "관련 데이터 없음";

    // 2. Cloudflare Workers AI 호출
    const response = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
      messages: [
        {
          role: "system",
          content: `You are a friendly and helpful AI assistant for 'Tip-Pick' (팁픽), a website curating regional festivals and government subsidies in the Seoul metropolitan area (Seoul, Incheon, Gyeonggi).
Follow these instructions strictly:
1. Tone: 반드시 이웃처럼 친근하고 자연스러운 한국어 구어체(~해요, ~입니다, ~할까요?)로 답변하세요. 딱딱한 기계나 로봇처럼 말하지 마세요.
2. Length: 답변은 핵심만 파악하여 최대 3문장 이내로 간결하게 작성하세요.
3. No Markdown: 답변에 어떠한 마크다운 기호(**, *, #, - 등)도 사용하지 마세요. 오직 일반 텍스트만 출력하세요.
4. Strict Information Boundary (Crucial): 반드시 아래 제공된 [블로그 데이터]에 있는 내용만 바탕으로 답변하세요. 사용자의 질문에 대한 답이 데이터에 없다면, 절대 지어내거나 추측하지 말고 무조건 다음 문장만 똑같이 출력하세요: '앗, 죄송해요. 문의하신 내용은 아직 팁픽에 등록되지 않은 정보 같아요. 다른 궁금한 점이 있으시면 언제든 다시 말씀해 주세요!'

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
