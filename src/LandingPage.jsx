import React, { useState, useEffect } from 'react';
import { Rocket, Search, TrendingUp, Users, CheckCircle, ArrowRight, Lightbulb, Target, Zap, ChevronDown, Eye, BookOpen, Coffee, MapPin } from 'lucide-react';
import { isLoggedIn, getSavedUserInfo } from './utils/firebaseAuth';

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [user, setUser] = useState(null);  // ← 추가

  useEffect(() => {  // ← 추가
    if (isLoggedIn()) {
      const savedUser = getSavedUserInfo();
      if (savedUser) {
        setUser(savedUser);
      }
    }
  }, []);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="ProtoCheck" className="w-8 h-8" />
            <span className="text-xl font-bold text-slate-800">ProtoCheck</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection('philosophy')} className="text-slate-600 hover:text-slate-900 transition">철학</button>
            <button onClick={() => scrollToSection('how-it-works')} className="text-slate-600 hover:text-slate-900 transition">사용법</button>
            <button onClick={() => scrollToSection('features')} className="text-slate-600 hover:text-slate-900 transition">기능</button>
            <button onClick={() => scrollToSection('faq')} className="text-slate-600 hover:text-slate-900 transition">FAQ</button>
          </div>
          <a
            href={user ? "/my-project" : "/login"}
            className="px-5 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition shadow-lg shadow-blue-500/25"
          >
            {user ? `${user.name}님의 프로젝트` : '시작하기'}
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-full text-sm font-medium mb-6">
            <BookOpen size={16} />
            《관찰의 힘》 도서에서 영감을 받은 아이디어 검증 도구
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            평범한 일상 속에<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
              새로운 기회를 발견하세요.
            </span>
          </h1>

          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            매일 겪는 불편함을 관찰하고 기록하면,<br />
            그 안에서 새로운 기회가 보이기 시작합니다.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/login"
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2"
            >
              관찰 시작하기
              <ArrowRight size={20} />
            </a>
            <button
              onClick={() => scrollToSection('philosophy')}
              className="px-8 py-4 bg-white text-slate-700 rounded-xl font-semibold text-lg border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition"
            >
              왜 관찰인가요?
            </button>
          </div>

          {/* Social Proof */}
          <div className="mt-12 flex items-center justify-center gap-8 text-slate-500 text-sm flex-wrap">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-500" />
              무료로 시작 (Google 로그인)
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-500" />
              내 Drive 저장 (개인정보 보호)
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-500" />
              AI 패턴 분석 & MVP 지원 (준비중)
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section - Inspired by the book */}
      <section id="philosophy" className="py-20 px-4 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-amber-400 rounded-full text-sm font-medium mb-6">
              <Eye size={16} />
              Hidden in Plain Sight
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              "평범한 것을 관찰하는 데는<br />전문가가 될 수 있다"
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              — 얀 칩체이스, 《관찰의 힘》 저자
            </p>
          </div>

          {/* Book Insights */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="p-6 bg-slate-800 rounded-xl border border-slate-700">
              <div className="text-3xl mb-4">👀</div>
              <h3 className="text-xl font-bold mb-3">관찰의 힘</h3>
              <p className="text-slate-400 leading-relaxed">
                얀 칩체이스는 전 세계를 돌아다니며 <strong className="text-white">사람들의 평범한 일상</strong>을 관찰합니다.
                휴대전화를 쓸 때 불편해하는 모습, 지갑에서 현금을 찾느라 헤매는 모습...
                이런 <strong className="text-white">작은 불편함에서 새로운 기회가</strong>보인다고 말합니다.
              </p>
            </div>
            <div className="p-6 bg-slate-800 rounded-xl border border-slate-700">
              <div className="text-3xl mb-4">🔍</div>
              <h3 className="text-xl font-bold mb-3">Why를 찾아라</h3>
              <p className="text-slate-400 leading-relaxed">
                단순히 <strong className="text-white">"무엇을" 하는지가 아니라</strong> <strong className="text-white">"왜" 그렇게 하는지</strong> 이해해야 합니다.
                사람들이 왜 불편해하는지, 왜 그런 행동을 하는지 근본 원인을 파악하면 진짜 기회가 발견할 수 있습니다.
              </p>
            </div>
            <div className="p-6 bg-slate-800 rounded-xl border border-slate-700">
              <div className="text-3xl mb-4">📍</div>
              <h3 className="text-xl font-bold mb-3">한계치를 찾아라</h3>
              <p className="text-slate-400 leading-relaxed">
                사람들은 불편해도 어느 정도까지는 참습니다.
                바로 <strong className="text-white">참을 수 있는 한계선</strong>에서 <strong className="text-white">새로운 제품과 서비스의 기회</strong>가 생깁니다.
              </p>
            </div>
            <div className="p-6 bg-slate-800 rounded-xl border border-slate-700">
              <div className="text-3xl mb-4">💡</div>
              <h3 className="text-xl font-bold mb-3">본질을 꿰뚫어라</h3>
              <p className="text-slate-400 leading-relaxed">
                <strong className="text-white">그냥 원래 그래"라고 생각</strong>하면 기회를 놓칩니다.
                모두가 당연하게 여기는 것에 <strong className="text-white">"정말 그래야 할까?"</strong> 질문하면 기회가 시작됩니다.
              </p>
            </div>
          </div>

          {/* Quote */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center">
            <p className="text-xl md:text-2xl font-medium leading-relaxed mb-4">
              평범한 일상 속 불편함을 관찰하고<br />왜? 를 물으면,<br />새로운 기회를 발견할 수 있습니다.
            </p>
            <p className="text-blue-200">
              일상 속 기회를 잘 포착하기 위해 ProtoCheck을 만들었습니다.
            </p>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-slate-900">
            이런 고민, 해본 적 있나요?
          </h2>
          <p className="text-center text-slate-600 mb-12">
            관찰의 힘을 알아도, 실천하기가 어렵습니다
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { emoji: "🤔", title: "뭘 관찰해야 하지?", text: "일상이 너무 익숙해서 뭘 봐야 할지 모르겠어" },
              { emoji: "📝", title: "기록이 안 돼", text: "불편함을 느껴도 금방 잊어버려" },
              { emoji: "🔗", title: "연결이 안 돼", text: "기록은 하는데 패턴을 못 찾겠어" }
            ].map((item, idx) => (
              <div key={idx} className="p-6 bg-white rounded-xl shadow-sm text-center">
                <div className="text-4xl mb-4">{item.emoji}</div>
                <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-xl text-slate-700">
              ProtoCheck은 <span className="font-bold text-blue-600">관찰 → 기록 → 분석 → 검증</span>까지<br />
              체계적인 프레임워크를 제공합니다.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              4단계 관찰 프레임워크
            </h2>
            <p className="text-xl text-slate-600">
              일상의 불편함에서 검증된 사업 아이디어까지
            </p>
          </div>

          <div className="space-y-8">
            {[
              {
                step: 1,
                title: "불편함 수집",
                subtitle: "관찰하고 기록하라",
                description: "출퇴근길, 점심시간, 쇼핑할 때... 일상에서 느끼는 모든 불편함을 기록하세요. \"짜증났다\", \"불편했다\", \"왜 이렇지?\" 이 모든 감정이 기회의 씨앗입니다.",
                tip: "💡 Tip: 카테고리별로 기록하면 나중에 패턴을 찾기 쉬워요",
                icon: Search,
                color: "blue"
              },
              {
                step: 2,
                title: "패턴 분석",
                subtitle: "반복되는 것을 찾아라",
                description: "AI가 수집된 불편함에서 반복되는 패턴을 찾아드립니다. 같은 종류의 문제가 3번 이상 나타나면? 그건 해결할 가치가 있는 문제입니다.",
                tip: "💡 Tip: \"같은 불편함\"보다 \"같은 종류의 문제\"로 묶어보세요",
                icon: TrendingUp,
                color: "purple"
              },
              {
                step: 3,
                title: "아이디어 검증",
                subtitle: "직접 물어보라",
                description: "책에서 말하는 \"Why\"를 찾는 단계입니다. 실제 사람들과 대화하고, 온라인 리서치로 시장을 분석하세요. 나만 느끼는 불편함인지, 많은 사람이 공감하는지 확인합니다.",
                tip: "💡 Tip: 최소 5명과 대화해보면 패턴이 보여요",
                icon: Users,
                color: "green"
              },
              {
                step: 4,
                title: "MVP 테스트",
                subtitle: "작게 시작하라",
                description: "AI가 맞춤형 MVP 테스트 플랜을 생성해드립니다. 큰 돈 들이기 전에, 최소한의 비용으로 시장 반응을 확인하세요. 실패해도 배움이 됩니다.",
                tip: "💡 Tip: 완벽한 제품보다 빠른 검증이 중요해요",
                icon: Rocket,
                color: "amber"
              }
            ].map((item, idx) => (
              <div key={idx} className={`flex flex-col md:flex-row gap-6 items-start ${idx % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                <div className={`w-full md:w-2/3 p-8 rounded-2xl ${item.color === 'blue' ? 'bg-blue-50' :
                  item.color === 'purple' ? 'bg-purple-50' :
                    item.color === 'green' ? 'bg-green-50' :
                      'bg-amber-50'
                  }`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${item.color === 'blue' ? 'bg-blue-500' :
                    item.color === 'purple' ? 'bg-purple-500' :
                      item.color === 'green' ? 'bg-green-500' :
                        'bg-amber-500'
                    }`}>
                    <item.icon className="text-white" size={24} />
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-sm font-bold px-2 py-1 rounded ${item.color === 'blue' ? 'bg-blue-200 text-blue-800' :
                      item.color === 'purple' ? 'bg-purple-200 text-purple-800' :
                        item.color === 'green' ? 'bg-green-200 text-green-800' :
                          'bg-amber-200 text-amber-800'
                      }`}>STEP {item.step}</span>
                    <span className="text-slate-500 text-sm">{item.subtitle}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed mb-4">{item.description}</p>
                  <p className="text-sm text-slate-500 bg-white/50 rounded-lg px-4 py-2">{item.tip}</p>
                </div>
                <div className="hidden md:flex w-1/3 justify-center items-center">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center text-5xl font-bold ${item.color === 'blue' ? 'bg-blue-100 text-blue-500' :
                    item.color === 'purple' ? 'bg-purple-100 text-purple-500' :
                      item.color === 'green' ? 'bg-green-100 text-green-500' :
                        'bg-amber-100 text-amber-500'
                    }`}>
                    {item.step}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              관찰을 도와주는 기능들
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Eye,
                title: "쉬운 기록",
                description: "언제 어디서든 불편함을 바로 기록하세요. 카테고리별 정리가 자동으로 됩니다."
              },
              {
                icon: Zap,
                title: "AI 패턴 분석 (준비중)",
                description: "수집된 불편함에서 AI가 자동으로 패턴을 찾아 사업 기회를 발굴합니다."
              },
              {
                icon: Users,
                title: "인터뷰 가이드 및 기록",
                description: "어떤 질문을 해야 할지 고민 없이, 검증된 질문 가이드를 따라하세요."
              },
              {
                icon: Search,
                title: "온라인 리서치 및 기록",
                description: "경쟁사 분석, 커뮤니티 반응, 시장 트렌드를 한 곳에서 정리하세요."
              },
              {
                icon: Target,
                title: "MVP 플랜 생성 (준비중)",
                description: "AI가 맞춤형 MVP 테스트 전략을 자동으로 생성해드립니다."
              },
              {
                icon: CheckCircle,
                title: "내 드라이브에 자동/수동저장",
                description: "모든 데이터가 내 구글 드라이브에 자동 저장됩니다. 소중한 나의 기회를 안전하게 보호하세요"
              }
            ].map((feature, idx) => (
              <div key={idx} className="p-6 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="text-blue-600" size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial / Use Case */}
      <section className="py-20 px-4 bg-blue-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8">
            이런 분들에게 추천해요
          </h2>
          <div className="grid md:grid-cols-2 gap-6 text-left">
            {[
              { emoji: "💼", text: "사이드 프로젝트를 시작하고 싶은 직장인" },
              { emoji: "🚀", text: "창업을 준비하는 예비 창업자" },
              { emoji: "🎯", text: "새로운 사업 아이디어를 찾고 있는 분" },
              { emoji: "📊", text: "감이 아닌 데이터로 검증하고 싶은 분" }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 bg-white rounded-xl">
                <span className="text-2xl">{item.emoji}</span>
                <span className="text-slate-700">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              자주 묻는 질문
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "정말 무료인가요?",
                a: "네, 기본 기능은 모두 무료입니다. 구글계정으로 쉽게 로그인하여 사용하실 수 있습니다."
              },
              {
                q: "《관찰의 힘》 책을 읽어야 하나요?",
                a: "아니요, 하지만 책을 읽으면 관찰의 철학을 더 깊이 이해할 수 있어요. 추천드립니다!"
              },
              {
                q: "어떤 불편함을 기록해야 하나요?",
                a: "모든 불편함이 기록 대상입니다! \"짜증났다\", \"불편했다\", \"왜 이렇지?\", \"더 나은 방법이 없을까?\" 이런 생각이 들 때마다 기록하세요."
              },
              {
                q: "데이터는 안전한가요?",
                a: "현재 모든 데이터는 사용자의 구글드라이브 내 폴더 (Protocheck)에 저장됩니다. 서버로 전송되지 않아 개인정보 걱정이 없습니다."
              }
            ].map((faq, idx) => (
              <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-slate-50 transition"
                >
                  <span className="font-semibold text-slate-900 text-left">{faq.q}</span>
                  <ChevronDown className={`text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} size={20} />
                </button>
                {openFaq === idx && (
                  <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
                    <p className="text-slate-600">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-500 to-purple-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            오늘부터 관찰을 시작하세요
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            지금 느낀 불편함이<br />
            내일의 기회가 되어 찾아옵니다.
          </p>
          <a
            href="/my-project"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg hover:bg-blue-50 transition shadow-xl"
          >
            무료로 시작하기
            <ArrowRight size={20} />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-slate-900 text-slate-400">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="ProtoCheck" className="w-8 h-8" />
              <span className="text-lg font-bold text-white">ProtoCheck</span>
            </div>
            <div className="text-sm text-center md:text-right">
              <p>© 2025 MOTG All rights reserved.</p>
              <p className="text-slate-500 mt-1">Inspired by "Hidden in Plain Sight"</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
