import fs from 'fs';
import path from 'path';
import FestivalsClient from "@/components/FestivalsClient";

export default function FestivalsPage() {
  const dataPath = path.join(process.cwd(), 'public', 'data', 'pick-info.json');
  const fileContents = fs.readFileSync(dataPath, 'utf8');
  const data = JSON.parse(fileContents);
  const weatherApiKey = process.env.PUBLIC_DATA_API_KEY || "";

  return <FestivalsClient data={data} weatherApiKey={weatherApiKey} />;
}
