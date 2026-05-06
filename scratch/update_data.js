const fs = require('fs');
const path = './public/data/pick-info.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

data.election = [
  {
    "id": "elect-001",
    "region": "서울",
    "title": "[서울] 청년·신혼부부 주거 지원 공약 비교",
    "excerpt": "유력 후보들의 청년 주택 공급 및 월세 지원 확대 공약을 핵심만 정리했습니다. 실제 혜택 금액을 확인해 보세요.",
    "date": "2026.05.06",
    "image": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=800&auto=format&fit=crop"
  },
  {
    "id": "elect-002",
    "region": "경기",
    "title": "[경기] 광역 교통망 확충 및 통근 시간 단축 공약",
    "excerpt": "GTX 노선 추가 및 광역 버스 증차 등 경기도민의 출퇴근 시간을 30분 단축하겠다는 후보별 약속입니다.",
    "date": "2026.05.06",
    "image": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800&auto=format&fit=crop"
  },
  {
    "id": "elect-003",
    "region": "인천",
    "title": "[인천] 원도심 활성화 및 문화 단지 조성 공약",
    "excerpt": "제물포 등 원도심의 가치를 높이고 대규모 문화 복합 단지를 유치하겠다는 후보들의 구상을 비교해 드립니다.",
    "date": "2026.05.06",
    "image": "https://images.unsplash.com/photo-1449156059431-787c1be17d18?q=80&w=800&auto=format&fit=crop"
  }
];

fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
console.log('Election data added successfully.');
