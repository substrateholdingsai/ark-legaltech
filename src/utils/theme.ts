import type { AureusColorTokens, AureusThemeConfig, Firm } from '../types/env';

export const AUREUS_NOX_TOKENS: AureusColorTokens = {
  bgPrimary: '#100F0D',
  bgCanvas: '#171512',
  bgSurface: '#211E1A',
  borderLine: '#3B342B',
  textPrimary: '#F3ECDF',
  textSecondary: '#B8AE9E',
  textMuted: '#9A9185',
  accent500: '#C9A664',
  accent400: '#DCBD85',
  accentForeground: '#14110D',
  sealPorphyry: '#8B4A5A',
  riskTerracotta: '#CC766C',
  pendingBronze: '#C98A3D',
  approvedOlive: '#7E9A6E',
  agentSteel: '#6E8FA3',
};

export const AUREUS_MARMORA_TOKENS: AureusColorTokens = {
  bgPrimary: '#F8F3E9',
  bgCanvas: '#F1E9DB',
  bgSurface: '#FFFDF8',
  borderLine: '#D8CBB6',
  textPrimary: '#15120F',
  textSecondary: '#4E463C',
  textMuted: '#6B6156',
  accent500: '#6F4F22',
  accent400: '#825F2A',
  accentForeground: '#FFFDF8',
  sealPorphyry: '#8B4A5A',
  riskTerracotta: '#A84B42',
  pendingBronze: '#8A5A1C',
  approvedOlive: '#3F6B45',
  agentSteel: '#2F5D7C',
};

export function tokensToCssVariables(tokens: AureusColorTokens): string {
  return [
    `--aureus-bg-primary: ${tokens.bgPrimary};`,
    `--aureus-bg-canvas: ${tokens.bgCanvas};`,
    `--aureus-bg-surface: ${tokens.bgSurface};`,
    `--aureus-border-line: ${tokens.borderLine};`,
    `--aureus-text-primary: ${tokens.textPrimary};`,
    `--aureus-text-secondary: ${tokens.textSecondary};`,
    `--aureus-text-muted: ${tokens.textMuted};`,
    `--aureus-accent-500: ${tokens.accent500};`,
    `--aureus-accent-400: ${tokens.accent400};`,
    `--aureus-accent-foreground: ${tokens.accentForeground};`,
    `--aureus-seal: ${tokens.sealPorphyry};`,
    `--aureus-risk: ${tokens.riskTerracotta};`,
    `--aureus-pending: ${tokens.pendingBronze};`,
    `--aureus-approved: ${tokens.approvedOlive};`,
    `--aureus-agent: ${tokens.agentSteel};`,
    `--aureus-font-display: "Cormorant Garamond", "EB Garamond", Georgia, serif;`,
    `--aureus-font-body: Inter, Helvetica, Arial, sans-serif;`,
    `--aureus-font-mono: "JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace;`,
  ].join('\n  ');
}

export function resolveAureusTheme(
  firm?: Partial<Firm> | null,
  mode: 'nox' | 'marmora' = 'nox'
): AureusThemeConfig {
  const baseTokens = mode === 'marmora' ? AUREUS_MARMORA_TOKENS : AUREUS_NOX_TOKENS;
  const tokens = { ...baseTokens };
  let isCustomized = false;

  if (firm?.theme_primary) {
    tokens.bgSurface = firm.theme_primary;
    isCustomized = true;
  }

  if (firm?.theme_accent) {
    tokens.accent500 = firm.theme_accent;
    isCustomized = true;
  }

  const cssVariables = `:root {\n  ${tokensToCssVariables(tokens)}\n}`;

  return {
    mode,
    tokens,
    cssVariables,
    isCustomized,
  };
}
