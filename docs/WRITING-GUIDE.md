# 팁픽(TIP-PICK) 글 작성 양식 가이드 (SSOT)

> **이 문서의 목적**: 어떤 툴(코워크·안티그래비티 챗·기타 AI)에서든, 집·회사 어디서든
> 이 문서 + `docs/HANDOVER.md`만 읽으면 **기존 글 양식/형식/규칙을 벗어나지 않고** 글을
> 작성할 수 있다. "오늘 ○○ 글 1편 써줘"라고 하면 아래 양식을 그대로 따른다.
>
> 최종 갱신: 2026-07-02 | 도메인: tip-pick.com | 어떤 툴에서든 복붙 시작 프롬프트는 §8

---

## 0. 먼저 — 무엇을 만들지 정한다 (3종류)

| 종류 | 위치 | 언제 |
|---|---|---|
| **블로그 글** (.md) | `src/content/posts/YYYY-MM-DD-slug.md` | 경제·지원금 등 개별 글 |
| **가이드** (.tsx) | `src/app/guides/<slug>/page.tsx` + `guides.ts` 등록 | 한 주제를 깊이 묶는 허브 |
| **계산기** (.tsx) | `src/app/tools/<slug>/` + 위젯 + 허브 + sitemap | 정확히 계산되는 도구 |

작업 흐름은 §5 워크플로우 참조.

---

## 1. 블로그 글 (.md) — 가장 자주 쓰는 형식

**파일**: `src/content/posts/YYYY-MM-DD-english-slug.md` (날짜 = 작성일, slug = 영문 케밥)

### 1-1. 공통 frontmatter (모든 글)
```yaml
title: "..."        # ≤ 35자. 에버그린(시점성 표현 금지). 핵심 키워드 앞쪽.
date: YYYY-MM-DD
summary: ...        # 1~2문장
description: ...    # ≤ 90자, 검색 노출용
category: 경제      # ⚠️ "경제" 또는 "benefit" 둘 중 하나만! (아래 1-4)
tags: [키워드, ...]
officialCurationNote: "..."   # ⭐ 에디터 한마디(상세 페이지 상단 박스에 노출)
```

### 1-2. 경제 글 (`category: 경제` → /money)
본문 H2 구조(기존 글 그대로):
```
(도입 2~3문단)
## 한눈에 비교        ← 표 1개 이상
## (핵심 섹션들)
## 자주 묻는 질문
## 마무리            ← 내부링크 루프(형제 글·계산기·/money)
(면책 한 줄: 2026년 기준, 공식 확인 안내)
```
표준 예시: `2026-06-28-credit-score-guide.md`, `2026-06-28-stress-dsr-loan-limit-2026.md`

### 1-3. 지원금 글 (`category: benefit` → /benefits)
지원금 글은 상세 템플릿이 **공식정보 블록**을 렌더하므로 `official*` 필드를 채운다.
```yaml
# (공통 frontmatter에 더해)
officialTarget: 만 65세 이상 ...        # 대상
officialDetails: ...                     # 한 줄 개요
officialRequirements: ["조건1", "조건2", "조건3"]
officialHowToApply: ["신청처1", "신청처2"]
officialTip: "..."
officialDeadline: 상시                    # ⭐ 상시 사업이면 반드시 "상시"(에버그린). 진짜 마감 있을 때만 날짜.
officialEligibilityQuiz: []               # ⭐ 빈 배열이면 '1분 자격진단' 위젯 미표시(기본). 켜려면 질문 배열.
link: "https://www.bokjiro.go.kr"        # 공식 신청 사이트
```
본문 H2 구조:
```
(도입 2~3문단)
## 한눈에 요약        ← 표
## 누가 받나          ← 대상·소득/재산 조건
## 얼마나 받나        ← 금액(종류별)
## 어떻게 신청하나
## 자주 묻는 질문
## 마무리            ← 내부링크 루프(/benefits·관련 글)
(면책)
```
표준 예시(이 양식의 기준): **`2026-06-28-basic-pension-guide.md`**, **`2026-06-28-emergency-welfare-support.md`**

### 1-4. ⚠️ category 규칙 (중요)
- **`경제` 또는 `benefit`만 쓴다.** `정보`·`benefits`·`가이드` 같은 값은 쓰지 말 것(매핑/라벨 꼬임).
- (과거 `정보` 글은 2026-07-02 전량 `benefit`으로 통일 완료 → 현재 두 값만 존재. 신규도 두 값만.)

### 1-5. 절대 금지 / 필수
- ❌ `image`·`ogImage`·`originalTitle` 필드 넣지 말 것(미사용 잔재. 썸네일은 카테고리 색 자동).
- ❌ 지역명·운영자 이름·"공공데이터" 문구.
- ❌ 시점성 표현("곧 출시", "마감 임박", "이번 달") → **에버그린**으로. 제목·summary·description(검색 노출면)에는 재촉·낚시 어투("서두르세요", "놓치지 마세요!") **절대 금지**, 본문에서도 지양.
- ✅ 수치·사실은 공식 자료로 확인, 불확실하면 단정 금지.
- ✅ 내부링크 루프(글→글, 계산기, 카테고리) 필수 — 마무리에 형제 글 1~2 + 본문 맥락 링크.

---

## 2. 가이드 (.tsx)

**파일**: `src/app/guides/<slug>/page.tsx` 신설 + `src/lib/guides.ts` 배열에 등록(둘 다 필수).

표준 예시(이 양식의 기준): **`house-capital-gains-tax`**, **`youth-support-guide`**, `daycare-admission`

구조(위 예시 파일 토큰 그대로 복제):
```
HERO(배지 + H1 + 도입 + 요약박스 3개)
→ ## 핵심 비교표(table)
→ DepthCard 2~3개 (인라인 컴포넌트)
→ ## 한 장 체크리스트
→ ⚠️ 주의 박스(amber)
→ ## FAQ (네이티브 <details>)
→ ## 관련 가이드·글 (카드 링크)
→ CTA 2개 (왼쪽=외부 공식 신청/조회 사이트, 오른쪽=공개 허브 /benefits 또는 /money)
→ 면책 + 출처
→ FAQ·Breadcrumb JSON-LD
```
- 외부 컴포넌트는 `Header`/`Footer`만. `SectionTitle`·`DepthCard`는 파일 안에 인라인.
- `guides.ts`에 `{ slug, title, description, category, emoji }` 추가(`image`는 생략).
- OG 이미지 파일이 없으면 `metadata`의 `openGraph.images`는 **비워 둔다**(임의 차용 금지).
- 홈 노출은 `GUIDES.slice(0, 6)` — 7편 넘기면 새 가이드를 배열 **맨 앞**에 추가해야 최신이 홈에 보임.

---

## 3. 계산기 (.tsx)

**파일**: `src/app/tools/<slug>/page.tsx`(서버) + `src/components/<Name>Calculator.tsx`(client 위젯)
+ `src/app/tools/page.tsx`의 `TOOLS` 카드 추가 + `src/app/sitemap.ts`의 `basePaths` 경로 추가.

표준 예시: `retirement-pay`, `hourly-wage`, `car-tax`, `savings-interest`
- page: `metadata` + H1 + `<Calculator/>` + SEO `article` 섹션 + 면책.
- 위젯: `"use client"` + `useState` + 계산 + 결과 카드.
- ⚠️ **정확히 계산되는 것만 만든다.** 변수가 많아 부정확해질 주제(양도세·증여세·종부세·DSR 등)는 계산기로 만들지 말고 **가이드 글**로 다룬다. (저품질 = 신뢰 추락, 절대 금지)
- ✅ 작성 후 **node로 검산** 필수(공식대로 값이 나오는지).

---

## 4. 공통 기술 규칙 (반드시 지킬 것)

- ⚠️ **`.tsx`·`.ts` 파일은 Edit·Write 도구로 만들지/고치지 말 것** → NUL 바이트가 섞여 깨진다(TS1127). **Python으로만** 쓴다:
  `open(path, "w", encoding="utf-8", newline="\n").write(content)` (신규) /
  기존 수정은 `open(path, encoding="utf-8", newline="").read()` → 문자열 치환 → 같은 방식 저장.
  기존 파일이 깨졌다면 `git show HEAD:<경로>`로 원본을 받아 복구.
- `.md` 파일은 Write로 생성해도 안전.
- 커밋·푸시는 **운영자 지시 시에만**(자동 금지). 빌드는 운영자 PC/CI(`npm run build`).
- 검증: `npx tsc --noEmit`(EXIT 0) — `.next/dev` stale 에러는 `tsc 2>&1 | grep -v '^.next/'`로 src만 보거나 `rm -rf .next` 후 재실행 / `node scripts/validate-content.js`(게이트 통과) / 계산기 node 검산 / 내부링크 대상 파일 존재 확인.
- 카테고리 노출 스위치는 `src/config/categories.ts`의 `APPROVAL_MODE`(현재 true: 경제·지원금·계산기만 공개, 핫이슈·나들이·꿀팁 숨김).
- **SEO 필수(2026-07-06 전수 보정 완료 상태 유지)**: 새 페이지(page.tsx)에는 `alternates: { canonical: "/<경로>/" }`를 반드시 넣는다. 내부 링크(본문·컴포넌트)는 항상 **trailing slash**(`/tools/salary/`처럼) — no-slash는 크롤러에 308 홉을 만든다. 외부 링크는 https만.

---

## 5. "오늘 ○○ 글 써줘" 워크플로우

1. **종류·카테고리 확정** — 경제 글 / 지원금 글 / 가이드 / 계산기 중 무엇인가.
2. **중복 확인** — `grep -rl "키워드" src/content/posts/` 등으로 기존 글과 안 겹치는지.
3. **사실 검증** — WebSearch로 2026 기준 공식 수치 확인(보건복지부·국세청·국토부 등). 단정 금지.
4. **작성** — 위 §1~3 해당 양식 그대로(표준 예시 파일을 본떠서).
5. **등록** — 가이드면 `guides.ts`, 계산기면 허브 `TOOLS` + `sitemap`.
6. **검증** — tsc EXIT 0 / 게이트 통과 / (계산기) node 검산 / 내부링크 확인 / NUL 0.
7. **기록** — `docs/HANDOVER.md` §9에 `### 날짜 — 한 줄 요약` + 검증한 수치·출처.
8. **커밋/푸시는 운영자 지시 대기.**
9. **(배포 후) 오픈채팅 공유용 요약 작성** → §7. URL·강조점이 불확실하면 운영자에게 먼저 요청한다.

---

## 6. 현재 콘텐츠 현황 (2026-07-07)

- **블로그 글 73편** (benefit 51 · 경제 22) — 7/2 전 글 SEO 규격 통일 완료(제목≤35자·설명≤90자·에버그린 마감·내부 루프·게이트 경고 0). **신규 글도 이 규격 필수.**
- **가이드 13편**: `self-employed-freelancer-tax`, `first-home-purchase`, `inheritance-gift-tax`, `overseas-stock-capital-gains-tax`, `unemployment-benefit-guide`, `three-pillar-pension`, `comprehensive-income-tax-filing`, `parenting-family-benefits`, `parenting-family-finance`, `parenting-family-savings`, `daycare-admission`, `house-capital-gains-tax`, `youth-support-guide`
- **계산기 14종**: 연봉 실수령액(`salary`), 대출 이자(`loan`), 종합소득세(`income-tax`), 4대보험(`insurance`), 퇴직금(`retirement-pay`), 시급·주휴수당(`hourly-wage`), 자동차세(`car-tax`), 예금·적금 이자(`savings-interest`), 전월세 전환(`rent-conversion`), 부동산 중개보수(`brokerage-fee`), 연차수당(`annual-leave-allowance`), 해외주식 양도세(`overseas-stock-tax`), 기준 중위소득(`median-income`), 육아휴직급여(`parental-leave-pay`)

> 새 글/가이드/계산기를 추가하면 이 현황도 함께 갱신한다.

---

## 7. 오픈채팅 공유용 요약 (복붙)

> 새 글·가이드·계산기를 발행하면, **카카오 오픈채팅방(팁픽)에 바로 올릴 수 있는 짧은 요약**을 함께 만든다.

### 양식 (복붙 템플릿)
```
{이모지} {짧은 제목}

{핵심 한 줄 요약}

• {포인트 1}
• {포인트 2}
• {포인트 3}

👉 {URL}
#{태그1} #{태그2} #{태그3}
```

### 규칙
- **짧게** — 모바일 한 화면. 핵심 불릿 3~4개.
- 이모지 1~2개(과하지 않게), 과장·낚시 금지(신뢰 우선).
- 마지막 줄에 **URL + 해시태그**(검색 키워드 = 그 글의 핵심어).

### 예시 (양도세 가이드)
```
🏠 집 팔 때 양도소득세, 1주택이면 12억까지 비과세

집 팔 때 세금, 핵심은 '1세대 1주택 비과세' 해당 여부예요.

• 2년 보유(조정지역은 2년 거주) + 12억 이하 → 비과세
• 장기보유특별공제 최대 80%
• 다주택 중과 2026.5 부활(조정지역)

👉 tip-pick.com/guides/house-capital-gains-tax/
#양도소득세 #1주택비과세 #부동산세금
```

### ⚠️ 정보 요청 원칙
- **URL은 배포돼야 최종 확정**되고, 글마다 강조할 수치·포인트가 다르다.
- 따라서 요약을 만들기 전 **운영자에게 ① 정확한 공유 URL ② 강조하고 싶은 포인트(있으면)를 요청**한다. (가이드·계산기 경로는 알지만, 도메인 포함 최종 URL과 노출 강조점은 운영자 확인이 안전)

---

## 8. 시작 프롬프트 (어떤 툴에서든 복붙)

> 코워크·안티그래비티·커서 등 **아무 AI 툴**에 아래를 그대로 붙여넣으면 기존 양식대로 작업된다.
> `[ ]` 부분만 골라 채우면 끝. 주제를 비우면 AI가 기존 클러스터에 맞게 제안한다.

```
docs/HANDOVER.md와 docs/WRITING-GUIDE.md를 먼저 읽고 나서,
오늘 [경제 글 1편 | 지원금 글 1편 | 가이드 1편 | 계산기 1종]을 기존 양식 그대로 작성해줘.
주제: [비워두면 기존 클러스터에 맞는 주제 2~3개를 먼저 제안하고 내 선택을 기다릴 것]

지켜야 할 것:
- 기존 글과 중복 금지(grep으로 확인), 2026년 기준 공식 자료로 사실 검증(단정 금지)
- 제목 35자 이내·키워드 앞배치, 설명 90자 이내, 에버그린(시점성 표현·마감일 금지)
- 내부 루프 링크 필수(마무리에 형제 글·계산기·허브), 링크 대상 실존 확인
- .tsx/.ts 파일은 Edit/Write 금지 → Python으로만 작성·수정
- 검증: 게이트(node scripts/validate-content.js) 통과 + NUL 0 + (계산기면) node 검산
- 커밋·푸시는 하지 말 것. 끝나면 docs/HANDOVER.md §9에 로그 한 줄 추가.
```

- 계산기·가이드까지 묶는 날은 첫 줄을 "글 2편 + 계산기 1종을 서로 내부링크로 묶은 클러스터로"처럼 바꾸면 된다.
- 발행 후 카카오 공유 요약이 필요하면 "§7 양식으로 오픈채팅 요약도 만들어줘. URL은 ○○○"라고 덧붙인다.
