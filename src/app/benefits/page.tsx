import { Metadata } from 'next';
import CategoryLanding from "@/components/CategoryLanding";
import { isCategoryLive } from "@/config/categories";

export const metadata: Metadata = {
  title: "정부 지원금 | 지원금·복지 혜택 정리 - 팁픽(Tip-Pick)",
  description:
    "청년·출산·주거·중장년 등 정부 지원금과 복지 혜택을 비전문가 눈높이로 정리했습니다. 신청 자격·금액·방법을 한눈에 확인하세요.",
  alternates: { canonical: "/benefits/" },
  ...(isCategoryLive("benefits") ? {} : { robots: { index: false, follow: false } }),
};

export default function BenefitsPage() {
  return (
    <CategoryLanding
      categoryKey="benefits"
      intro="청년·출산·주거·중장년까지 — 정부 지원금과 복지 혜택을 신청 자격·금액·방법 중심으로 정리했습니다."
    />
  );
}
