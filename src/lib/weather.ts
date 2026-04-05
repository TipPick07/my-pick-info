interface Weather {
  region: string;
  temp: string;
  status: string;
  icon: string;
}

export async function getRealTimeWeather(apiKey: string): Promise<Weather[]> {
  // If no key or placeholder is provided, return fallback data
  if (!apiKey || apiKey.includes("여기에_본인")) {
    return [
      { region: "서울", temp: "22°", status: "맑음(연동 안됨)", icon: "☀️" },
      { region: "인천", temp: "21°", status: "맑음(연동 안됨)", icon: "☀️" },
      { region: "경기", temp: "23°", status: "맑음(연동 안됨)", icon: "☀️" }
    ];
  }

  const regions = [
    { name: "서울", nx: 60, ny: 127 },
    { name: "인천", nx: 55, ny: 124 },
    { name: "경기", nx: 60, ny: 120 }
  ];

  const now = new Date();
  if (now.getMinutes() < 40) {
    now.setHours(now.getHours() - 1);
  }
  const base_date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const base_time = `${String(now.getHours()).padStart(2, '0')}00`;

  try {
    const promises = regions.map(async (r) => {
      // apis.data.go.kr requires https to avoid mixed-content in production
      const url = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst?serviceKey=${apiKey}&pageNo=1&numOfRows=1000&dataType=JSON&base_date=${base_date}&base_time=${base_time}&nx=${r.nx}&ny=${r.ny}`;
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.response?.header?.resultCode !== "00") {
        console.error(`Weather API Error for ${r.name}:`, data.response?.header?.resultMsg);
        throw new Error(data.response?.header?.resultMsg);
      }

      const items = data.response?.body?.items?.item || [];
      let temp = "20";
      let pty = "0"; 
      
      for (const item of items) {
        if (item.category === "T1H") temp = item.obsrValue;
        if (item.category === "PTY") pty = item.obsrValue;
      }

      let status = "맑음/흐림";
      let icon = "☁️";
      if (pty === "1" || pty === "5") { status = "비"; icon = "🌧️"; }
      else if (pty === "2" || pty === "6") { status = "비/눈"; icon = "🌨️"; }
      else if (pty === "3" || pty === "7") { status = "눈"; icon = "❄️"; }

      return {
        region: r.name,
        temp: `${temp}°`,
        status,
        icon
      };
    });

    const results = await Promise.all(promises);
    return results;
  } catch (error) {
    console.error("Failed to fetch weather from data.go.kr:", error);
    return [
      { region: "서울", temp: "에러", status: "API 오류", icon: "❌" },
      { region: "인천", temp: "에러", status: "API 오류", icon: "❌" },
      { region: "경기", temp: "에러", status: "API 오류", icon: "❌" }
    ];
  }
}
