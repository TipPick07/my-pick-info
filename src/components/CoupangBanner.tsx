'use client';

export default function CoupangBanner() {
  const partnerId = process.env.NEXT_PUBLIC_COUPANG_PARTNER_ID || 'AF6155387';

  if (!partnerId) return null;

  // iframe srcdoc으로 격리 실행 → document.body 오염 및 중복 배너 방지
  const closingScript = '<' + '/script>';
  const html = [
    '<!DOCTYPE html><html>',
    '<head><style>body{margin:0;overflow:hidden}</style></head>',
    '<body>',
    '<script src="https://ads-partners.coupang.com/g.js">' + closingScript,
    '<script>',
    `new PartnersCoupang.G({id:980253,template:'carousel',trackingCode:'${partnerId}',width:'100%',height:140,tsource:''});`,
    closingScript,
    '</body></html>',
  ].join('');

  return (
    <div className="my-4 w-full">
      <iframe
        srcDoc={html}
        width="100%"
        height="160"
        style={{ border: 'none', display: 'block', overflow: 'hidden' }}
        title="쿠팡 파트너스 배너"
      />
      <p className="mt-2 text-center text-[10px] text-gray-400">
        이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
      </p>
    </div>
  );
}
