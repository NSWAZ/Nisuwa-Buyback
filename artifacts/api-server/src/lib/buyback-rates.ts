export interface BuybackRateConfig {
  groupName: string;
  rate: number;
}

export const DEFAULT_BUYBACK_RATE = 0.9;

export const BUYBACK_RATES: BuybackRateConfig[] = [
  { groupName: "Minerals", rate: 0.90 },
  { groupName: "Ore", rate: 0.85 },
  { groupName: "Ice Product", rate: 0.85 },
  { groupName: "Ice", rate: 0.80 },
  { groupName: "Moon Materials", rate: 0.85 },
  { groupName: "Moon Ore", rate: 0.80 },
  { groupName: "Planetary Materials", rate: 0.85 },
  { groupName: "Salvage Materials", rate: 0.85 },
  { groupName: "Gas", rate: 0.80 },
  { groupName: "Datacores", rate: 0.80 },
  { groupName: "Ship Equipment", rate: 0.70 },
  { groupName: "Drone", rate: 0.70 },
  { groupName: "Ammunition & Charges", rate: 0.70 },
  { groupName: "Blueprint", rate: 0.50 },
  { groupName: "Ship", rate: 0.65 },
  { groupName: "Deployable", rate: 0.65 },
  { groupName: "Structure", rate: 0.60 },
  { groupName: "Implant & Booster", rate: 0.75 },
  { groupName: "Commodity", rate: 0.85 },
  { groupName: "Abyssal Materials", rate: 0.80 },
  { groupName: "Triglavian", rate: 0.75 },
];

export function getBuybackRate(marketGroupName: string): number {
  const lower = marketGroupName.toLowerCase();
  for (const entry of BUYBACK_RATES) {
    if (lower.includes(entry.groupName.toLowerCase())) {
      return entry.rate;
    }
  }
  return DEFAULT_BUYBACK_RATE;
}
