export interface Firm {
  id: string;
  slug: string;
  name: string;
  commercial_name: string | null;
  legal_name: string | null;
  rfc: string | null;
  bar_association: string | null;
  lead_partner: string | null;
  cedula_profesional: string | null;
  specialty_focus: string | null;
  whatsapp: string;
  whatsapp_display?: string | null;
  email: string | null;
  clabe: string | null;
  bank: string | null;
  clabe_holder: string | null;
  domain: string | null;
  creator_url?: string | null;
  btcpay_pos_url?: string | null;
  lightning?: string | null;
  theme_primary: string | null;
  theme_accent: string | null;
  active: number;
  created_at: string;
  updated_at: string;
}

export interface PracticeArea {
  id: string;
  firm_id: string;
  name: string;
  code: string | null;
  fee_type: string;
  base_fee: number;
  description: string | null;
  weight?: string | null;
  badge?: string | null;
  icon?: string | null;
  retainer_percentage: number | null;
  active: number;
  display_order: number;
}

export interface Consultation {
  id: string;
  firm_id: string;
  channel: string;
  client_name: string;
  client_phone: string;
  client_email: string | null;
  case_summary: string;
  legal_branch: string | null;
  quoted_fee: number | null;
  formal_folio: string | null;
  status: string;
  created_at: string;
}

export interface WhatsappMessage {
  id: string;
  firm_id: string | null;
  phone: string;
  sender_name: string | null;
  direction: 'inbound' | 'outbound';
  message_text: string;
  matched_firm: string | null;
  matched_service: string | null;
  quoted_price: number | null;
  status: string;
  created_at: string;
}

export interface SentinelaEvent {
  id: string;
  source: 'DOF' | 'SAT' | 'CONDUSEF' | 'CNBV' | 'BANXICO';
  source_url?: string | null;
  source_id?: string | null;
  channel: 'fiscal' | 'cobranza' | 'fintech_banca' | 'laboral';
  title: string;
  summary: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  effective_date?: string | null;
  action_required?: string | null;
  matched_practice_area?: string | null;
  created_at: string;
}

export interface AureusColorTokens {
  bgPrimary: string;
  bgCanvas: string;
  bgSurface: string;
  borderLine: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent500: string;
  accent400: string;
  accentForeground: string;
  sealPorphyry: string;
  riskTerracotta: string;
  pendingBronze: string;
  approvedOlive: string;
  agentSteel: string;
}

export interface AureusThemeConfig {
  mode: 'nox' | 'marmora';
  tokens: AureusColorTokens;
  cssVariables: string;
  isCustomized: boolean;
}

export interface TenantContext {
  firm: Firm;
  practiceAreas: PracticeArea[];
  branding: AureusThemeConfig;
  resolvedBy: 'header' | 'query' | 'subdomain' | 'custom_domain' | 'default';
}

export interface TriageResult {
  legal_branch: string;
  summary: string;
  matched_service: string | null;
  service_name?: string | null;
  quoted_fee: number | null;
  formal_folio: string;
  privacy_notice: string;
  lead_partner?: string | null;
  cedula_profesional?: string | null;
  bank?: string | null;
  clabe?: string | null;
  whatsapp_url?: string;
  whatsapp_number?: string;
  client_name?: string;
}

export interface Env {
  DB: D1Database;
  CACHE: KVNamespace;
  SESSION: KVNamespace;
  AI: Ai;
  ASSETS?: Fetcher;
  SITE_NAME: string;
  SITE_URL: string;
  WHATSAPP_NUMBER: string;
  WHATSAPP_VERIFY_TOKEN: string;
  DEFAULT_BANK: string;
  DEFAULT_CLABE: string;
}
