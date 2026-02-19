
export interface DealDetails {
  address: string;
  arv: number;
  squareFootage: number;
  wholesaleFee: number;
  investorMargin: number; // usually 0.70 (70% rule)
}

export interface RehabScenario {
  type: 'Cosmetic' | 'Full Gut';
  costPerSqFt: number;
  totalRehabCost: number;
  maxOffer: number;
  description: string;
}

export interface CalculationResult {
  details: DealDetails;
  scenarios: RehabScenario[];
}

export interface AIAnalysis {
  summary: string;
  rehabTips: string[];
  marketSentiment: string;
  riskAssessment: string;
}
