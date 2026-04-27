"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";

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
    "answer": "상단 메뉴의 '문의하기'를 통해 연락 주시면 안내해 드리겠습니다."
  }
];

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", content: "안녕하세요! 수도권 팁픽 AI 상담원입니다. 무엇을 도와드릴까요?" },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleQuestionClick = (q: string, a: string) => {
    // 이미 같은 질문에 대한 답변이 진행 중일 때는 중복 클릭 방지
    setMessages((prev) => [...prev, { role: "user", content: q }]);
    
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "bot", content: a }]);
    }, 500);
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999] sm:bottom-6 sm:right-6">
      {/* 챗봇 플로팅 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl transition-all hover:scale-110 active:scale-95"
        aria-label="챗봇 열기"
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>

      {/* 채팅창 */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex flex-col bg-white shadow-2xl transition-all duration-300 ease-in-out sm:absolute sm:inset-auto sm:bottom-20 sm:right-0 sm:h-[500px] sm:w-[360px] sm:rounded-2xl sm:border sm:border-gray-200 overflow-hidden"
          style={{ 
            animation: 'slideUp 0.3s ease-out'
          }}
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between bg-blue-600 px-4 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <span className="font-bold text-blue-100">AI</span>
                <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-blue-600 bg-green-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold leading-tight">AI 상담원</h3>
                <p className="text-[11px] text-blue-100 opacity-80">● 온라인</p>
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
          <div className="flex-1 overflow-y-auto bg-[#F7F7F7] p-4 space-y-4">
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
            <div ref={messagesEndRef} />
          </div>

          {/* 질문 추천 영역 */}
          <div className="border-t border-gray-100 bg-white p-4">
            <p className="mb-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">자주 묻는 질문</p>
            <div className="flex flex-wrap gap-2">
              {chatData.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuestionClick(item.question, item.answer)}
                  className="rounded-full border border-blue-100 bg-blue-50 px-3 py-2 text-[12px] text-blue-700 transition-all hover:bg-blue-100 active:bg-blue-200 text-left"
                >
                  {item.question}
                </button>
              ))}
            </div>
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
          `}</style>
        </div>
      )}
    </div>
  );
}
