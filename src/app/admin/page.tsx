"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, Loader2, Lock, MessageCircle, User } from "lucide-react";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isAuthenticated) {
      scrollToBottom();
    }
  }, [messages, isAuthenticated]);

  // 실시간 메시지 폴링 (방문자와 동일한 /api/chat-poll 사용)
  useEffect(() => {
    let interval: any;
    if (isAuthenticated) {
      interval = setInterval(async () => {
        try {
          const response = await fetch("/api/chat-poll");
          if (response.ok) {
            const data = await response.json();
            if (data.sender && data.content) {
              setMessages((prev) => {
                // 중복 방지: 마지막 메시지와 비교
                const lastMsg = prev[prev.length - 1];
                if (lastMsg && lastMsg.content === data.content && lastMsg.sender === data.sender) {
                  return prev;
                }
                return [...prev, data];
              });
            }
          }
        } catch (error) {
          console.error("Polling Error:", error);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin0242") {
      setIsAuthenticated(true);
    } else {
      alert("비밀번호가 올바르지 않습니다.");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const adminMessage = inputText.trim();
    setInputText("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat-human", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: "admin",
          content: adminMessage
        }),
      });

      if (response.ok) {
        setMessages((prev) => [...prev, { sender: "admin", content: adminMessage }]);
      }
    } catch (error) {
      console.error("Send Error:", error);
      alert("메시지 전송에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
          <div className="mb-6 flex flex-col items-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <Lock size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">관리자 인증</h1>
            <p className="text-sm text-gray-500">상담 관리 페이지 접속을 위해 비밀번호를 입력해주세요.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 입력"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 py-3 font-bold text-white transition-all hover:bg-blue-700 active:scale-95"
            >
              접속하기
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-[#F0F2F5]">
      {/* 관리자 헤더 */}
      <header className="flex items-center justify-between bg-blue-600 px-6 py-4 text-white shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
            <MessageCircle size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold">상담 관리 센터</h1>
            <p className="text-xs text-blue-100 opacity-80">실시간 방문자 응대 중</p>
          </div>
        </div>
        <button 
          onClick={() => setIsAuthenticated(false)}
          className="text-sm font-medium text-blue-100 hover:text-white transition-colors"
        >
          로그아웃
        </button>
      </header>

      {/* 대화 목록 영역 */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        <div className="mx-auto max-w-4xl space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <User size={48} className="mb-4 opacity-20" />
              <p>대화 내용이 없습니다. 방문자의 메시지를 기다리고 있습니다.</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex items-start gap-2.5 max-w-[80%] ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${msg.sender === "user" ? "bg-blue-100 text-blue-600" : "bg-gray-200 text-gray-600"}`}>
                    {msg.sender === "user" ? "방" : "나"}
                  </div>
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-[15px] shadow-sm leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-blue-600 text-white rounded-tr-none"
                        : "bg-white text-gray-800 rounded-tl-none border border-gray-100"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* 관리자 입력창 */}
      <footer className="border-t border-gray-200 bg-white p-4 shadow-lg">
        <form onSubmit={handleSendMessage} className="mx-auto flex max-w-4xl items-center gap-4">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="답장을 입력해 주세요..."
            className="flex-1 rounded-2xl bg-gray-100 px-6 py-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition-all hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 active:scale-95"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <Send size={24} />}
          </button>
        </form>
      </footer>
    </div>
  );
}
