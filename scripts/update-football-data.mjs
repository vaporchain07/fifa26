import { mkdir, writeFile } from "node:fs/promises";

const token = process.env.FOOTBALL_DATA_TOKEN;
const baseUrl = "https://api.football-data.org/v4";
const competition = "WC";
const season = 2026;

if (!token) {
  throw new Error("Missing FOOTBALL_DATA_TOKEN environment variable.");
}

async function footballData(path) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { "X-Auth-Token": token }
  });

  if (!response.ok) {
    throw new Error(`${path} failed with HTTP ${response.status}`);
  }

  return response.json();
}

const suffix = `season=${season}`;
const [matches, standings, scorers] = await Promise.all([
  footballData(`/competitions/${competition}/matches?${suffix}`),
  footballData(`/competitions/${competition}/standings?${suffix}`),
  footballData(`/competitions/${competition}/scorers?${suffix}&limit=20`)
]);

const payload = {
  provider: "football-data.org",
  competition,
  season,
  generatedAt: new Date().toISOString(),
  matches: matches.matches || [],
  standings: standings.standings || [],
  scorers: scorers.scorers || []
};

await mkdir("data", { recursive: true });
await writeFile("data/world-cup.json", `${JSON.stringify(payload, null, 2)}\n`);

console.log(`Wrote data/world-cup.json with ${payload.matches.length} matches, ${payload.standings.length} standings groups, and ${payload.scorers.length} scorers.`);
