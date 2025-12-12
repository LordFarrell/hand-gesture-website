export type PlanetId =
  | "sun"
  | "mercury"
  | "venus"
  | "earth"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune";

export type Planet = {
  id: PlanetId;
  name: string;
  subtitle: string;
  color: string;
  accent: string;
  // Visual scale (not physical).
  radius: number;
  orbitRadius: number;
  orbitSpeed: number; // radians/sec
  axialTiltDeg: number;
  dayLengthHours: number;
  yearLengthDays: number;
  meanTempC: number;
  moons: number;
  facts: string[];
};

export const PLANETS: Planet[] = [
  {
    id: "sun",
    name: "Sun",
    subtitle: "G‑type main-sequence star",
    color: "#ffdd8a",
    accent: "#ffb55e",
    radius: 2.15,
    orbitRadius: 0,
    orbitSpeed: 0,
    axialTiltDeg: 7.25,
    dayLengthHours: 609.12,
    yearLengthDays: 0,
    meanTempC: 5505,
    moons: 0,
    facts: [
      "Holds ~99.86% of the Solar System’s mass.",
      "Its corona reaches millions of °C.",
      "Light takes ~8 minutes to reach Earth."
    ]
  },
  {
    id: "mercury",
    name: "Mercury",
    subtitle: "Smallest planet, fastest orbit",
    color: "#9aa3ad",
    accent: "#cbd3dc",
    radius: 0.24,
    orbitRadius: 4.2,
    orbitSpeed: 0.85,
    axialTiltDeg: 0.03,
    dayLengthHours: 1407.6,
    yearLengthDays: 88,
    meanTempC: 167,
    moons: 0,
    facts: [
      "Extreme temperature swings (no thick atmosphere).",
      "A day is longer than its year (solar day).",
      "Closest planet to the Sun."
    ]
  },
  {
    id: "venus",
    name: "Venus",
    subtitle: "Runaway greenhouse world",
    color: "#d5c18f",
    accent: "#ffd38a",
    radius: 0.61,
    orbitRadius: 6.2,
    orbitSpeed: 0.62,
    axialTiltDeg: 177.4,
    dayLengthHours: 5832.5,
    yearLengthDays: 224.7,
    meanTempC: 464,
    moons: 0,
    facts: [
      "Hottest planet due to dense CO₂ atmosphere.",
      "Rotates backwards (retrograde).",
      "Surface pressure ~92× Earth’s."
    ]
  },
  {
    id: "earth",
    name: "Earth",
    subtitle: "Liquid water + life",
    color: "#6aa9ff",
    accent: "#7cf7ff",
    radius: 0.64,
    orbitRadius: 8.4,
    orbitSpeed: 0.52,
    axialTiltDeg: 23.44,
    dayLengthHours: 23.93,
    yearLengthDays: 365.25,
    meanTempC: 15,
    moons: 1,
    facts: [
      "Only known world with life.",
      "71% of the surface is ocean.",
      "A protective magnetosphere deflects solar wind."
    ]
  },
  {
    id: "mars",
    name: "Mars",
    subtitle: "The red planet",
    color: "#ff6a4a",
    accent: "#ffb3a3",
    radius: 0.34,
    orbitRadius: 10.8,
    orbitSpeed: 0.42,
    axialTiltDeg: 25.19,
    dayLengthHours: 24.62,
    yearLengthDays: 687,
    meanTempC: -63,
    moons: 2,
    facts: [
      "Home to Olympus Mons, the tallest volcano known.",
      "Evidence suggests ancient rivers and lakes.",
      "Thin atmosphere: mostly CO₂."
    ]
  },
  {
    id: "jupiter",
    name: "Jupiter",
    subtitle: "Gas giant, Great Red Spot",
    color: "#f4c9a2",
    accent: "#ffdbb8",
    radius: 1.35,
    orbitRadius: 15.8,
    orbitSpeed: 0.24,
    axialTiltDeg: 3.13,
    dayLengthHours: 9.93,
    yearLengthDays: 4331,
    meanTempC: -110,
    moons: 95,
    facts: [
      "Largest planet; strong gravity shapes the Solar System.",
      "Great Red Spot is a massive storm.",
      "Has faint rings."
    ]
  },
  {
    id: "saturn",
    name: "Saturn",
    subtitle: "Iconic ring system",
    color: "#f8e0a2",
    accent: "#ffeaa7",
    radius: 1.15,
    orbitRadius: 20.9,
    orbitSpeed: 0.18,
    axialTiltDeg: 26.73,
    dayLengthHours: 10.7,
    yearLengthDays: 10747,
    meanTempC: -140,
    moons: 146,
    facts: [
      "Rings are mostly ice and rock.",
      "Low density: would float in a huge ocean.",
      "Titan has a thick atmosphere and methane lakes."
    ]
  },
  {
    id: "uranus",
    name: "Uranus",
    subtitle: "Ice giant on its side",
    color: "#9ff7ff",
    accent: "#bffbff",
    radius: 0.95,
    orbitRadius: 26.2,
    orbitSpeed: 0.12,
    axialTiltDeg: 97.77,
    dayLengthHours: 17.2,
    yearLengthDays: 30589,
    meanTempC: -195,
    moons: 27,
    facts: [
      "Extreme axial tilt: seasons last decades.",
      "Blue-green from methane in the atmosphere.",
      "Has faint rings."
    ]
  },
  {
    id: "neptune",
    name: "Neptune",
    subtitle: "Winds and deep blue",
    color: "#4d79ff",
    accent: "#7aa0ff",
    radius: 0.93,
    orbitRadius: 31.0,
    orbitSpeed: 0.095,
    axialTiltDeg: 28.32,
    dayLengthHours: 16.1,
    yearLengthDays: 59800,
    meanTempC: -200,
    moons: 14,
    facts: [
      "Fastest winds in the Solar System.",
      "Discovered mathematically before being seen.",
      "Triton orbits retrograde and may be a captured Kuiper object."
    ]
  }
];

export function getPlanet(id: PlanetId): Planet {
  const p = PLANETS.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown planet id: ${id}`);
  return p;
}


