# 구글 색인 요청 큐 (2026-07-20 신설 → **2026-08-09 운영 중단**)

> # ⏹️ 이 루틴은 2026-08-09부로 중단됐다 (운영자 확정)
>
> **재개하지 않는다.** 아래 큐·완료 기록은 이력으로만 남긴다.
>
> ### 중단 근거 (2026-08-09 GSC 실측)
>
> | 항목 | 값 |
> |---|---|
> | 19일간 요청 | 누적 60건+ |
> | 같은 기간 색인 수 | 63 → 47 → **37 (−41%)** |
> | GSC "발견됨 - 현재 색인 생성 안 됨" | **0건 (통과)** |
> | 요청 URL의 실제 결말 | 요청 당일 크롤 → **전량 '크롤됨-색인X'로 탈락** |
>
> **핵심**: 색인 요청의 기능은 "크롤 큐에 넣기"인데, `발견됨-색인X = 0`은 **구글이 이미 모든 URL을 자발적으로 100% 크롤하고 있다**는 뜻이다. 요청 없이 발행한 8/5분(dormant-deposit 글·tax-refund-claim 계산기)도 **당일 크롤**됐다. 즉 sitemap(2026-07-27 lastmod 개정)과 RSS(2026-08-07 신설)만으로 발견·크롤이 충분히 되고 있고, **요청은 색인 판정을 바꾸지 못한다.**
>
> 8/3 D15에 "5/5 전부 완료"로 기록한 5건(parenting-family-benefits · median-income · deposit-protection · hidden-money 글·가이드)이 **전부 8/3 크롤 → 색인 거부**로 확인됐다. 요청은 100% 작동했고, 판정에서 떨어진 것이다.
>
> ### 그럼 무엇이 병목인가
> 구글이 아는 URL 1,207개 중 색인 37(3%) · 크롤됨-색인X 568(47%) · 404 422(35%). **색인 37개조차 표본 10건 중 7건이 이미 삭제된 URL**이고, 홈을 뺀 전부가 **2026-06-13~16에 마지막 크롤된 뒤 두 달째 재방문이 없다**. 2026-06-13 자동생성 페이지 대량 삭제 이후 구글이 사이트를 재평가하는 국면으로, **코드·요청으로 앞당길 수 없다**(상세 = `WEEKLY-REPORT-LOG.md` 4주차).
>
> ### 예외적으로 쓸 때
> 특정 페이지를 크게 고쳐 재평가받고 싶을 때 **월 1~2건**. 그것도 선택 사항이며, 매일·매주 루틴으로 되돌리지 않는다.
>
> ### 대신 하는 것
> 그 시간을 **네이버 서치어드바이저 CTR 최적화**에 쓴다(`MONETIZATION-ROADMAP.md` §7). 근거: 신규 글 1편의 기대 회수는 주 0.28클릭인데, 기존 자산 CTR +1%p는 주 +13클릭 — **약 47배**.

---

## (이력) 중단 전 운영 규칙

> **운영 규칙**: GSC 요청은 **하루 5개**(운영자 타 사이트와 할당 공유).
> 발행일(월·목)은 **신규 2개 + 백로그 3개**, 그 외 날은 **백로그 5개**.
> 운영자가 완료한 URL을 알려주면 아래 완료 기록에 날짜와 함께 체크하고 다음 몫을 뽑는다.
> 네이버 수집 요청은 별도(한도 여유) — 발행·대변경 시 기존 워크플로대로 병행.
> ※ 기존 '보강 36편 큐'(HANDOVER 7/19 로그)는 이 문서로 **대체**된다(전면 검수로 우선순위 재산정).
> ※ **네이버 수집 요청은 중단 대상이 아니다** — 네이버는 정상 작동 중(노출 1,297·클릭 44)이므로 발행·대변경 시 계속 병행한다.

## 우선순위 원칙
1. **T1**: 통합 승계 글(301 수신 + 오늘 대변경) · GSC '크롤링됨-색인안됨'에 잡힌 현행 콘텐츠(구글 재평가 유도 효과 최대)
2. **T2**: C등급 리라이트 12편(내용 대폭 변경)
3. **T3**: 구 큐 미요청 보강 글 잔여
4. **T4**: 가이드·계산기 주요 변경

## 일자별 배정 (완료 시 ✅date 표기)

### D1 — 7/20 (월) ✅ 3/5 완료 후 일일 한도 초과 — 잔여 2건 D2 이월
1. [x] ✅7/20 https://tip-pick.com/blog/2026-06-01-parenting-benefit-region-compare/ — T1 통합 승계(육아) · 색인+수집 완료
2. [x] ✅7/20 https://tip-pick.com/blog/2026-05-09-may-deadline-benefits-guide/ — T1 통합 승계(기한형) · 색인+수집 완료
3. [x] ✅7/20 https://tip-pick.com/blog/2026-07-12-telecom-fee-discount/ — T1 크롤됨-색인안됨·A등급 · 색인+수집 완료
4. [→D2] https://tip-pick.com/blog/2026-07-09-comprehensive-real-estate-tax/ — 한도 초과로 이월
5. [→D2] https://tip-pick.com/blog/2026-07-10-early-reemployment-allowance/ — 한도 초과로 이월

### D2 — 7/21 (화) ✅ 4/5 완료 후 일일 한도 초과 — 잔여 1건 D3 이월
N1. [x] ✅7/21 https://tip-pick.com/blog/2026-07-21-national-pension-boost-strategies/ — 신규 · 색인+수집 완료
N2. [x] ✅7/21 https://tip-pick.com/guides/housing-pension/ — 신규 · 색인+수집 완료
4. [x] ✅7/21 https://tip-pick.com/blog/2026-07-09-comprehensive-real-estate-tax/ — 색인+수집 완료
5. [x] ✅7/21 https://tip-pick.com/blog/2026-07-10-early-reemployment-allowance/ — 색인+수집 완료
6. [→D3] https://tip-pick.com/blog/2026-07-08-electricity-welfare-discount/ — 한도 초과로 이월

### D3 — 7/22 (수 = B형 발행일) ✅ 5/5 전부 완료 — 첫 풀 완료일, 이월 없음
N3. [x] ✅7/22 https://tip-pick.com/blog/2026-07-22-childcare-service-support/ — 신규(지원금, 아이돌봄서비스) · 색인+수집 완료
N4. [x] ✅7/22 https://tip-pick.com/tools/childcare-service/ — 신규(계산기, 아이돌봄 본인부담) · 색인+수집 완료
6. [x] ✅7/22 https://tip-pick.com/blog/2026-07-08-electricity-welfare-discount/ — T1 이월분 · 색인+수집 완료
7. [x] ✅7/22 https://tip-pick.com/blog/2026-07-08-energy-cashback-guide/ — T1 · 색인+수집 완료
8. [x] ✅7/22 https://tip-pick.com/blog/2026-07-09-property-tax-payment-guide/ — T1 · 색인+수집 완료

### D4 — 7/23 (목 = A형 발행일) ✅ 5/5 전부 완료 — 2일 연속 풀 완료, 이월 없음
N5. [x] ✅7/23 https://tip-pick.com/blog/2026-07-23-retirement-pension-default-option/ — 신규(경제, 디폴트옵션) · 색인+수집 완료
N6. [x] ✅7/23 https://tip-pick.com/guides/retirement-pension/ — 신규(가이드, 퇴직연금 DB·DC·IRP) · 색인+수집 완료
9. [x] ✅7/23 https://tip-pick.com/tools/electricity-bill/ — T1 크롤됨-색인안됨 계산기 · 색인 완료
10. [x] ✅7/23 https://tip-pick.com/tools/unemployment-benefit/ — T1 크롤됨-색인안됨 계산기 · 색인 완료
11. [x] ✅7/23 https://tip-pick.com/guides/property-holding-tax/ — T1 크롤됨-색인안됨·메타 정비 · 색인 완료

### D5 — 7/24 (금 = B형 발행일) ✅ 5/5 전부 완료 — 3일 연속 풀 완료, 이월 없음
N7. [x] ✅7/24 https://tip-pick.com/blog/2026-07-24-reduced-work-hours-childcare-pay/ — 신규(지원금, 육아기 근로시간 단축) · 색인+수집 완료
N8. [x] ✅7/24 https://tip-pick.com/tools/reduced-work-hours-pay/ — 신규(계산기, 단축급여 실수령) · 색인+수집 완료
12. [x] ✅7/24 https://tip-pick.com/blog/2026-06-28-basic-pension-guide/ — T2 리라이트(소득인정액 계산) · 색인 완료
13. [x] ✅7/24 https://tip-pick.com/blog/2026-06-28-emergency-welfare-support/ — T2 리라이트(4관문 판정) · 색인 완료
14. [x] ✅7/24 https://tip-pick.com/blog/2026-07-04-housing-benefit-guide/ — T2 리라이트(기준임대료 표) · 색인 완료

### D6 — 7/25 (토, 비발행일 = 백로그 5) ✅ 5/5 전부 완료 — 4일 연속 풀 완료, 이월 없음
15. [x] ✅7/25 https://tip-pick.com/blog/2026-05-09-metropolitan-exclusive-benefits/ — T2 리라이트 + 구 큐 미요청분 · 색인+수집 완료
16. [x] ✅7/25 https://tip-pick.com/blog/2026-06-28-credit-score-guide/ — T2 리라이트(1%p 이자 차 계산) · 색인+수집 완료
17. [x] ✅7/25 https://tip-pick.com/blog/2026-06-27-year-end-tax-settlement-guide/ — T2 리라이트(전후 세액 비교) · 색인+수집 완료
18. [x] ✅7/25 https://tip-pick.com/blog/2026-06-26-jeonse-wolse-buy-comparison/ — T2 리라이트(5년 총비용) · 색인+수집 완료
19. [x] ✅7/25 https://tip-pick.com/blog/2026-06-25-isa-irp-pension-savings-comparison/ — T2 리라이트 · 색인+수집 완료 → **T2 12편 중 8편 소진**

### D7 — 7/26 (일, 비발행일 = 백로그 5) ✅ 4/5 완료 후 일일 한도 초과 — 잔여 1건 D8 이월
20. [x] ✅7/26 https://tip-pick.com/blog/2026-07-01-car-insurance-saving-guide/ — T2 리라이트 · 색인+수집 완료
21. [x] ✅7/26 https://tip-pick.com/blog/2026-07-01-national-tomorrow-learning-card/ — T2 리라이트 · 색인+수집 완료
22. [x] ✅7/26 https://tip-pick.com/blog/2026-07-05-policy-mortgage-loan/ — T2 리라이트(3억 시나리오) · 색인+수집 완료
23. [x] ✅7/26 https://tip-pick.com/blog/2026-05-08-metropolitan-4060-welfare-comparison/ — T2 리라이트 + 구 큐 · 색인+수집 완료 → **T2 12편 전량 소진**
24. [→D8] https://tip-pick.com/blog/2026-07-01-card-tax-deduction-strategy/ — T3 첫 건 · 한도 초과로 내일(7/27) 이월

### D8 — 7/27 (월 = A형 발행일) ✅ 5/5 전부 완료 — 이월 없음
N9. [x] ✅7/27 https://tip-pick.com/blog/2026-07-27-deposit-protection-limit/ — 신규(경제, 예금자보호 1억) · 색인+수집 완료
N10. [x] ✅7/27 https://tip-pick.com/guides/deposit-protection/ — 신규(가이드, 예금자보호 완전정리) · 색인+수집 완료
25. [x] ✅7/27 https://tip-pick.com/blog/2026-07-01-card-tax-deduction-strategy/ — T3 첫 건(D7 이월분) · 색인+수집 완료
26. [x] ✅7/27 https://tip-pick.com/blog/2026-05-09-retirement-welfare-guide/ — T3(피부양자 비교 보강) · 색인+수집 완료
27. [x] ✅7/27 https://tip-pick.com/blog/2026-05-10-earned-income-child-tax-credit-guide/ — T3 · 색인+수집 완료

### D9 — 7/28 (화 = B형 발행일) ✅ 2/5 완료 후 일일 한도 초과 — 잔여 3건 D10 이월
N11. [x] ✅7/28 https://tip-pick.com/blog/2026-07-28-medical-cost-cap-refund/ — 신규(지원금, 본인부담상한제) · 색인+수집 완료
N12. [x] ✅7/28 https://tip-pick.com/tools/medical-cost-cap/ — 신규(계산기, 환급 예상액) · 색인+수집 완료
28. [→D10] https://tip-pick.com/blog/2026-05-13-seoul-ansimsodeuk-guide/ — T3 · 한도 초과로 이월
29. [→D10] https://tip-pick.com/blog/2026-05-17-culture-voucher-nuri-card-guide/ — T3 · 한도 초과로 이월
30. [→D10] https://tip-pick.com/blog/2026-05-17-gyeonggi-youth-support-guide/ — T3 · 한도 초과로 이월
- ※ 이날 URL 검사(색인 상태 점검) 2건 별도 수행 — 크롤 확인용이라 요청 한도와 무관.

### D10 — 7/29 (수) ⏸ 미실행 — 일일 한도 소진(운영자 타 사이트)으로 요청 0건, 발행도 7/30으로 이동
- 이날은 발행 대신 품질 정비(H2 라벨 변주 123건 + 신규 글 역링크 14건) 수행 → 요청할 신규 URL 없음.
- D9 이월 3건은 그대로 D11로 재이월.

### D11 — 7/30 (목 = A형 발행일) ✅ 5/5 전부 완료 — 이월 없음, 2일 밀렸던 D9 잔여분까지 소진
N13. [x] ✅7/30 https://tip-pick.com/blog/2026-07-30-retirement-pension-unpaid-contribution/ — 신규(경제, 퇴직연금 미납 지연이자) · 색인+수집 완료
N14. [x] ✅7/30 https://tip-pick.com/guides/retirement-pension-arrears/ — 신규(가이드, 퇴직연금 미납 대응) · 색인+수집 완료
28. [x] ✅7/30 https://tip-pick.com/blog/2026-05-13-seoul-ansimsodeuk-guide/ — T3 (D9→D10→D11 이월) · 색인+수집 완료
29. [x] ✅7/30 https://tip-pick.com/blog/2026-05-17-culture-voucher-nuri-card-guide/ — T3 (D9→D10→D11 이월) · 색인+수집 완료
30. [x] ✅7/30 https://tip-pick.com/blog/2026-05-17-gyeonggi-youth-support-guide/ — T3 (D9→D10→D11 이월) · 색인+수집 완료

### D12 — 7/31 (금 = B형 발행일) ✅ 5/5 전부 완료 — 이월 없음, 2일 연속 풀 완료
N15. [x] ✅7/31 https://tip-pick.com/blog/2026-07-31-longterm-care-copayment/ — 신규(지원금, 장기요양 본인부담금) · 색인+수집 완료
N16. [x] ✅7/31 https://tip-pick.com/tools/longterm-care-copay/ — 신규(계산기, 등급별 월 부담액) · 색인+수집 완료
31. [x] ✅7/31 https://tip-pick.com/blog/2026-05-18-youth-housing-support-guide/ — T3 · 색인+수집 완료
32. [x] ✅7/31 https://tip-pick.com/blog/2026-05-19-heat-shelter-guide/ — T3(보강) · 색인+수집 완료
33. [x] ✅7/31 https://tip-pick.com/blog/2026-05-21-jongso-tax-filing-guide/ — T3 · 색인+수집 완료

### D13 — 8/1 (토, 비발행일 = 백로그 5) ✅ 5/5 전부 완료 — 3일 연속 풀 완료, 이월 없음
> 토요일은 오픈챗 공유만 하는 날(§7 루틴) → 신규 없이 백로그 5건.
34. [x] ✅8/1 https://tip-pick.com/blog/2026-05-29-energy-voucher-cooling-support/ — T3 · 색인+수집 완료
35. [x] ✅8/1 https://tip-pick.com/blog/2026-05-29-youth-savings-mirae-vs-doyak-guide/ — T3(내일저축 글과 루프) · 색인+수집 완료
36. [x] ✅8/1 https://tip-pick.com/blog/2026-05-31-medical-health-insurance-support/ — T3(장기요양 글과 루프) · 색인+수집 완료
37. [x] ✅8/1 https://tip-pick.com/blog/2026-06-01-icheon-local-currency-cashback/ — T3 · 색인+수집 완료
38. [x] ✅8/1 https://tip-pick.com/blog/2026-06-01-summer-family-benefit-roadmap/ — T3 · 색인+수집 완료

### D14 — 8/2 (일, 비발행일 = 백로그 5) ✅ 5/5 전부 완료 — 4일 연속 풀 완료 · **T3 구 큐 전량 소진, T4 진입**
39. [x] ✅8/2 https://tip-pick.com/blog/2026-06-01-yongsan-disabled-family-birth-support/ — T3 · 색인+수집 완료
40. [x] ✅8/2 https://tip-pick.com/blog/2026-06-03-seoul-yongsan-youth-independence-support/ — T3 · 색인+수집 완료 → **T3 구 큐 잔여 전량 소진**
41. [x] ✅8/2 https://tip-pick.com/guides/youth-support-guide/ — T4 리라이트 가이드 · 색인+수집 완료
42. [x] ✅8/2 https://tip-pick.com/guides/house-capital-gains-tax/ — T4(15억 계산 추가) · 색인+수집 완료
43. [x] ✅8/2 https://tip-pick.com/guides/inheritance-gift-tax/ — T4 · 색인+수집 완료

### D15 — 8/3 (월 = A형 발행일) ✅ 5/5 전부 완료 — **5일 연속 풀 완료**, 이월 없음
N17. [x] ✅8/3 https://tip-pick.com/blog/2026-08-03-hidden-money-refund-deadline/ — 신규(경제, 숨은 돈 창구별 시효) · 색인+수집 완료
N18. [x] ✅8/3 https://tip-pick.com/guides/hidden-money-checkup/ — 신규(가이드, 숨은 돈 통합 조회) · 색인+수집 완료
44. [x] ✅8/3 https://tip-pick.com/guides/parenting-family-benefits/ — T4(누적 3,440만 계산) · 색인+수집 완료
45. [x] ✅8/3 https://tip-pick.com/tools/median-income/ — T4(중위소득 표 추가) · 색인+수집 완료
46. [x] ✅8/3 https://tip-pick.com/guides/deposit-protection/ — T4(7/27 신규 가이드 재요청) · 색인+수집 완료

### D16 — 8/5 (수 = B형 발행일) ✅ 2/5 완료 후 일일 한도 초과 — 잔여 3건 D17 이월
> ※ 8/4(화)는 휴무 — 요청 0건, 발행도 없음. 교대 순서는 그대로 유지.
N19. [x] ✅8/5 https://tip-pick.com/blog/2026-08-05-dormant-deposit-hidden-insurance/ — 신규(경제, 휴면예금·숨은 보험금) · 색인+수집 완료
N20. [x] ✅8/5 https://tip-pick.com/tools/tax-refund-claim/ — 신규(계산기, 경정청구 환급액) · 색인+수집 완료
47. [→D17] https://tip-pick.com/guides/retirement-pension-arrears/ — T4(7/30 신규 재요청) · 한도 초과로 이월
48. [→D17] https://tip-pick.com/tools/medical-cost-cap/ — T4(7/28 신규 재요청) · 한도 초과로 이월
49. [→D17] https://tip-pick.com/tools/longterm-care-copay/ — T4(7/31 신규 재요청) · 한도 초과로 이월

### D17 — 8/6 (목 = A형 발행일) ✅ 2/5 완료 후 일일 한도 초과 — 잔여 3건 D18 이월
N21. [x] ✅8/6 https://tip-pick.com/blog/2026-08-06-unclaimed-national-pension/ — 신규(경제, 국민연금 반환일시금 시효) · 색인+수집 완료
N22. [x] ✅8/6 https://tip-pick.com/guides/national-pension-survivor-benefits/ — 신규(가이드, 국민연금 유족급여) · 색인+수집 완료
47. [→D18] https://tip-pick.com/guides/retirement-pension-arrears/ — T4(D16→D17 이월) · 한도 초과로 재이월
48. [→D18] https://tip-pick.com/tools/medical-cost-cap/ — T4(D16→D17 이월) · 한도 초과로 재이월
49. [→D18] https://tip-pick.com/tools/longterm-care-copay/ — T4(D16→D17 이월) · 한도 초과로 재이월

### D18 — 8/7 (금 = 자동 발행일) ✅ 2/5 완료 후 일일 한도 초과 — 잔여 3건 D19 재이월
> 계획은 '이월분 먼저'였으나, 신규 2건이 **마감 있는 시의성 주제**(국가장학금 2차, 9/9 마감)라 신규를 앞에 두는 것으로 당일 변경.
N23. [x] ✅8/7 https://tip-pick.com/blog/2026-08-07-national-scholarship-second-round/ — 신규(지원금, 국가장학금 2차 신청) · 색인+수집 완료
N24. [x] ✅8/7 https://tip-pick.com/guides/national-scholarship/ — 신규(가이드, 국가장학금 신청 동선) · 색인+수집 완료
47. [→D19] https://tip-pick.com/guides/retirement-pension-arrears/ — T4(D16→D17→D18) · 한도 초과로 **3일 연속 이월**
48. [→D19] https://tip-pick.com/tools/medical-cost-cap/ — T4(D16→D17→D18) · 3일 연속 이월
49. [→D19] https://tip-pick.com/tools/longterm-care-copay/ — T4(D16→D17→D18) · 3일 연속 이월

### D19 — 8/8 (토, 자동 발행일 = 이월 3 + 신규 2)
> ⚠️ **T4 3건이 3일 연속 밀렸다.** 신규를 앞에 두면 계속 잘리므로, 8/8은 **이월분 3건을 먼저 요청**하고 신규를 뒤에 붙인다. 신규가 또 시의성 주제면 그때 다시 판단.
> ✅ 확정(8/8 루틴): 발행분이 **글 1편뿐(짝 없음)**이라 이월 3 + 신규 1 + 우선 재요청 1 = 5건으로 채웠다. 이월분을 앞에 둔다.
47. [ ] https://tip-pick.com/guides/retirement-pension-arrears/ — T4(3일 이월, 최우선)
48. [ ] https://tip-pick.com/tools/medical-cost-cap/ — T4(3일 이월)
49. [ ] https://tip-pick.com/tools/longterm-care-copay/ — T4(3일 이월)
N25. [ ] https://tip-pick.com/blog/2026-08-08-minimum-wage-2027-monthly-pay/ — 신규(경제, 2027년 최저임금 월급 환산) · 루틴 발행분
50. [ ] https://tip-pick.com/blog/2026-05-29-youth-savings-mirae-vs-doyak-guide/ — ⭐ 우선 재요청 후보 1순위(실측 1,454, 89편 중 1위) · 짝 없는 날의 대체 슬롯

### 우선 재요청 후보 (키워드 실측 근거, 2026-08-06 신설)
- ⭐ [ ] https://tip-pick.com/blog/2026-05-29-youth-savings-mirae-vs-doyak-guide/ — **실측 1,454(기준어의 14.5배, 87편 중 1위)**. 8/1에 1회 요청했으나 사이트 최대 자산이므로 보강 후 재요청 1순위.
- [ ] https://tip-pick.com/blog/2026-05-08-k-pass-transit-daytrip-guide/ — 기후동행카드 250
- [ ] https://tip-pick.com/blog/2026-07-04-livelihood-benefit-guide/ — 기초생활수급자 33.4(8/6 제목 정비 반영분)

### T4 잔여 대기열 (D19 이후, 앞에서부터 소진)
50. [ ] 이후: 나머지 가이드·계산기 — **8/9 캡처의 '크롤됨-색인X 534' 목록 확인 후 재산정**(현행 콘텐츠가 묶여 있으면 그 URL을 최우선 재요청)

## 완료 기록 (운영자 보고분만 기입)
| 날짜 | 완료 URL | 비고 |
|---|---|---|
| 7/20 | /blog/2026-07-20-youth-tomorrow-savings-account-guide/ | 신규(아침 완료) |
| 7/20 | /tools/youth-savings-account/ | 신규(아침 완료) |
| 7/20 | /blog/2026-06-01-parenting-benefit-region-compare/ | 통합 승계 · 색인+수집 |
| 7/20 | /blog/2026-05-09-may-deadline-benefits-guide/ | 통합 승계 · 색인+수집 |
| 7/20 | /blog/2026-07-12-telecom-fee-discount/ | 색인+수집 · 이후 일일 한도 초과 |
| 7/21 | /blog/2026-07-21-national-pension-boost-strategies/ | 신규 · 색인+수집 |
| 7/21 | /guides/housing-pension/ | 신규 · 색인+수집 |
| 7/21 | /blog/2026-07-09-comprehensive-real-estate-tax/ | 이월분 · 색인+수집 |
| 7/21 | /blog/2026-07-10-early-reemployment-allowance/ | 이월분 · 색인+수집 · 이후 한도 초과 |
| 7/22 | /blog/2026-07-22-childcare-service-support/ | 신규 · 색인+수집 |
| 7/22 | /tools/childcare-service/ | 신규 · 색인+수집 |
| 7/22 | /blog/2026-07-08-electricity-welfare-discount/ | 이월분 · 색인+수집 |
| 7/22 | /blog/2026-07-08-energy-cashback-guide/ | 색인+수집 |
| 7/22 | /blog/2026-07-09-property-tax-payment-guide/ | 색인+수집 · 5/5 첫 풀 완료 |
| 7/23 | /blog/2026-07-23-retirement-pension-default-option/ | 신규 · 색인+수집 |
| 7/23 | /guides/retirement-pension/ | 신규 · 색인+수집 |
| 7/23 | /tools/electricity-bill/ | T1 백로그 · 색인 |
| 7/23 | /tools/unemployment-benefit/ | T1 백로그 · 색인 |
| 7/23 | /guides/property-holding-tax/ | T1 백로그 · 색인 · 5/5 풀 완료 |
| 7/24 | /blog/2026-07-24-reduced-work-hours-childcare-pay/ | 신규 · 색인+수집 |
| 7/24 | /tools/reduced-work-hours-pay/ | 신규 · 색인+수집 |
| 7/24 | /blog/2026-06-28-basic-pension-guide/ | T2 · 색인 |
| 7/24 | /blog/2026-06-28-emergency-welfare-support/ | T2 · 색인 |
| 7/24 | /blog/2026-07-04-housing-benefit-guide/ | T2 · 색인 · 5/5 풀 완료(3일 연속) |
| 7/25 | /blog/2026-05-09-metropolitan-exclusive-benefits/ | T2 · 색인+수집 |
| 7/25 | /blog/2026-06-28-credit-score-guide/ | T2 · 색인+수집 |
| 7/25 | /blog/2026-06-27-year-end-tax-settlement-guide/ | T2 · 색인+수집 |
| 7/25 | /blog/2026-06-26-jeonse-wolse-buy-comparison/ | T2 · 색인+수집 |
| 7/25 | /blog/2026-06-25-isa-irp-pension-savings-comparison/ | T2 · 색인+수집 · 5/5 풀 완료(4일 연속) |
| 7/26 | /blog/2026-07-01-car-insurance-saving-guide/ | T2 · 색인+수집 |
| 7/26 | /blog/2026-07-01-national-tomorrow-learning-card/ | T2 · 색인+수집 |
| 7/26 | /blog/2026-07-05-policy-mortgage-loan/ | T2 · 색인+수집 |
| 7/26 | /blog/2026-05-08-metropolitan-4060-welfare-comparison/ | T2 · 색인+수집 · T2 전량 소진 · 이후 한도 초과 |
| 7/27 | /blog/2026-07-27-deposit-protection-limit/ | 신규 · 색인+수집 |
| 7/27 | /guides/deposit-protection/ | 신규 · 색인+수집 |
| 7/27 | /blog/2026-07-01-card-tax-deduction-strategy/ | 이월분 T3 · 색인+수집 |
| 7/27 | /blog/2026-05-09-retirement-welfare-guide/ | T3 · 색인+수집 |
| 7/27 | /blog/2026-05-10-earned-income-child-tax-credit-guide/ | T3 · 색인+수집 · 5/5 풀 완료 |
| 7/28 | /blog/2026-07-28-medical-cost-cap-refund/ | 신규 · 색인+수집 |
| 7/28 | /tools/medical-cost-cap/ | 신규 · 색인+수집 · 이후 한도 초과(잔여 3건 D10 이월) |
| 7/29 | — | 일일 한도 소진(타 사이트)으로 요청 0건 · 발행도 7/30 이동 |
| 7/30 | /blog/2026-07-30-retirement-pension-unpaid-contribution/ | 신규 · 색인+수집 |
| 7/30 | /guides/retirement-pension-arrears/ | 신규 · 색인+수집 |
| 7/30 | /blog/2026-05-13-seoul-ansimsodeuk-guide/ | T3 2일 이월분 · 색인+수집 |
| 7/30 | /blog/2026-05-17-culture-voucher-nuri-card-guide/ | T3 2일 이월분 · 색인+수집 |
| 7/30 | /blog/2026-05-17-gyeonggi-youth-support-guide/ | T3 2일 이월분 · 색인+수집 · 5/5 풀 완료, 이월 0 |
| 7/31 | /blog/2026-07-31-longterm-care-copayment/ | 신규 · 색인+수집 |
| 7/31 | /tools/longterm-care-copay/ | 신규 · 색인+수집 |
| 7/31 | /blog/2026-05-18-youth-housing-support-guide/ | T3 · 색인+수집 |
| 7/31 | /blog/2026-05-19-heat-shelter-guide/ | T3 · 색인+수집 |
| 7/31 | /blog/2026-05-21-jongso-tax-filing-guide/ | T3 · 색인+수집 · 5/5 풀 완료, 2일 연속 |
| 8/1 | /blog/2026-05-29-energy-voucher-cooling-support/ | T3 · 색인+수집 |
| 8/1 | /blog/2026-05-29-youth-savings-mirae-vs-doyak-guide/ | T3 · 색인+수집 |
| 8/1 | /blog/2026-05-31-medical-health-insurance-support/ | T3 · 색인+수집 |
| 8/1 | /blog/2026-06-01-icheon-local-currency-cashback/ | T3 · 색인+수집 |
| 8/1 | /blog/2026-06-01-summer-family-benefit-roadmap/ | T3 · 색인+수집 · 5/5 풀 완료, 3일 연속 |
| 8/2 | /blog/2026-06-01-yongsan-disabled-family-birth-support/ | T3 · 색인+수집 |
| 8/2 | /blog/2026-06-03-seoul-yongsan-youth-independence-support/ | T3 · 색인+수집 · T3 구 큐 전량 소진 |
| 8/2 | /guides/youth-support-guide/ | T4 · 색인+수집 |
| 8/2 | /guides/house-capital-gains-tax/ | T4 · 색인+수집 |
| 8/2 | /guides/inheritance-gift-tax/ | T4 · 색인+수집 · 5/5 풀 완료, 4일 연속 |
| 8/3 | /blog/2026-08-03-hidden-money-refund-deadline/ | 신규 · 색인+수집 |
| 8/3 | /guides/hidden-money-checkup/ | 신규 · 색인+수집 |
| 8/3 | /guides/parenting-family-benefits/ | T4 · 색인+수집 |
| 8/3 | /tools/median-income/ | T4 · 색인+수집 |
| 8/3 | /guides/deposit-protection/ | T4 재요청(색인 확인용) · 색인+수집 · 5/5 풀 완료, 5일 연속 |
| 8/4 | — | 휴무 · 요청 0건 |
| 8/5 | /blog/2026-08-05-dormant-deposit-hidden-insurance/ | 신규 · 색인+수집 |
| 8/5 | /tools/tax-refund-claim/ | 신규 · 색인+수집 · 이후 한도 초과(T4 3건 D17 이월) |
| 8/6 | /blog/2026-08-06-unclaimed-national-pension/ | 신규 · 색인+수집 |
| 8/6 | /guides/national-pension-survivor-benefits/ | 신규 · 색인+수집 · 이후 한도 초과(T4 3건 D18 재이월) |
| 8/7 | /blog/2026-08-07-national-scholarship-second-round/ | 신규(자동 발행) · 색인+수집 |
| 8/7 | /guides/national-scholarship/ | 신규(자동 발행) · 색인+수집 · 이후 한도 초과(T4 3건 D19 재이월, 3일 연속) |
