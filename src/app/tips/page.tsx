import { Metadata } from "next";
import CategoryLanding from "@/components/CategoryLanding";
import { isCategoryLive } from "@/config/categories";

export const metadata: Metadata = {
  title: "알쓸 꿀팁 | 건강·생활·IT 가이드 | 팁픽",
  description:
    "누구에게나 필요하지만 막상 찾으면 복잡한 생활 정보를 쉽게 풀어주는 꿀팁 모음. 건강·제철 음식·전자기기 고르는 법까지.",
  alternates: { canonical: "/tips/" },
  ...(isCategoryLive("tips") ? {} : { robots: { index: false, follow: false } }),
};

export default function TipsPage() {
  return (
    <CategoryLanding
      categoryKey="tips"
      intro="건강·생활·IT까지 — 알아두면 쓸모 있는 생활 꿀팁을 쉽게 정리해 드립니다."
    />
  );
}
