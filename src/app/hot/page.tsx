import { Metadata } from "next";
import CategoryLanding from "@/components/CategoryLanding";
import { isCategoryLive } from "@/config/categories";

export const metadata: Metadata = {
  title: "오늘의 핫이슈 | 스포츠·경제·이슈 가이드 | 팁픽",
  description:
    "지금 사람들이 가장 많이 검색하는 이슈를 한눈에 이해되는 가이드 형식으로 정리합니다.",
  alternates: { canonical: "/hot/" },
  ...(isCategoryLive("hot") ? {} : { robots: { index: false, follow: false } }),
};

export default function HotPage() {
  return (
    <CategoryLanding
      categoryKey="hot"
      intro="지금 가장 많이 검색되는 이슈를 '한눈에 이해되는 가이드'로 풀어드립니다."
    />
  );
}
