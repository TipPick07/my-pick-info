import { Metadata } from "next";
import CategoryLanding from "@/components/CategoryLanding";
import { isCategoryLive } from "@/config/categories";

export const metadata: Metadata = {
  title: "돈이 되는 경제 | 부동산·세금·재테크 가이드 | 팁픽",
  description:
    "부동산·청약, 세금·절세, 재테크 흐름까지 복잡한 돈 이야기를 쉽게 풀어주는 경제 가이드. 실생활에 바로 쓰는 정보만 골라 전해드립니다.",
  alternates: { canonical: "/money/" },
  ...(isCategoryLive("money") ? {} : { robots: { index: false, follow: false } }),
};

export default function MoneyPage() {
  return (
    <CategoryLanding
      categoryKey="money"
      intro="부동산·청약, 세금·절세, 재테크 흐름까지 — 복잡한 돈 이야기를 비전문가 눈높이로 풀어드립니다."
    />
  );
}
