import { Metadata } from 'next';
import { getSortedPostsData } from "@/lib/posts";
import ElectionClient from "@/components/ElectionClient";

export const metadata: Metadata = {
  title: "우리 동네 선거 공약 | 지역별·가구별 실제 혜택 비교 - 팁픽(Tip-Pick)",
  description: "6/3 지방선거, 복잡한 공약 대신 실제 나에게 돌아오는 혜택을 확인하세요. 팁픽이 지역별 유력 후보의 공약을 쉽게 비교해 드립니다.",
  openGraph: {
    title: "우리 동네 선거 공약 | 지역별·가구별 실제 혜택 비교 - 팁픽(Tip-Pick)",
    description: "내 지역 후보는 어떤 약속을 했을까요? 팁픽에서 실제 혜택 중심으로 비교해 보세요!",
    url: "https://tip-pick.com/election/",
  }
};

export default function ElectionPage() {
  const electionPosts = getSortedPostsData('election');

  return <ElectionClient posts={electionPosts} />;
}
