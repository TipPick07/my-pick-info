<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 팁픽(TIP-PICK) 작업 규칙 — 모든 AI 툴 공통 (코워크·안티그래비티·커서 등)

> 이 파일(AGENTS.md)만 읽는 툴도 아래 6줄만 따르면 어디서든 동일한 품질로 작업할 수 있다.

1. **새 작업 전 `docs/HANDOVER.md`를 먼저 읽는다** — 프로젝트 정체성·현황·백로그가 전부 거기 있다.
2. **글·가이드·계산기 작성은 `docs/WRITING-GUIDE.md`(양식 SSOT) 그대로** — 새 형식을 만들지 않는다. 복붙 시작 프롬프트는 WRITING-GUIDE §8. **⭐ 특히 §1-6 원본성 규칙(자체 계산 예시 필수, 신규·보강 공통)이 최우선 — 공식 자료 재정리만 한 글은 발행 금지.**
3. **`.tsx`·`.ts`는 Edit/Write 도구 금지(NUL 깨짐) → Python으로만** 생성·수정한다. `.md`는 자유.
4. 수치·사실은 공식 자료로 확인하고, 확실하지 않으면 단정하지 않는다(계산기·세금은 검산 필수).
5. **커밋·푸시는 운영자가 명시적으로 지시할 때만** 한다(자동 금지). **단 하나의 예외(2026-08-06 운영자 확정)**: 일일 자동 발행 루틴(`docs/AUTO-PUBLISH.md`)은 그 문서의 검증 게이트를 전부 통과한 발행 커밋에 한해 main에 직접 푸시할 수 있다(fail-closed — 게이트 실패 시 푸시 없이 알림만). **대화형 세션(채팅 작업)에는 이 예외가 적용되지 않는다.**
6. 작업이 끝나면 `docs/HANDOVER.md` §9 작업 로그에 `### 날짜 — 한 줄 요약`을 추가한다.

수익·SEO 전략은 `docs/MONETIZATION-ROADMAP.md`, 배포 후 점검은 `docs/SEO-CHECKLIST.md` 참조.
