import Header from "@/components/Header";

export const metadata = {
  title: "사이트 소개 | 수도권N라이프",
  description: "수도권N라이프의 운영 목적과 데이터 출처, 콘텐츠 생성 방식을 소개합니다.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100">
      <Header />
      
      <main className="container mx-auto px-6 py-20 max-w-4xl space-y-20">
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <div className="inline-block px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-indigo-100">
            About Us
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-tight">
            내 손안의 <span className="text-indigo-600">수도권</span> 생활 가이드
          </h2>
          <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            수도권N라이프는 서울, 인천, 경기 지역 주민들이 꼭 알아야 할 
            다양한 혜택과 즐길 거리를 큐레이션하여 제공하는 프리미엄 정보 포털입니다.
          </p>
        </section>

        {/* Vision & Mission */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-10 rounded-[3rem] border border-white shadow-xl space-y-6">
            <h3 className="text-2xl font-black text-slate-900 border-l-8 border-indigo-600 pl-4">운영 목적</h3>
            <p className="text-slate-600 leading-relaxed font-medium">
              정보의 홍수 속에서 내 지역에 꼭 맞는 혜택과 행사를 찾기는 쉽지 않습니다. 
              수도권N라이프는 복잡한 공공 데이터를 친숙한 매거진 스타일로 가공하여, 
              지역 주민들이 실질적인 혜택을 누리고 풍요로운 여가 생활을 즐길 수 있도록 돕습니다.
            </p>
          </div>
          <div className="bg-white p-10 rounded-[3rem] border border-white shadow-xl space-y-6">
            <h3 className="text-2xl font-black text-slate-900 border-l-8 border-indigo-600 pl-4">데이터 출처</h3>
            <p className="text-slate-600 leading-relaxed font-medium">
              제공되는 모든 정보는 **공공데이터포털(data.go.kr)** 및 각 지방자치단체의 신뢰할 수 있는 
              공식 API 데이터를 바탕으로 합니다. 최신 정보를 유지하기 위해 매일 
              자동화 시스템이 데이터를 동기화하고 있습니다.
            </p>
          </div>
        </section>

        {/* AI & Human Collaboration */}
        <section className="bg-slate-900 text-white p-12 md:p-20 rounded-[4rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] -mr-48 -mt-48" />
          
          <div className="relative space-y-8 max-w-2xl">
            <h3 className="text-3xl font-black">AI와 에디터의 협업 시스템</h3>
            <div className="space-y-6 text-slate-300 text-lg leading-relaxed font-medium">
              <p>
                수도권N라이프의 블로그 콘텐츠는 최신 생성형 AI인 **Gemini API**를 활용하여 
                방대한 공공 데이터를 분석하고 친숙한 언어로 초안을 작성합니다.
              </p>
              <p>
                단순한 정보 나열을 넘어, AI가 분석한 핵심 혜택과 추천 이유를 바탕으로 
                에디터가 최종 검수하여 정확하고 유용한 정보를 전달하기 위해 노력하고 있습니다.
              </p>
            </div>
            <div className="pt-6 border-t border-white/10 flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold">AI</span>
              </div>
              <p className="text-sm font-bold text-slate-400">
                기술적 혁신과 사람의 감성을 더해 더 나은 정보를 제공합니다.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-slate-100 py-12 px-6">
        <div className="container mx-auto text-center text-slate-400 text-sm font-bold">
          &copy; 2026 수도권N라이프. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
