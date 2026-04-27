"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, Headphones } from "lucide-react";

// Q&A 데이터 (chat-data.json 내용 기반)
const chatData = [
  {
    "question": "이 블로그는 어떤 블로그인가요?",
    "answer": "지역 공공데이터와 생활 정보를 매일 자동으로 업데이트하는 블로그입니다."
  },
  {
    "question": "정보는 얼마나 자주 업데이트되나요?",
    "answer": "매일 아침 7시 5분에 자동으로 새로운 정보가 업데이트됩니다."
  },
  {
    "question": "어떤 정보를 제공하나요?",
    "answer": "지역 행사, 복지 혜택, 공공시설 이용 정보 등 생활에 유용한 공공데이터를 제공합니다."
  },
  {
    "question": "광고 문의는 어떻게 하나요?",
    "answer": "상단 메뉴의 '광고문의'를 통해 연락 주시면 안내해 드리겠습니다."
  }
];

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHumanMode, setIsHumanMode] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", content: "안녕하세요! 팁픽 AI입니다. 무엇을 도와드릴까요?" },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastPollTimestamp, setLastPollTimestamp] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isLoading]);

  // 실시간 상담원 메시지 폴링 (상담 모드일 때만 활성화)
  useEffect(() => {
    let interval: any;
    if (isHumanMode && isOpen) {
      interval = setInterval(async () => {
        try {
          const response = await fetch("/api/chat-poll?sender=admin");
          if (response.ok) {
            const data = await response.json();
            const adminMessages = (data.messages || []).filter(
              (m: any) => m.timestamp > lastPollTimestamp
            );
            if (adminMessages.length > 0) {
              const newTs = adminMessages[adminMessages.length - 1].timestamp;
              setLastPollTimestamp(newTs);
              setMessages((prev) => [
                ...prev,
                ...adminMessages.map((m: any) => ({ role: "bot", content: m.message }))
              ]);
            }
          }
        } catch (error) {
          console.error("Polling Error:", error);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isHumanMode, isOpen, lastPollTimestamp]);

  const handleQuestionClick = (q: string, a: string) => {
    setMessages((prev) => [...prev, { role: "user", content: q }]);
    
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "bot", content: a }]);
    }, 500);
  };

  const handleConnectHuman = () => {
    setIsHumanMode(true);
    setMessages((prev) => [...prev, { 
      role: "bot", 
      content: "상담원 연결을 시도합니다. 잠시만 기다려 주세요. 상담원이 연결되면 메시지를 보내드릴게요." 
    }]);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMessage = inputText.trim();
    setInputText("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      if (isHumanMode) {
        // 상담원 연결 모드: /api/chat-human으로 전송
        await fetch("/api/chat-human", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sender: "user",
            message: userMessage
          }),
        });
        // 상담원 모드에서는 즉각적인 AI 답변이 없으므로 로딩 종료
        setIsLoading(false);
      } else {
        // AI 모드: 기존 /api/chat 요청
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [{ role: "user", content: userMessage }]
          }),
        });

        if (!response.ok) throw new Error("API 요청 실패");

        const data = await response.json();
        if (data.response) {
          setMessages((prev) => [...prev, { role: "bot", content: data.response }]);
        } else {
          throw new Error("올바르지 않은 응답 형식");
        }
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages((prev) => [...prev, { role: "bot", content: "죄송합니다. 메시지 전송 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." }]);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999] md:bottom-6 md:right-6">
      {/* 챗봇 플로팅 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#00E5FF] text-white shadow-xl transition-all hover:bg-[#00CCE6] hover:scale-110 active:scale-95"
        aria-label="챗봇 열기"
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>

      {/* 채팅창 */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex flex-col bg-white shadow-2xl transition-all duration-300 ease-in-out md:absolute md:inset-auto md:bottom-20 md:right-0 md:h-[600px] md:w-[380px] md:rounded-2xl md:border md:border-gray-200 overflow-hidden"
          style={{ 
            animation: 'slideUp 0.3s ease-out'
          }}
        >
          {/* 헤더 */}
          <div className={`flex items-center justify-between px-4 py-4 text-white transition-colors duration-500 ${isHumanMode ? 'bg-orange-500' : 'bg-blue-600'}`}>
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <span className="font-bold text-white">{isHumanMode ? <Headphones size={20} /> : "AI"}</span>
                <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-current bg-green-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold leading-tight">{isHumanMode ? "실시간 상담" : "팁픽 AI"}</h3>
                <p className="text-[11px] text-white/80 opacity-80">● {isHumanMode ? "상담원 대기 중" : "온라인"}</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="rounded-full p-1 hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* 대화 영역 (카카오톡 스타일) */}
          <div className="flex-1 overflow-y-auto bg-[#F7F7F7] p-4 space-y-4 no-scrollbar">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start animate-fade-in"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed shadow-sm ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-none"
                      : "bg-white text-gray-800 rounded-tl-none border border-gray-100"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && !isHumanMode && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-white text-gray-800 rounded-2xl rounded-tl-none border border-gray-100 px-4 py-2.5 shadow-sm">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 입력 및 추천 영역 */}
          <div className="border-t border-gray-100 bg-white">
            {!isHumanMode && (
              <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                <p className="mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">주요 질문</p>
                <div className="flex overflow-x-auto gap-2 no-scrollbar pb-1">
                  <button
                    onClick={handleConnectHuman}
                    className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-[11px] font-bold text-orange-600 transition-all hover:bg-orange-100 active:scale-95"
                  >
                    <Headphones size={12} />
                    상담원 연결
                  </button>
                  {chatData.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuestionClick(item.question, item.answer)}
                      className="whitespace-nowrap rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] text-gray-600 transition-all hover:border-blue-200 hover:text-blue-600 active:bg-blue-50"
                    >
                      {item.question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 메세지 입력창 */}
            <form onSubmit={handleSendMessage} className="flex items-center gap-2 p-3">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isHumanMode ? "상담원에게 메시지 보내기..." : "직접 질문을 입력해 보세요..."}
                className="flex-1 rounded-full bg-gray-100 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all"
                disabled={isLoading && !isHumanMode}
              />
              <button
                type="submit"
                disabled={!inputText.trim() || (isLoading && !isHumanMode)}
                className={`flex h-10 w-10 items-center justify-center rounded-full text-white transition-all disabled:bg-gray-200 disabled:text-gray-400 ${isHumanMode ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                <Send size={18} />
              </button>
            </form>
          </div>

          <style jsx>{`
            @keyframes slideUp {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in {
              animation: fadeIn 0.3s ease-in;
            }
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            .no-scrollbar::-webkit-scrollbar {
              display: none;
            }
            .no-scrollbar {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
