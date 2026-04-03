// ===== Form Input =====

export const CATEGORY_OPTIONS = [
  'Sales & Revenue Intelligence',
  'Marketing Automation & Analytics',
  'Product Management',
  'Customer Success & Support',
  'Developer Tools & DevOps',
  'Security & Compliance',
  'HR & People Ops',
  'Data & Analytics',
  'Collaboration & Productivity',
  'Finance & Billing',
  'Other',
] as const;

export const COMPANY_SIZE_OPTIONS = [
  'Startup (1-50)',
  'SMB (51-200)',
  'Mid-market (201-1000)',
  'Enterprise (1001-5000)',
  'Large Enterprise (5000+)',
  'Multiple segments',
] as const;

export interface FormInput {
  // Section 1: Your product (shared)
  productName: string;
  productDescription: string;
  productCategory: string;
  targetAudience: string;
  companySize: string;
  competitors: string;
  pricingModel?: string;

  // Section 2: A/B split — Message A
  headlineA: string;
  supportingCopyA?: string;
  approachLabelA?: string;

  // Section 2: A/B split — Message B
  headlineB: string;
  supportingCopyB?: string;
  approachLabelB?: string;

  // Section 3: Your info
  email: string;
  name?: string;
}

// ===== Job Status & Pipeline =====

export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed';

export type PipelineStage =
  | 'seed_doc_generation'
  | 'graph_building'
  | 'env_setup_a'
  | 'simulation_a'
  | 'report_a'
  | 'env_setup_b'
  | 'simulation_b'
  | 'report_b'
  | 'parsing_results'
  | 'complete';

export const STAGE_LABELS: Record<PipelineStage, string> = {
  seed_doc_generation: 'Preparing market context',
  graph_building: 'Building knowledge graph',
  env_setup_a: 'Creating buyer personas (A)',
  simulation_a: 'Simulating market reaction (A)',
  report_a: 'Analyzing results (A)',
  env_setup_b: 'Creating buyer personas (B)',
  simulation_b: 'Simulating market reaction (B)',
  report_b: 'Analyzing results (B)',
  parsing_results: 'Comparing A vs B',
  complete: 'Done!',
};

// ===== Parsed Results =====

export interface AdoptionSignal {
  persona: string;
  intent: 'strong' | 'moderate' | 'weak' | 'none';
  firstMentionRound: number;
  reasoning: string;
}

export interface Objection {
  category: string;
  description: string;
  frequency: number;
  severity: 'blocking' | 'concern' | 'minor';
}

export interface SentimentOverTime {
  round: number;
  positive: number;
  neutral: number;
  negative: number;
}

export interface WordOfMouth {
  shares: number;
  recommendations: number;
  warnings: number;
}

export interface AgentQuote {
  agentName: string;
  agentRole: string;
  quote: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface EmailEngagement {
  opens: number;
  clicks: number;
}

export interface ParsedResults {
  adoptionSignals: AdoptionSignal[];
  objections: Objection[];
  sentimentOverTime: SentimentOverTime[];
  wordOfMouth: WordOfMouth;
  dominantNarrative: string;
  agentQuotes: AgentQuote[];
  emailEngagement: EmailEngagement;
}

// ===== Comparison Result =====

export interface ComparisonMetric {
  metric: string;
  countA: number;
  countB: number;
  multiplier: number;
  winner: 'A' | 'B' | 'tie';
  label: string;
}

export interface TierBreakdown {
  tier: string;
  totalAgents: number;
  engagedA: number;
  engagedB: number;
}

export interface ComparisonResult {
  winner: 'A' | 'B' | 'tie';
  winnerLabel: string;
  confidence: 'high' | 'medium' | 'low';
  summary: string;
  metrics: ComparisonMetric[];
  tierBreakdown: TierBreakdown[];
  keyInsight: string;
  recommendation: string;
}

// ===== Status Response =====

export interface StageProgress {
  stage: PipelineStage;
  label: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  duration?: number;
}

export interface StatusResponse {
  jobId: string;
  status: JobStatus;
  currentStage: PipelineStage | null;
  createdAt: string;
  estimatedCompletion: string;
  stageProgress: StageProgress[];
}

// ===== Results Response =====

export interface ResultsResponse {
  jobId: string;
  formInput: FormInput;
  resultsA: ParsedResults;
  resultsB: ParsedResults;
  comparison: ComparisonResult;
}
