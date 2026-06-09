# 수도권 팁픽(TIP-PICK) 프로젝트 지침서

> **이 문서의 목적**: 팁픽 운영·개발의 마스터 컨텍스트. 새 Claude 대화를 시작할 때 이 파일을
> 첨부하면 이전 맥락이 그대로 이어진다. 기획·전략 / 기술 구조·소스 현황 / 작업 로그를 한곳에 모은다.
>
> **운영 원칙(절대 불변)**: ① 수정은 승인 후 ② 커밋·푸시는 지시 시에만 ③ 빌드 검증은 모든 점검·수정이
> 끝난 뒤 한 번만 ④ 질문에는 답만 하고, 다음 단계로 임의로 넘어가지 않는다 ⑤ 무언가를 추가·변경할 때는
> 반드시 기존 규칙과 충돌하지 않는지 먼저 검토하고, 깨지면 무엇이 어떻게 깨지는지 보고한다
> ⑥ 사실·상태값은 추측이나 인수인계 문구로 단정하지 않고, 안티그래비티에 시켜 실제 결과값(코드·실응답·
> 데이터)을 받은 뒤 판단·기록한다. 외부 사이트에서 직접 확인해야 정확한 것은 운영자에게 별도 요청한다.
>
> **소통 방식**: 한국어. 직접적·단계별 안내, 각 단계마다 명시적 확인. 여러 옵션 나열보다 하나씩 진행.

작성/갱신: 2026-06-05 | tip-pick.com | 운영자: 록

---

## 0. 이 프로젝트가 나에게 갖는 의미 (운영자 메모)

생애 첫 작품. 코딩을 모르는 상태에서 시작했고, 한 달 이상 매일 체크·보완·수정하며 배워간다.
초기에 "빨리 아웃풋만" 달린 것을 미스로 인식하고, 이제 **기획 → 뼈대 → 운영 → 유지/보수 →
영업·마케팅(사람들에게 통하는지 검증)** 의 순서를 중시한다. 이 문서는 그 여정을 잇는 기록이다.

---

## 1. 기획·전략 방향 (핵심)

### 한 줄 정체성
수도권에서 **아이 키우는 집을 위한 '나들이 + 혜택·금융' 가이드**. 축제(가족 나들이)로 유입을 만들고,
**육아·가족 지원금과 금융**을 그 같은 부모 audience에 붙여 수익화한다.

### 전략의 척추 — "지원금을 척추로, 금융을 수익 레이어로"
- 애드센스 단독은 천장이 낮다(한국 정보성 트래픽 RPM 낮음, commodity 대량 콘텐츠는 구글에 불리).
- **지원금을 중심에 두고, 각 지원금에 금융 고리를 붙여 수익화**(디스플레이 광고보다 제휴 CPS가 방문자당 수익 큼).
- **수익 핵심 타깃을 '청년 → 육아·가족'으로 이동.** 근거: 실제 사이트 유입 분석 결과 주 방문층이
  유아·초등 자녀를 둔 부모(5월 꽃 축제 유입에서 확인). 기존 문서가 '청년'을 수익 핵심으로 뒀던 것은
  데이터 이전의 가정이었음.
- **금융 고리 우선순위 (고수요+고수익 순)**:
  - **육아·가족(아동수당·보육료·유아학비·자녀 적금·청약·자녀 보험) ← 최우선**
  - 주거·전월세(전세대출 비교)
  - 청년(청약·청년도약계좌)
  - 중장년·은퇴(연금·ISA) ← 후순위
- **하지 말 것**: 지원금·금융·은행·부동산을 각각 별도 버티컬로 펼치지 말 것(토스·뱅크샐러드·직방과
  정면승부는 패배). 금융·부동산은 지원금에 붙는 고리로만 다룬다.

### 두 레이어 분리 (중요)
- **축제 = '잘라낼 약한 다리'가 아니라 '증명된 유입 자석(가족 나들이)'.** 운영자의 소셜 유통으로
  실제 트래픽을 만들고 있는 유일한 엔진.
- **지원금·금융 = 같은 부모 audience에게 붙이는 '발견(discovery) + 수익' 레이어.**
- 두 레이어는 서로 다른 사람이 아니라 **'한 사람(어린 자녀 키우는 부모)' 위에서 만난다.**
  축제는 미끼, 육아·가족 혜택·금융은 수익.
- (규칙 운영) 지원금엔 강한 규칙(키 기반 정확 dedup), 축제엔 가벼운 규칙(행사명+날짜+장소). 충돌 없음.

### 콘텐츠 철학
- **'매일 글 2개' 트레드밀 폐기.** 목표는 완전·최신 지원금 DB + 가치 높은 깊은 가이드.
- **자동 블로그 발행 셸브 → 손글 주력 (2026-06-05).** 크론의 블로그 자동생성은 중지(상세·되살리는 법은 §2).
  콘텐츠는 사람이 직접 쓴다. 단, **데이터 크롤(fetch·dedup·validate)은 자동 유지** — 손글 글감의 최신 재고를 끊지 않는다.
- **데이터 부족하면 억지로 글 만들지 않는다(패스).** 신뢰가 가장 중요. ← 운영자 핵심 가치.
- **케이던스 원칙(할당량 아님).** "써야 해서"가 아니라 "쓸 거리·시간 있을 때만." 가벼운 글 5~10분
  (사실검증은 Claude) / 플래그십 가이드 1~2주 1편 수준. 못 쓰는 주가 있어도 정상 — 억지 양산이 신뢰를 깎는다.
- 크롤링 원본 상세페이지도 방문객이 보는 콘텐츠 → 형식·규칙에 맞춰 가치 있게 작성(블로그와 별개).

### 콘텐츠 타입 3종 (손글 기준 — 무엇을·어디에·어떤 형식)
- **축제(가족 나들이) = `.md` 블로그 (반자동).** 크롤로 갱신된 데이터 위에 사람이 가볍게 작성.
  경로 `src/content/posts/`, 파일명 `YYYY-MM-DD-english-name.md`. 케이던스: 가벼운 글.
- **플래그십 가이드 = `/guides/<slug>/` 라우트 (파일 `src/app/guides/<slug>/page.tsx`, JSX 독립).**
  깊고 오래 가는 핵심 콘텐츠(예: 육아·가족 지원금 pillar). posts·pick-info 미경유 = 자동발행 충돌 0,
  날짜 없음. 케이던스: 1~2주 1편.
- **이벤트성 지원금 = `.md` 블로그.** 마감 있는 단발·한시 지원금. 형식은 축제와 같은 .md 규칙.
- 3종의 상세 '규칙+형식' 템플릿은 추후 별도 레퍼런스 .md로 정의(손글 양산 가속용).

### 인기 기반 큐레이션 (방향)
- "의미 없는 광대한 축제·지원금"보다 **사람들이 실제로 검색하는 인기 주제**에 깊이를 몰아준다.
- **복지로 = 재고(빠짐없는 색인 자산), 네이버 데이터랩 = 나침반(무엇에 깊은 글·상단·금융고리를 몰지)**.
- 노력 배분은 **검색수요 × 수익잠재력 2축**: 고수요+고수익고리(청약·전세대출 등)에 최우선,
  저수요+저수익고리(동네 소액 보조)는 카드로 색인만(깊은 글 X).
- 데이터랩은 절대 검색량이 아니라 0~100 상대 트렌드 → "카테고리·후보군 내 상대 순위"로 설계.

### 유통·역할 (현실 직시)
- **단기 트래픽 주력 = 운영자 소셜 유통**(오픈채팅·인스타·쓰레드·네이버). 신생 사이트라 검색 상단까지
  보통 수개월 → 단기 방문수는 운영자 마케팅에 직접 비례한다.
- **SEO는 끄는 게 아니라 켜둔 채 토대를 쌓는다.** sitemap·robots·canonical·FAQ JSON-LD·정확한 수치·
  H2 구조는 계속 챙긴다. 자동 thin 글을 멈춘 것 자체가 SEO 플러스(빈약한 글이 많으면 사이트 전체 평가가
  깎임). 지금 효과가 느릴 뿐, 장기 유입은 이 토대 위에 붙는다.
- 짠한경제학 유튜브 루프는 현재 휴지 상태이며, 재가동 시에도 40~60대 audience라 사이트의 부모
  audience와는 별개 트랙으로 본다.
- **지원금의 역할 정정**: 자기 지원금을 아는 사람은 직접 검색하므로 '고관여 검색용'이 아니라,
  이미 들어온 부모에게 "이런 것도 있어요"를 보여주는 **'발견용'**이다.

### 수익화 현황
애드센스 재신청 이력(직전 거절: low-value/thin content). 네이버·쿠팡 제휴 키 보유(콘텐츠 아님, 수익 레이어).

### 타겟 독자 — 5개 생애주기
**임신·출산·육아(수익 핵심, 1순위)** / 주거·전월세 / 청년 / 중장년·은퇴 / 장애인·돌봄

---

## 2. 기술 구조 · 소스 현황 (2026-06-05 기준)

### 스택
- 개발: 바이브코딩 (Antigravity IDE + Claude Code). 운영자는 코딩 비전공.
- 프론트: **Next.js(App Router) 기반, 정적 export.** 블로그 본문은 react-markdown + remark-gfm로 렌더
  (축제 상세는 별도 `MdContent` 컴포넌트 = remark-gfm + rehype-raw). 콘텐츠: 블로그 글 `src/content/posts/`(.md),
  라우트 `src/app/.../page.tsx`. **플래그십 가이드는 `src/app/guides/<slug>/page.tsx` 독립 JSX 라우트
  (posts·pick-info 미경유 = 자동발행 충돌 0).** (근거: package.json `next build`, AGENTS.md가 next 문서 참조 — Astro 흔적 없음.)
- 버전관리/배포: GitHub → Cloudflare Pages 자동 배포.
- 자동화: GitHub Actions 크론(매일 **05:23 KST**, `'23 20 * * *'`). 실행 단계 =
  **fetch → dedup → report → validate → build → deploy**(매일). ⚠️ **블로그 자동생성(혜택/축제 1:1)은
  2026-06-05 셸브** — deploy.yml의 `[SHELVED 2026-06-05]` 주석 블록(미변경, 옛 1:1 코드). **2026-06-07 [3b]
  그 아래에 '축제 묶음 자동발행' 활성**: KST 목요일(`$(TZ=Asia/Seoul date +%u)=4`)만 `POST_TYPE=festival
  generate-blog-post` 실행(묶음=selectFestivalBundle 상위5~8·5미만 스킵·시기제목·sourceIds 직전제외).
  매일 fetch·dedup·report·validate·build·deploy는 유지, 발행만 목요일. 옛 SHELVED 1:1은 폐기(되살리지 말 것).
- 데이터 원천 1개: `public/data/pick-info.json` (benefits + festivals).
- 레포 경로(로컬): `c:/Users/Administrator/Desktop/my-pick-info`
- **날짜 처리 SSOT**: 축제 만료 판정은 `scripts/lib/festival-date.js` 단일 소스로 통일(컴팩트 YYYYMMDD·점·
  하이픈·슬래시 모두 파싱, 범위는 ~ 뒤가 종료일). 서버 정리(fetch-public-data.js)·블로그 발행 가드
  (generate-blog-post.js)가 이 모듈을 공유하고, 프론트(FestivalsClient.tsx)는 브라우저 번들이라 동일 로직
  미러링 + "동기화 필수" 주석. 배경: 과거 date가 구분자 없는 컴팩트라 정규식 3곳이 0매칭→'만료 아님'으로
  통과하던 버그(2026-06-05 수정).

### 파일명 규칙 (절대 불변)
블로그 포스트: `YYYY-MM-DD-english-name.md` (예: `2026-05-06-election-day-holiday-trip.md`). 다른 형식 금지.

### 데이터 소스 현황 (2026-06-05 기준)

**지원금 스파인 (data.go.kr, 단일 키 `PUBLIC_DATA_API_KEY`)**
- 복지로 **지자체**(LocalGovernmentWelfareInformations) — ✅ 동작(JSON). 핵심.
- 복지로 **중앙부처**(NationalWelfareInformations**V001**) — ✅ **2026-06-04 복구**(아래 작업 로그).
  · 정식 경로 `NationalWelfareInformationsV001/NationalWelfarelistV001`, 필수 파라미터 `callTp=L&srchKeyCode=003`,
    **XML 전용**(Accept:json 보내면 에러), 항목 래퍼 `<servList>`, 일일 트래픽 100.
  · ⚠️ 목록 API에 마감일 필드 없음 → central 항목은 '상시' 취급(정상).
  · ⚠️ 첫 페이지 20건 고정 + srchKeyCode=003 → 장애인·보훈 편중 가능성(점검 중).
- gov24(행안부, odcloud) — ✅ 2·3순위 폴백.
- 마이홈포털 임대주택 — ⚠️ **실수집 0건(검증 2026-06-05, 실응답 대조) — 원인 확정·미수정.**
  API·인증은 정상(resultCode 00, 경기 호출에 totalCount 297). 0건 원인은 코드측 2개:
  ① 래퍼 경로 불일치 — 코드가 `body.items.item`을 읽으나 실제는 `body.item`(fetch-public-data.js:1013)
  → raw=[]. ② 필드명 불일치 — 코드가 `HOUSE_NM`류를 찾으나 실제는 `pblancNm·houseTyNm·endDe·pcUrl`류
  → houseName/houseType 빈값으로 1027행 skip(2차 차단). 별개로 ③ `srhRegion`이 무효(41 전송에도
  전국 반환) → ①② 수정 후 지역필터 재설계 필요(올바른 파라미터명은 참고문서 xlsx 확인).
  Base `/HWSPR02/rsdtRcritNtcList`는 정확. (수정 항목 = §4-10)

**축제 유입 (별도 키)**
- 한국관광공사 TourAPI — ✅ 축제 본체.
- 서울 열린데이터광장 / 경기데이터드림 / 인천문화재단 — ✅ 문화행사(인천은 XML이면 건너뜀).

**수요 나침반**
- 네이버 DataLab — **2026-06-04 활성화 / 용도 정정(검증 2026-06-05).** 크론에서 **계속 실행**되는
  쪽은 `getTodayHotKeywords`(fetch-public-data.js:38) → 수집 데이터 **핫스코어 정렬**(지원금·축제 둘 다)
  + Gemini 보완후보 전달. deploy.yml NAVER env 유지, 키 없거나 실패 시 계절 키워드 폴백.
  ⚠️ 구 지침서의 "블로그 후보 점수화"는 셸브된 `getNaverDataLabKeywords`(generate-blog-post.js:70)
  설명이라 **현재 미실행** → 혼동 방지로 정정. (구 줄의 '배포당 최대 4회'는 셸브 전 합산치로 보여 검증 안 됨 → 뺌.)

**날씨**
- Open-Meteo(무인증) — 위젯 동작. (기상청 weather.ts는 2026-06-04 삭제 = 죽은 코드였음)

**제휴(콘텐츠 아님)**
- 네이버 / 쿠팡 파트너스 — 수익 레이어용. (쿠팡은 키 있을 때만 조건부)

**제거됨**
- 중기부 기업마당(fetchBizinfo) — CI 키 부재로 no-op이던 죽은 코드. 2026-06-04 삭제.

### 크롤링 규칙 (코드에 구현됨)
- 지원금 품질: 서비스명 5자+/설명 10자+/만료 제외/무의미값 제외/기업수혜 배제/화이트리스트(수당·환급·바우처·월세·장려금·지원금 등) 필수.
- 축제 품질: 제목 4자+/설명 10자+/종료 제외/지역 필수/블랙리스트(포럼·세미나·학술 등)/화이트리스트(벚꽃·불꽃·페스티벌·먹거리 등).
- 수도권 외 필터: 비수도권명 있고 수도권 미포함이면 스킵('전국'은 통과).
- 월·계절은 **수집 필터가 아니라 정렬용 핫스코어**에만 사용.
- 수집 제한: `DAILY_LIMIT=5`(전체 합산) + 수집단계 3건 미만 스킵.

### 중복 방지 (3중 + 회귀 차단)
- 블로그 isDuplicate(posts/drafts/review 스캔 + 제목 norm + 키워드 Jaccard 0.5 + 제도·행사명 공유 차단).
- 축제 dedup-festivals-v2(날짜+장소+제목 키워드 겹침).
- 지원금 findBenefitDuplicate(자치구 가드 + bigram Jaccard 0.42 + 포함률).
- ★ **6/4 용산 사고 근본수정(commit 3297059)**: Gemini 재작성 후 '최종 제목' 기준 isDuplicate 재검사 패스.
  (원본 제목만 비교하던 게이트가 재작성 충돌을 못 잡은 사고 → 생성 후 재검사로 차단)
- 발행 게이트: 지원금 카테고리당 3건(`PUBLISH_THRESHOLD=3`), **축제도 3건 게이트 2026-06-04 추가**.
- **표 무결성 게이트(validate-content.js)**: fixTableCells(셀 안 줄바꿈)에 더해 dropTableInnerBlanks(표 내부
  빈 줄 제거)·ensureTableHeader(헤더 없는 표 → 헤더 합성 + WARN) 추가됨(2026-06-05).
- **만료 축제 감시 게이트(validate-content.js checkPickInfo)**: '종료일 과거 축제 0건' 검사(>0이면 WARN +
  상위 10건 로그)(2026-06-05).

### 별도 운영 문서
- `docs/daily-deploy-inspection.md` — 매일 자동배포 후 점검 가이드. [B]에 카테고리 편중/데이터랩 작동/축제 게이트 확인 항목 포함.

### 유지보수 원칙 (이번 사고들의 공통 교훈 — '같은 걸 여러 군데서 따로 처리하다 어긋남'을 구조로 차단)
1. **SSOT 원칙** — 같은 판정·규칙(날짜 만료, 중복 기준 등)은 한 곳에서만 정의하고 나머지는 그것을 참조/물린다.
   동일 로직을 여러 파일에 복제 금지(불가피하게 미러링하면 "동기화 필수" 주석 + 어느 곳들이 짝인지 명시).
2. **게이트 ↔ 점검 항목 짝** — 새 자동 게이트를 만들면 반드시 docs/daily-deploy-inspection.md에 사람이 눈으로
   보는 점검 항목도 함께 추가한다(게이트만 믿다 사각지대로 새는 것을 방지).
3. **버그 수정은 원인 재현으로 증명** — 수정 후, 버그를 유발하던 조건을 일부러 입력해 더 이상 깨지지 않음을
   시뮬레이션으로 확인하고 보고한다(빌드 통과만으로 끝내지 않음).

---

## 3. 작업 로그 (최신이 위)

> **로그 추가 규칙(형식 고정)**: 작업이 완료될 때마다 아래 한 줄 형식으로 이 섹션 맨 위에 추가한다.
> `- YYYY-MM-DD | [영역] 한 줄 요약 | 상태(완료/배포됨/보류) | 관련 파일·커밋`
> 영역 예: 소스 / 크롤링 / 블로그 / UI / SEO / 수익화 / 문서 / 인프라.
> 작업 완료 시 Claude가 이 형식의 '복붙용 한 줄'을 제공하면, 운영자는 그대로 로그에 추가하거나
> 안티그래비티에 "이 줄을 docs/project-guide.md 작업 로그 맨 위에 추가해"라고 지시한다.

- 2026-06-09 | [가이드/콘텐츠] /guides 3편 '어린이집·유치원 신청 가이드'(daycare-admission) — keyword-map §3 큐③ C2 거래형 하위가이드. 유보통합포털(2024.11.1 개통·enter.childinfo.go.kr, 아이사랑+처음학교로 통합) 한 창구에서 어린이집(점수제·연중 수시 대기)과 유치원(연1회·11월 추첨)의 선발방식 차이를 비교표+DepthCard 2섹션+한장 체크리스트+FAQ5(JSON-LD)+시점주의 박스로. 검증수치: 어린이집 1순위100·맞벌이/3자녀 각200·맞벌이+3자녀300·2순위50·2순위만으론 1순위 불가·동일순위는 신청순(법제처 2026 보육사업안내), 입소대기 미재원3/재원2개소·만0~5세(장애12); 유치원 우선모집(저소득·보훈·북한이탈)→일반(사전+본)→추가모집·희망순 무작위추첨·중복선발 제한·등록마감 미준수시 자동취소. 전량 공식 1차출처(교육부 유보통합포털·아이사랑·법제처·처음학교로) 손글, 추가 크롤 0. 비용(보육료·유아학비·누리과정) 문구 1편(parenting-family-benefits) 내부링크. 제휴 미포함. C5 토큰·DepthCard·FAQPage JSON-LD·breadcrumb·SectionTitle 그대로 재사용(변경0), posts·pick-info·situations·자동발행 미경유(충돌0). guides.ts 허브 카드 2→3·OG 1장(1200×630, sharp 생성). | 배포대기(커밋 전) | src/app/guides/daycare-admission/page.tsx, src/lib/guides.ts, public/images/og/daycare-admission.png, docs/project-guide.md
- 2026-06-08 | [가이드/콘텐츠] /guides 2편 '신생아 특례 대출 가이드'(parenting-family-finance) — keyword-map §3 큐② C5 대출중심 손글 플래그십. 디딤돌(구입)·버팀목(전세) 공식 검증수치(국토부 마이홈포털 2026 기준: 소득 1.3억/맞벌이2억·순자산 5.11억/3.45억·한도 4억/2.4억·금리 1.8~4.5%/1.3~4.3%·특례 15년/12년·25.6.27 한도경계·2026.12.31 일몰)로 비교표+깊이+FAQ5(JSON-LD)+시점주의 박스. pick-info 크롤 비대상이라 전량 외부 1차출처 손글, 모든 수치 '2026 기준'+공식링크+면책. 제휴 미포함(정보 가이드). 1편 디자인 재사용+DepthCard 헬퍼, guides.ts 등재(허브 카드 1→2)·OG 생성. posts·pick-info 미경유(자동발행 충돌 0). 다자녀특공·C6(적금/청약/보험)는 후속 | 배포대기(커밋 전) | src/app/guides/parenting-family-finance/page.tsx, src/lib/guides.ts, public/images/og/parenting-family-finance.png, docs/project-guide.md
- 2026-06-08 | [발행/보고서] 신규 축제 매일 공유 트랙(§4-21 완료) — 21-a: fetch-public-data.js festival unshift 3곳(:1714/:1883/:1974)에 addedAt(sv-SE KST) 1줄 추가(benefit :1396/:1763 미러, 추가형·기존 116건 미소급). 21-b: build-topic-report.js에 🆕 신규 축제 섹션(:280-296)+festCand isNew(:194, benefit :208 미러), today/yest·calcScore(festival-score)·hot-keywords·esc 전부 재사용(신규 0). 읽기전용 보고서, 발행·dedup·merge 무접촉. 오늘 0건 정상(미소급, 내일 크론부터 누적). node --check 양파일 통과·순수삽입(fetch 3줄/report 19줄). 3a-2②(fetch→hot-keywords lib)는 치환형·반환shape 비호환이라 분리(별도 후속) | 배포대기(커밋 전) | scripts/fetch-public-data.js, scripts/build-topic-report.js, docs/project-guide.md
- 2026-06-07 | [점검/문서] 축제 묶음 자동발행 점검 게이트(§4-15 Phase 4 = §4-15 완료) — daily-deploy-inspection.md [E]를 '블로그 품질(⏸셸브)'→'축제 묶음 자동발행 점검(활성)'으로 재작성, 신규 9항목(발행요일 정합·묶음↔본문 누수감시·직전제외·sourceIds 유효성·시기제목·상설 미혼입·쿠팡0·비교표 완전성·dedup 경로). [A]·맥락 프롬프트 1줄씩 목요일 발행 정합으로 정정(목요일=1편/그외=0). 1:1 시절 무관 ⏸가드는 '필요시 재방문'으로 보존. §5.2 게이트↔점검 짝 충족 | 배포대기(커밋 전) | docs/daily-deploy-inspection.md, docs/project-guide.md
- 2026-06-07 | [발행/인프라] 축제 묶음 자동발행 활성화(§4-15 Phase 3b, 라이브 ON 코드·푸시 시 발효) — deploy.yml "Fetch…" step에 KST 목요일 가드 발행 라인 추가(SHELVED 4줄 그대로 유지, build-topic-report 後·validate 前). $(TZ=Asia/Seoul date +%u)=4일 때만 POST_TYPE=festival generate-blog-post 실행(UTC 러너라 TZ 필수)·그 외 스킵, 5건 미만이면 스크립트 자체 스킵. 발행 라인 if:schedule step 내부라 push 트리거 미발화. 검증: js-yaml 파싱·step7 정상·SHELVED 4줄 보존·Build/Deploy 미변경·오늘 date +%u=7로 발행 0. 푸시 후 다음 KST 목요일(6/11)부터 첫 자동발행 | 배포대기(커밋 전) | .github/workflows/deploy.yml, docs/project-guide.md
- 2026-06-07 | [발행/정리] 생성기 쿠팡 제거 + 죽은 import 정리(§4-15 Phase 3a-6, 발행 OFF) — generate-blog-post.js에서 쿠팡 전부 삭제(extractCoupangKeyword·getCoupangProduct 함수·호출부·coupangPromptSection·coupangDisclosureSection·프롬프트 주입 토큰·주석헤더), 죽은 import 3개(crypto=쿠팡HMAC전용·COUPANG env·isFestivalExpired=셀렉터전환 미사용) 정리. 쿠팡은 festival/benefit 공통부라 양쪽서 제거(전체 일관성 의도). 검증: node --check 통과·잔여참조 0, PREVIEW 글 쿠팡 흔적 0·시기제목/sourceIds8/1분퀴즈/H2/결론 정상·비교표 8/8(이번 생성은 충족, 단 flash 비보장)·본문 5996자, posts 변화 0. 본문밖 쿠팡(AffiliateBanner·go리다이렉트·법적고지·기존posts10건)은 범위밖 미접촉 | 배포대기(커밋 전) | scripts/generate-blog-post.js, docs/project-guide.md
- 2026-06-07 | [발행/정합] 묶음 제목 dedup 면제 완결(§4-15 Phase 3a-5, 발행 OFF) — isDuplicate의 skipProgramDedup→bundleMode 일반화: 묶음(true)은 rule1(완전일치)만 수행·rule2~5(포함·앞10자·Jaccard·program) 면제, 1:1/benefit(false)은 rule1~5 전부 유지. festival 최종재검사에 bundleMode=true 전달. 검증 단위 4/4: 묶음 2주vs1주(Jaccard0.6) 통과·완전동일 차단·program공유 통과 / 1:1 2주vs1주 차단(보호 불변). 3a-4 rule5-only가 rule4에 막히던 것 해소→주간발행 가능. PREVIEW posts 변화 0. 중복관리는 sourceIds 직전제외+rule1 안전망 | 배포대기(커밋 전) | scripts/generate-blog-post.js, docs/project-guide.md
- 2026-06-07 | [발행/검수] PREVIEW_DIR 모드 + 첫 글 품질 검수(§4-15 Phase 3a-3, 발행 OFF) — generate-blog-post.js에 PREVIEW_DIR 추가(설정 시 posts 대신 임시폴더 write, isDuplicate 우회, 출력경로 PREVIEW_DIR 하위 단언, mkdir 보장). 모드순위 BUNDLE_DRY→PREVIEW→DRY_RUN→일반. 검증: 글이 scripts/_preview/에만 생성·posts 변화 0(git status), GEMINI 실호출 성공, 시기제목/originalTitle/sourceIds8/category/비교표/1분퀴즈/쿠팡고지 정상. 본문 골격 합격. 발견 2건(3b 차단막)→3a-4: ①묶음8 vs 본문4 불일치(프롬프트 '3~4개' 잔존, sourceIds엔 8건이라 다음주 직전제외 시 미작성 4건 누수) ②'가족축제' 프로그램토큰 isDuplicate 충돌(주2회차 차단). benefit·DRY_RUN·BUNDLE_DRY 불변 | 배포대기(커밋 전) | scripts/generate-blog-post.js, docs/project-guide.md
- 2026-06-07 | [키워드/인프라] 핫키워드 SSOT 통합 generate·report(§4-15 Phase 3a-2①) — scripts/lib/hot-keywords.js 신설(SEASONAL_KEYWORDS 12개월 단일본=fetch=report 기준 각3개·getTodayHotKeywords 단일 함수·반환형 {keywords,source}·DataLab+seasonal 병합·폴백 내장). generate-blog-post.js 로컬 4함수(SEASONAL/getSeasonal/getNaverDataLab/getTodayHot) 제거→import, build-topic-report.js 로컬 2개 제거→import. generate의 이탈 키워드(12개월 슈퍼셋, 6월 '야외공연' 등) 불채택(기준=둘이 합의된 fetch=report). 검증(BUNDLE_DRY): 6월 키워드 generate·report 동일(야외공연 제거)·묶음 8/8 동점경계까지 일치·source 표기 보존·node --check 3파일 통과. fetch-public-data.js 미접촉(자체 복제본 유지+lib에 '동기화 필수' 주석, →3a-2②). 미리보기=발행 키워드 레벨 확정 | 배포대기(커밋 전) | scripts/lib/hot-keywords.js, scripts/generate-blog-post.js, scripts/build-topic-report.js, docs/project-guide.md
- 2026-06-07 | [발행/인프라] festival 묶음 전환 + BUNDLE_DRY(§4-15 Phase 3a, 발행 OFF) — generate-blog-post.js festival 경로의 targetPersona 그룹핑→selectFestivalBundle 호출 교체(benefit 경로 else로 원형 보존). readLatestFestivalSourceIds(gray-matter)로 직전 festival 글 sourceIds 제외, seasonalBundleTitle 헬퍼+후처리 정규식으로 시기 제목 덮어쓰기·sourceIds 주입, topThemeName→'시기 묶음'·톤'임박 주말 중심'. BUNDLE_DRY=true면 Gemini·쓰기 전 묶음후보만 출력 후 return. 파편수정: data.festivals.reverse() 제자리 변형→[...].reverse()로 원본순서 복원(보고서와 tie-break 일치 보장). 검증(BUNDLE_DRY): 시기제목 '6월 1주' 정확·묶음 8/8 보고서 일치·score 147~90 일치·직전제외 동작(기존글 sourceIds 없어 0, 정상)·skipped=false. 일반 실행 안 함(posts 오염 0) | 배포대기(커밋 전) | scripts/generate-blog-post.js, docs/project-guide.md
- 2026-06-07 | [선정/보고서] 묶음 셀렉터 SSOT 신설 + 보고서 연결(§4-15 Phase 2b) — scripts/lib/festival-bundle.js 신설(selectFestivalBundle: 만료·상설 제외 + 시작임박 dStart 0~21 + calcScore순 상위8, 5미만 skipped). festival-date.js에 RECURRING·isRecurring 헬퍼 추가(상시 판정 SSOT, 보고서 로컬 정규식 제거·import 전환). build-topic-report.js festPicks→셀렉터 호출, 🎪표 score를 calcHotScore→calcScore 통일(festival 한정·정렬도)·시의성 태그(✅/🌱/⏳/🔄) 보존. 검증: ⭐묶음=셀렉터(적격33·상설15제외·skipped=false), calcScore 정렬로 순서 재배열(서울국악 1→7위, 시작근접·주말 반영), 표 score=묶음 score 정합, 묶음 내 🔄 0건. benefit 경로·calcHotScore(benefit) 미접촉. 보고서가 발행 예고와 일치 | 배포대기(커밋 전) | scripts/lib/festival-date.js, scripts/lib/festival-bundle.js, scripts/build-topic-report.js, docs/project-guide.md
- 2026-06-07 | [점수/인프라] calcScore lib 추출 + 날짜 SSOT 통일(§4-15 Phase 2a) — generate-blog-post.js의 calcScore(:230-288)를 scripts/lib/festival-score.js로 추출·export, 시그니처에 today 인자화(재현성). festival 시작일 처리를 인라인 정규식(./- 만, 컴팩트·~범위 누락 버그)→parseFestivalStartDate(festival-date SSOT)로 교체. generate-blog-post.js는 import로 전환(호출부 3곳·.md 생성·게이트 불변). 검증: 점/하이픈 샘플 3건 추출 전후 점수 동일(회귀 0), 컴팩트 날짜(20260610~12) 30→105로 시작근접·주말 보너스 정상 반영(옛 0 폴백 해소), node --check 양 파일 통과. §4-13·만료축제와 동일 인라인 날짜 버그를 발행 점수 경로서도 제거 | 배포대기(커밋 전) | scripts/lib/festival-score.js, scripts/generate-blog-post.js, docs/project-guide.md
- 2026-06-07 | [보고서/콘텐츠] 연중상설 축제 ✅ 분리(§4-17 해소) — festival-date.js에 festivalSpanDays() SSOT 헬퍼 추가, build-topic-report.js festTimeliness에 상설 검사(span≥90 || RECURRING → 🔄) 삽입, festPicks·범례·헤더가 🔄를 ✅서 제외. 실측 ✅38→23(🔄15 분리), ⭐묶음 상위8 전부 6월 단발로 정상화(페인터즈·진연·구석구석·서울광장 등 상설 제외). 점수 함수·발행 파이프 미접촉·읽기전용 보고서 한정. §4-15 묶음 자동발행이 읽을 깨끗한 ✅ 풀 확보 | 배포대기(커밋 전) | scripts/lib/festival-date.js, scripts/build-topic-report.js, docs/project-guide.md
- 2026-06-07 | [렌더/콘텐츠] 블로그 마크다운 렌더 3종 깨짐 수정 — ①단일틸드 취소선 오파싱(remark-gfm singleTilde 기본 true) → 두 렌더러(blog/[slug]/page.tsx, MdContent.tsx)에 {singleTilde:false}로 site-wide 수정, 금액 범위(20~30류 541곳) 평문 정상화·의도적 ~~ 취소선(한강글) 보존 ②자립청년 글 한글 인접 볼드 1곳(닫는 ** 뒤 한글 붙어 flanking 미성립) 공백 추가 ③같은 글 [cite: 본문 데이터] 평문 잔재 4곳(L39·55·65·81) 제거. next build 통과·out/ 실측(장애글 del 0·한강 del 2 보존·자립글 cite/볼드/del 0·금액 평문). 자립청년 글 존폐는 §4-9 후보(오프타깃·청년주제) | 배포대기(커밋 전) | src/app/blog/[slug]/page.tsx, src/components/MdContent.tsx, src/content/posts/2026-06-03-seoul-yongsan-youth-independence-support.md, docs/project-guide.md
- 2026-06-07 | [데이터/무결성] 오염된 fixed- benefit 6건 제거(§4-13 해소) — 본문 6필드(details·detailedExplanation·simulation·tip·coreValue·targetPersona)가 6/3 용산 자립준비청년 글로 오염, 메타(title·target·link·region·deadline)만 정확. 진단상 fetch/Gemini 산물 아님 = 레포에 코드 없는 수기 fixed- 교정 배치(보존형 merge라 방치 시 영구 잔존). 올바른 본문 소스 부재라 삭제 선택(benefits 32→26), search-index·sitemap·정적페이지 6건 전부 소거·next build 통과. §4-12 오매칭 유발한 …265/266 배치 잔재도 동시 제거 | 배포됨 | public/data/pick-info.json, docs/project-guide.md
- 2026-06-06 | [UI/버그] 히어로 '업데이트 날짜' 출처를 최신블로그글 date→데이터(pick-info) 갱신 기반(빌드일 KST)으로 교체 — page.tsx todayUpdates.date를 latestDate→todayStr로 변경(다른 필드·블로그 목록 로직 불변). 자동발행 셸브(6/5) 후 새 글이 없어 6/4에 고정되던 부작용 해소, '매일 갱신' 문구와 정합. pick-info엔 generatedAt 필드 없어 빌드시각 채택(크론 fetch→build라 빌드일=갱신일). 빌드1회 통과·히어로 실측 2026.06.06 확인 | 배포대기(커밋 전) | src/app/page.tsx, docs/project-guide.md
- 2026-06-06 | [콘텐츠/도구] 일일 후보 보고서 3종 분류 개편(§4-16) — build-topic-report.js에 지원금 [용도](📝블로그/📚pillar)·축제 [시의성](✅추천/🌱재료보관/⏳마감임박) 컬럼 + 맨 위 '⭐ 오늘의 추천 글감'(📝 마감순 상위3 / 🎪 ✅ 묶음 5개기준) 신설. 기존 deadlineInfo·festival-date.js 재활용(병렬 파서 0), situationsOf·calcHotScore·발행 파이프라인 미접촉. 스크립트 1회 실행·게이트 PASS(스팟 용도7/7·시의성5/5). 실측(6/6): 용도 📝3·📚29, 시의성 ✅44·🌱60·⏳13(미파싱 0), 📝후보 마감순·축제✅44≥5 묶음제안 | 배포대기(커밋 전) | scripts/build-topic-report.js, docs/daily-deploy-inspection.md, docs/project-guide.md
- 2026-06-06 | [문서/콘텐츠] 콘텐츠 플레이북(docs/content-playbook.md) 신설 — 1:1 금지 원칙, 축제 시기묶음 자동발행 규칙(21일·5~8개·주1·완전자동·시기제목+직전id제외), 지원금 3종 분류(상시pillar/단발블로그/비교가이드), 가이드 클러스터 운영을 SSOT로 확정. §4에 구현 백로그 2건 등재 | 완료 | docs/content-playbook.md, docs/project-guide.md
- 2026-06-06 | [데이터/분류] situations.ts 생애주기 분류 다중소속 전환 + 미러 동기화 — match(단일·parenting선점) → titleStem(제목)+compound(본문 복합어) 2필드, benefitBelongsTo로 독립판정(다중소속). 제목기준+복합어 화이트리스트로 boilerplate bleed 제거('돌봄'bare→복합어, '한부모'추가, housing compound에서 '주거비'제외). build-topic-report.js 미러 단일버킷→situationsOf 1:1 동기화, 분포 라벨 '버킷 합32'→'페이지별 노출 건수(합32 초과 가능)'. 빌드1회 통과·게이트 PASS(진짜9/4 보존·오매칭6 제거·출산가구주거비∈parenting∩housing·housing 라이브 0→4). 실측 분포 parenting14·youth4·senior3·housing4·disability3·etc9(합37) | 배포대기(커밋 전) | src/lib/situations.ts, scripts/build-topic-report.js, docs/daily-deploy-inspection.md, docs/project-guide.md
- 2026-06-05 | [문서] 일일점검 가이드 갱신 — 자동발행 셸브 반영: 블로그 발행 관련 점검 7곳 '⏸ 비활성(이력 보존)' 표시, [H] 일일 후보 보고서 점검 신설(생성·실패가드·판정일치·DataLab 2회·콜아웃·버킷오분류 건수), 크롤 점검은 유지 | 완료 | docs/daily-deploy-inspection.md
- 2026-06-05 | [문서/콘텐츠] 육아·가족 롱테일 키워드 지도(docs/keyword-map-parenting.md) 신설 — 6클러스터·40키워드, /guides 작업 큐 겸 내부링크 설계도, 금액은 복지로 SSOT로 미기재 | 완료 | docs/keyword-map-parenting.md
- 2026-06-05 | [인프라/콘텐츠] 일일 후보 보고서(docs/daily-topic-report.md) 신설 — 크롤·dedup된 축제·지원금 후보를 기존 핫스코어 알고리즘(SSOT 미러)으로 랭킹한 읽기전용 보고서, 크론+수동 양 경로, ≥3 판정·마감임박(0~7일)/이벤트성 콜아웃 포함, DataLab 자체호출 2회(B안)·계절 폴백, 가드(실패허용 exit0·만료 보수판정·생애주기 situations.ts 미러), 자동발행 미활성·posts/pick-info 미접촉 | 배포됨 | scripts/build-topic-report.js, .github/workflows/deploy.yml, commit 7c6000d
- 2026-06-05 | [UI/SEO] 가이드 허브(/guides) + 내비 "가이드" 메뉴 신설 — GUIDES 매니페스트 SSOT(허브·sitemap 공유), parenting-family-benefits 고아 페이지 내부링크·sitemap 연결 해소(가이드 상세도 그동안 sitemap 누락이던 것 함께 해소), 추가형이라 자동발행·데이터층 영향 0, 허브 og:image는 공용 이미지 부재로 보류 | 배포됨 | src/lib/guides.ts, src/app/guides/page.tsx, src/components/Header.tsx, src/app/sitemap.ts, commit 14a6641
- 2026-06-05 | [소스/버그] 마이홈포털 임대주택 0건 근본수정 — 응답 래퍼 body.items.item→body.item(미존재라 raw=[]였음)·필드명 실제키(pblancNm·suplyTyNm·suplyInsttNm·brtcNm·endDe·pcUrl)로 교체·areaName region.name 폴백 제거(비수도권 metro 둔갑 차단)·서비스목적요약 하드코딩 "수도권" 제거(수도권 외 필터 무력화 해소). 드라이런 0→60수집/필터후 수도권30/비수도권잔존0/신청기한 포맷 정상 검증. srhRegion 무효는 미해결(백로그 잔류) | 배포됨(push ee23d40, 다음 크론 반영) | scripts/fetch-public-data.js
- 2026-06-05 | [문서/검증] 지침서 갱신 — 발행 메커니즘 피벗 본문 반영 + 진단 4건으로 미검증 항목 교정. §1: 콘텐츠 철학에 자동발행 셸브·손글 주력·케이던스 원칙(할당량 아님) 추가, 콘텐츠 타입 3종(축제 .md/플래그십 /guides/ JSX/이벤트지원금 .md) 신설, 유통 문장 정정(SEO는 끄지 않고 토대 축적). §2: 크론 흐름 정정(blog-gen 셸브를 [SHELVED] 마커로), DataLab 용도 정정(실행 중인 건 getTodayHotKeywords 핫스코어 정렬 — '블로그 후보 점수화'는 셸브된 getNaverDataLabKeywords였음), 마이홈포털 0건 원인 확정(래퍼 body.item·필드 pblancNm류·srhRegion 무효, 실응답 totalCount 297로 검증), /guides/ 라우트 명시. §4: 백로그 3건(thin 정리·마이홈 수정·축제 content 안정성) 추가. 인수인계의 'srhRegion 버그'·'Gemini JSON 오류'는 미검증 단정이라 실측으로 교정 | 완료 | docs/project-guide.md
- 2026-06-05 | [인프라/전략] 자동 블로그 발행 셸브 — deploy.yml 38~41행(generate-blog-post 혜택·축제 2회+sleep) 주석 처리(if·env·fetch·dedup·validate 미변경, 데이터층 보존). 크롤은 데이터 갱신용 유지, 콘텐츠는 손글 전환. 수동실행(#525)으로 데이터 갱신 O·새 블로그 글 0 검증. 되살리려면 4줄 주석 해제 | 배포됨 | .github/workflows/deploy.yml(commit 767b7f0)
- 2026-06-05 | [가이드/콘텐츠] 육아·가족 돈 pillar 1편 — '0세~취학전 수도권 육아·가족 지원금' 독립 정적 가이드(src/app/guides/parenting-family-benefits) 신설. 2026 검증수치로 보편레이어→나이×돌봄→5종 비교표→FAQ(JSON-LD)→신청→발견CTA. posts·pick-info 미경유라 충돌 0. og·twitter 메타 포함, 금융고리 자리만 | 배포됨 | src/app/guides/parenting-family-benefits/page.tsx, public/images/og/parenting-family-benefits.png
- 2026-06-05 | [문서] 지침서 대개정 — §1 전략을 '육아·가족 중심'으로 전환(수익 타깃 청년→가족·축제=유입자석/지원금·금융=수익레이어·유통은 소셜 기반), §2 스택 표기 정정(Astro→Next.js), 검증 게이트·날짜 SSOT 반영, 유지보수 원칙 3개(SSOT·게이트↔점검 짝·원인재현 증명) 신설 | 완료 | docs/project-guide.md
- 2026-06-05 | [축제/인프라] 만료 축제 누락 근본수정 — date가 구분자없는 컴팩트(YYYYMMDD)라 만료판정 정규식 3곳 0매칭→'만료아님' 통과하던 버그. 공용 파서 SSOT(scripts/lib/festival-date.js) 신설해 서버·블로그가드·프론트 통일, /festivals null→완료 분류로 '진행중' 오분류 차단, 만료 40건(154→114) pick-info 제거(참조 0건 확인), validate에 만료 감시 추가. search-index churn 제외 | 배포됨 | scripts/lib/festival-date.js, fetch-public-data.js, generate-blog-post.js, validate-content.js, FestivalsClient.tsx, pick-info.json, commit 213b064
- 2026-06-05 | [문서] 일일점검 가이드에 블로그 표 무결성 점검 2항목 추가 — ①신규 글 표 3패턴(헤더누락·행간 빈줄·`|`/`:---` 평문노출) 0건 확인 ②ensureTableHeader WARN 글 합성라벨 육안확인. 어제 표 게이트(dropTableInnerBlanks·ensureTableHeader)의 점검 사각지대 차단 | 배포됨 | docs/daily-deploy-inspection.md, commit 7e759d4
- 2026-06-05 | [블로그/인프라] 블로그 표 깨짐 근본수정 — ①6/5 꽃축제글 헤더 합성·표 중간 빈줄 제거 응급복구 ②생성스크립트 표행삭제를 table-aware로 교체(표 내 행 삭제 금지·긴 셀만 절단, 478자 폭표 시뮬 검증) ③검증 게이트에 dropTableInnerBlanks·ensureTableHeader 신설(블로그·축제 양경로 체이닝) ④Gemini 표 프롬프트 5제약(컬럼 3~4·헤더 필수·500자 금지 등) | 배포됨 | generate-blog-post.js, validate-content.js, 2026-06-05-gyeonggi-festival-flower-healing.md, commit 1403412
- 2026-06-04 | [점검] 축제·블로그 상세 본문 가독성 점검 — 둘 다 Markdown 정식 렌더(MdContent / prose-lg)+넉넉한 행간이라 지원금 같은 밀집 이슈 없음. 코드 변경 없이 이상 없음 확인 | 완료 | (조사만)
- 2026-06-04 | [UI/콘텐츠] 지원금 상세 '지원 내용' 가독성 개선 — 행간 확대+본문 굵기 완화(SummaryCard 공유, 축제·블로그 동시 적용), 원본 불릿(○) 렌더 시점 정제, Gemini 프롬프트를 소제목(■)+짧은문단 400~600자 구조로 변경(일반·주거·보완 3곳) | 배포됨 | SummaryCard.tsx, benefit/[id]/page.tsx, fetch-public-data.js
- 2026-06-04 | [인프라] 데이터랩 활성화 + 복지로 중앙부처(V001) 복구 + 축제 발행 3건 게이트 + 죽은 코드(기상청·기업마당) 정리 + 점검가이드 3항목 추가 | 배포됨 | deploy.yml, fetch-public-data.js, generate-blog-post.js, weather.ts(삭제), docs/daily-deploy-inspection.md
- 2026-06-04 | [소스] 전체 데이터 소스 감사 — 사용/미사용·주제 적합도 판정. 복지로 스파인 단일화 방향 확정 | 완료 | (감사 보고)
- 2026-06-04 | [문서] 프로젝트 지침서(본 문서) 신설 | 완료 | docs/project-guide.md

---

## 4. 다음 작업 후보 (백로그)

> 우선순위는 **오늘 배포한 변경이 며칠 돌아간 로그·데이터를 보고** 판단한다(서두르지 않는다).
> 번호는 등록 순서일 뿐 우선순위가 아니다.

1. **블로그 ↔ 원본 상세페이지 역할 분리** — 원본=거래형(제도명·신청·금액), 블로그=비교/가이드형으로
   검색 의도를 갈라 카니발리제이션 방지. **후보 A(진단: 카니발 중복이 실제 있는지 읽기전용 분석)부터** 시작.
2. **중앙부처 데이터 다양성 개선** — 15일 점검에서 장애인·보훈 편중이 확인되면 srchKeyCode 변경 /
   페이지 순환 / 카테고리 균형 수집 중 선택.
3. **여름 시즌 축제 수집 대응** — 인기 축제가 개수 제한 탓에 늦게 뜨는 문제. 순서: ①인기순 정렬 검증
   (데이터랩 로그 확인) → ②페이지 고정(pageNo=1) 해제로 후보 풀 확장 → ③축제만 한도 시즌 탄력(성수기↑).
4. (운영) 수익 레이어(제휴) 부착 — 어느 지원금 페이지에 어떻게(맥락 기반·고지 필수).
5. (운영) 애드센스 재신청 — 위 구조·신뢰 신호가 자리잡은 뒤.
6. **지원금 본문 형식 백필 — §4-20으로 통합·재정의(2026-06-07)** — 등록 당시 'details 30건 옛 산문' 전제가
   필드 오인(details=요약, 본문은 detailedExplanation)으로 판명 → 정정·보류·재정의 일체는 §4-20 참조.
7. **원본 불릿 기호 정제 강화** — 현재 렌더 시점 정제(a)는 benefit 상세 한정·문자열 맨 앞 1회만.
   수집 파이프라인(normalizeItem)에서 '줄별' 정제까지 적용해 근본 해결(가운뎃점 '·'은 보존).
   (b)는 신규 수집분 적용·기존엔 소급 안 됨.
8. **축제 content 빈 경우 generic '추천 포인트' 하드코딩 박스 대체**(festival/[id]/page.tsx:222-243) —
   가독성 아닌 콘텐츠 품질 이슈. content 없는 축제는 영혼 없는 기본 박스가 노출됨. 데이터 부족 시
   처리 방식 재검토(억지 채움 대신 다른 방식).
   ※ 빈-content의 생성층 원인은 §4-11(축제 content 생성 안정성) 참조. 이 박스는 그 모든 원인의 렌더층 폴백.
9. **기존 thin 블로그 글 정리(CLEANUP, 후순위)** — 자동발행 시절 양산된 빈약한 글 정리.
   규모·대상은 착수 시 validate-content.js WARN 카운트로 실측해 확정(핸드오프 추정치 ~42건은 미검증).
   손글 전환 후 사이트 신뢰·SEO 토대 정리 차원, 급하지 않음.
10. **마이홈포털 srhRegion 정상화(커버리지·효율, 후순위)** — 2026-06-05 응답 래퍼(body.item)·필드매핑
    (pblancNm·suplyTyNm·suplyInsttNm·brtcNm·endDe·pcUrl)·서비스목적요약 "수도권" 제거 완료(commit ee23d40)
    → 0건 해소, 수도권 임대주택 정상 수집·비수도권 차단 0. **남은 것**: srhRegion이 무효라 서울·인천·경기
    3회 호출이 동일 전국 리스트를 반환 → dedup 후 고유 소수(오늘 2건). 올바른 지역 파라미터명을 참고문서
    (요청 파라미터 코드_260331.xlsx)에서 확인해 API단 수도권 한정 → 중복 호출 제거 + 수도권 고유 공고 폭 확대.
    (노출 정확도는 이미 정상, 이건 커버리지·효율 개선.)
    · 2026-06-06 라이브 fetch 로그로 확정: 수집·정규화는 정상(서울/인천/경기 각 20건 수신). 0건은 ⓐ srhRegion 무효
      (11/28/41 동일 전국 응답, 전 항목 부산 국민임대) → 페이지1이 비수도권으로 가득 차 수도권 외 스킵 + ⓑ 어쩌다
      포함된 수도권 행복주택(신혼희망타운 예비입주자)마저 품질 게이트 탈락의 복합. 즉 코드 버그 아님 — API 지역
      파라미터 무효가 근본. 수정 선행조건: 올바른 지역 파라미터명을 참고문서(요청 파라미터 코드_260331.xlsx)에서
      확인(srhRegion 아닐 가능성). 착수 시 ① 올바른 파라미터로 수도권 한정 ② 품질 게이트가 임대공고를 부당 탈락
      시키는지 별도 점검. 우선순위 미정(수익 가치 재평가 후 — C5 전세/특례대출 비교가이드가 대안 경로일 수 있음).
11. **축제 content 생성 안정성(현상 미재현, 후순위)** — generateFestivalContent(fetch-public-data.js:270)가
    Gemini로 축제 `content`(마크다운)를 생성, JSON.parse(321행) 실패 시 3회 재시도 후 `''` 폴백(죽지 않음,
    catch 324행 `[content 생성] … 오류` 로그). 핸드오프의 'Gemini JSON 오류'는 **현재 미재현** — pick-info
    114건 전부 content 정상·빈/깨진 0건. 즉 SSOT에 박을 활성 버그 아님. 다만 폴백이 조용해서(빈값+경고만)
    과거 산발 실패가 묻혔을 수 있음 → 의심되면 GitHub Actions 런 로그의 위 문구로 빈도 확인.
    ※ §4-8(렌더층 빈-content 폴백 박스)과 **같은 사슬의 다른 층위**(이건 생성층) — 8은 JSON오류뿐 아니라
    키부재·HTTP실패 등 모든 빈-content 포괄이라 별도 유지.

12. **situations.ts 생애주기 분류 오분류 정리 — ✅ 수정 적용 완료(2026-06-06)**.
    (배경) match 정규식이 노숙인 웰빙보조비·브레인핏45 등을 '임신·출산·육아'에 오분류(target/details의
    '아동·주거' 등 광범위 stem이 boilerplate에 우연히 박혀 매칭) + 단일버킷 첫매칭이 housing을 0으로 만듦.
    (수정) SITUATIONS를 `match` → **`titleStem`(제목에만) + `compound`(본문까지 허용하는 구체 복합어)**
    2필드로 전환, benefitBelongsTo로 **다중소속·우선순위 제거**(parenting 선점 폐기). build-topic-report.js
    미러도 1:1 동기화(단일버킷→situationsOf). '돌봄'(bare) 제거·복합어화, '한부모' 추가, '주거비'(boilerplate)
    는 housing compound에서 의도 제외. 게이트(진짜9/4 보존·오매칭6 제거·출산가구주거비 다중소속) 전부 PASS,
    housing 라이브 0→4 복원. 분포는 '단일 합32'에서 **다중소속 페이지별 노출 건수**로 바뀜(§3 로그 참조).

13. **details 복붙 오염 — ✅ 제거 완료(2026-06-07)**. (실측) 본문 6필드(details·detailedExplanation·simulation·tip·coreValue·targetPersona)가 전부 6/3 용산 자립준비청년 글 내용으로 오염된 benefit 실제 6건(기록상 5+1). 메타(title·target·link·region·deadline)만 항목별 정확. (진단 교정) 핸드오프의 'fetch/Gemini 생성층 의심'은 오판 — details 할당부(fetch-public-data.js:1382·1749)는 항목별 독립이고 fixed- id 생성 코드가 레포에 0건(grep). 정체 = BenefitsClient.tsx:62 주석상 '수기 교정 배치 id'(레포 밖 일회성 주입물), boilerplate 원출처 = 2026-06-03-seoul-yongsan-...md officialTarget. (조치) 올바른 본문 소스 부재 + 6중 5건 오프타깃 → 재생성 대신 6건 삭제(search-index·sitemap·정적페이지 동시 소거). fetch 보존형 merge라 재발 없음. §4-12 분류 오매칭의 데이터 원인도 함께 제거. 살릴 가치 있던 1건(한부모 이사비)은 §4-19로 이관.

14. **상세페이지 '함께 챙기면 좋은 ○○' 위젯 대표 생애주기 선점(사소, 후순위)** — getSituationForBenefit
    (situations.ts:143, getRelatedBenefits→benefit/[id]/page.tsx:126 단일 호출)이 SITUATIONS 배열순
    (parenting 최선두) find-first라, 다중소속 항목이 항상 parenting을 대표로 노출. 실측: 장애인 출산지원금
    2건(894723105·48175923)이 disability 대신, 출산가구 주거비(1778274811700)가 housing 대신 parenting
    섹션으로 뜸. breadcrumb·sitemap·canonical 미사용 = SEO·라우팅 영향 0, 위젯 1개 한정. 제목 출산 기준
    parenting이 거짓은 아니나 더 구체적 소속(disability/housing) 우선 또는 제목매칭 우선 휴리스틱 검토.
    데이터 관찰 후 우선순위 판단. (다중소속 카드 분류는 2026-06-06 완료, 이건 대표 1개 선정만 남은 잔재.)

15. **축제 묶음 자동발행 — ✅ 완료(2026-06-07)**. (설계 SSOT) content-playbook §1. (구현) Phase 1 §4-17
    연중상설 분리(festivalSpanDays·🔄). 2a calcScore lib 추출+날짜 SSOT 통일. 2b selectFestivalBundle
    신설(만료·상설 제외+시작임박 dStart0~21+calcScore순 상위5~8·5미만 스킵)+보고서 통일. 3a 묶음전환+
    BUNDLE_DRY+시기제목+sourceIds. 3a-2① 핫키워드 lib(generate·report SSOT). 3a-3 PREVIEW 검수. 3a-4 본문
    N건 정합(누수 차단). 3a-5 묶음 dedup 면제(rule1만, rule2~5 면제로 주간발행 가능). 3a-6 쿠팡 제거+죽은
    import 정리. 3b deploy.yml KST 목요일 가드(SHELVED 미변경, 별도 활성 라인). 4 일일점검 [E] 활성+9항목.
    (라이브) 푸시 시 발효, 6/11(목) 첫 자동발행. (잔여 백로그) 쿠팡 후속 3a-7(AffiliateBanner·법적고지)·
    3a-8(기존posts10건), 3a-2②(fetch 키워드 lib), 비교표 완전성(flash 비보장·코드조립 후보) — 전부 발행과 독립.

16. **일일 보고서 3종 분류 개편 — ✅ 수정 적용 완료(2026-06-06)**. build-topic-report.js에 지원금 [용도]
    컬럼(📝블로그=실재 미래 마감 단발 / 📚pillar=상시·정기·미파싱, deadlineInfo 재활용)·축제 [시의성]
    컬럼(✅추천=진행중·21일내 시작 / 🌱재료보관=21일 초과 미래 / ⏳마감임박=종료 7일내, festival-date.js
    재활용)·맨 위 '⭐ 오늘의 추천 글감'(📝 마감순 상위3 / 🎪 ✅ 묶음 5개기준) 추가. 기존 deadline 파서·
    festival-date.js 재활용(병렬 파서 신설 0), situationsOf·calcHotScore·발행 파이프라인 미접촉, 읽기전용.
    금융비교(종류3)는 크롤 재고 아닌 기획이라 keyword-map §3 큐 포인터로 안내. (설계 SSOT=content-playbook §1·2.)

17. **보고서 ✅ 연중상설 분리 — ✅ 완료(2026-06-07)**. (조치) festival-date.js에 festivalSpanDays(dateStr)
    SSOT 헬퍼 신설(시작~종료 폭 일수, 단일날짜 0, 미파싱 null). build-topic-report.js festTimeliness에 ✅ 판정
    직전 상설 검사 삽입 — span≥PERENNIAL_SPAN_DAYS(90, 상수) 또는 RECURRING 매치 시 🔄(상설) 태그로 ✅서
    제외. festPicks·헤더·범례 동기화(🔄 별도 카운트). (실측) ✅38→23·🔄15·🌱60·⏳18, 38−15=23 정합. 스팟
    7/7(페인터즈·구석구석·진연·서울광장=🔄 / 서울국악·평택마토·와인뮤직=✅). ⭐묶음 상위8 전부 6월 단발로
    정상화. 점수·발행 파이프 미접촉. §4-15가 읽을 깨끗한 ✅ 풀 확보가 목적.

18. **자동발행 셸브 부작용 — '블로그 글 존재 전제' 로직 잔재 점검(후순위)** — 2026-06-05 자동발행 셸브로
    매일 새 .md가 안 생기면서, '최신 블로그 글'을 오늘로 가정하던 로직들이 어긋남. ⓐ 히어로 업데이트 날짜
    (6/4 고정)는 2026-06-06 수정 완료(page.tsx date→빌드일). ⓑ 남은 것: todayUpdates의 totalCount·festivals·
    benefits가 여전히 latestDate(최신 글 날짜) 기준 '글 묶음'이라, 글 없으면 0/옛값 표시 가능 → 히어로 '신규
    N건'류가 실제와 어긋날 수 있음. ⓒ 그 외 블로그글 존재 전제 가능 지점(sitemap lastmod·푸터·priority 등)
    일괄 grep 점검 권장. 수정 시 '오늘 신규'의 정의를 데이터(pick-info addedAt) 기준으로 재설계할지 판단.

19. **[서울] 저소득/한부모가정 이사비·중개수수료 재추가 후보** — §4-13에서 삭제한 fixed- 6건 중 유일한
    온타깃(주거+한부모). 메타는 정확했으나 본문 6필드가 자립준비청년으로 오염돼 살릴 소스가 없어 함께 삭제.
    복지로 실데이터 재수집 또는 주거/육아 가이드 클러스터(C-주거) 흡수 중 판단. 급하지 않음(틀린 본문
    들고 있느니 빼고 제대로 다시).

20. **지원금 본문 형식 백필 — 보류·재정의(2026-06-07 감사)** — (전제 정정) 옛 산문은 details(=100자 요약,
    fetch:1749)가 아니라 detailedExplanation(■ 구조 본문, fetch:1750) 필드. 실측 26건 중 detailedExplanation
    '구'(■·줄바꿈 없는 1,000~1,500자 통문단, 인사말 시작) 24건 / '신'(■3개 정상) 2건(b-1i2xeo4·b-1een4qo).
    details(요약)는 빈값 1건(gemini-1780353313951 에너지바우처) 외 클린. (방식) 코드상 '기존 텍스트 리포맷'
    경로 없음 — 현 백필은 원본 API/핫키워드 재수집 재생성뿐이라 옛 항목 24건 전부 재생성 보장 안 됨(시의성·
    매칭 의존). (보류 사유) ⓐ 안전한 일괄 경로 부재 ⓑ LLM 일괄 재생성은 [cite]·틸드·복붙 신규 누수 위험
    (6/3 자립청년 글 사고가 그 전례) ⓒ 24건 다수가 §4-9 thin/오프타깃 후보와 중첩. (재정의 순서) §4-9
    솎기로 살릴 항목 확정 → 살릴 것만 신규 '리포맷 스크립트'(추가 수집 없이 기존 detailedExplanation을 ■
    구조로 재작성)로 백필. 통 24건 일괄 재수집은 안 함. 빈값 1건(에너지바우처 요약)은 백필과 분리된 단발로
    별도 처리.

21. **신규 축제 매일 공유 지원 — 신규(2026-06-07 등재)**. 목적: 매일 보고서에서 '오늘 새로 크롤된 축제 +
    인기/키워드'를 보고 그 /festival/<id> 링크를 카톡·인스타에 수동 공유(§4-15 목요일 묶음글과 별개의 매일
    공유 트랙). (병목) festival에 addedAt 필드 없음 → '오늘 신규' 판정 불가(지원금은 addedAt 있어 NEW
    판정됨, 보고서에도 "축제 NEW 불가(—)"로 표기). (단계) 21-a: fetch-public-data.js가 새 festival 첫 저장
    시 addedAt 기록(지원금 방식 차용, 보존형 merge라 기존 116건 소급 안 됨·내일 이후 신규부터 적재). 21-b:
    build-topic-report.js에 🆕 신규 축제 섹션(addedAt 오늘/어제 필터, 각 [제목·/festival 링크·calcScore·
    핫키워드 매칭] 한 줄) 추가. (주의) 21-a는 매일 도는 크롤 핵심 파일이라 읽기전용 조사 선행·회귀 신중.
    이번에 미룬 3a-2②(fetch를 hot-keywords lib로 전환)도 같은 파일이라 함께 진행 후보.
22. **지원금 dedup 제도명 사전 보강(재유입 차단) — 신규(2026-06-08 등재)**. (배경) 깡충깡충 중복(6/8 점검
    최우선★)이 제목 꼬리말 차이로 findBenefitDuplicate(자치구 가드+bigram Jaccard 0.42+포함률)를 통과.
    567890123 삭제는 현 중복만 해소 — 복지로 재서빙+게이트 재실패 시 다른 새 id로 재유입 가능(567890123
    자체는 랜덤숫자라 재등장 불가). (선행, 읽기전용) findBenefitDuplicate가 블로그 isDuplicate처럼 '제도·
    행사명 공유 차단'을 갖는지 확인(지침서 §2 기준 benefit 게이트엔 미기재 → 신설일 가능성) — 없으면 신설,
    있으면 '깡충깡충 성장양육지원금' 정규화 키 추가. (충돌 가드) 정규화 키가 서로 다른 자치구의 동일 제도명을
    거짓 병합하지 않게 자치구 가드와 AND 유지. 우선순위 미정.

## 5. 이 문서 사용법

- **새 대화 시작 시**: 이 파일을 첨부하면 Claude가 맥락을 이어받는다.
- **작업 완료 시**: §3 작업 로그에 한 줄 추가(형식은 §3 상단 규칙). Claude가 복붙용 한 줄을 제공.
- **큰 결정·구조 변경 시**: §1·§2의 해당 부분을 갱신하고, 갱신 사실을 §3 로그에도 한 줄 남긴다.
- **백로그 소진/추가 시**: §4 갱신.
