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

export const CONTAGRAM_ISFAHAN_NOX_TOKENS: AureusColorTokens = {
  bgPrimary: '#040F1D',       // lapis-950 (fondo abisal)
  bgCanvas: '#071A30',        // lapis-900 (superficie primaria)
  bgSurface: '#0C2440',       // lapis-800 (tarjetas, libro mayor)
  borderLine: '#143353',      // lapis-700 (filetes estructurales)
  textPrimary: '#FBF9F4',     // chalk-50 (cal cálida)
  textSecondary: '#DCE6F2',   // lapis-100 (texto secundario)
  textMuted: '#8FAAC6',       // lapis-300 (datos mono, ejes)
  accent500: '#C9A227',       // gold-500 (oro acento)
  accent400: '#D4AF37',       // gold-400 (hover)
  accentForeground: '#040F1D',// lapis-950 (WCAG 2.2 AAA verificado 7.7:1)
  sealPorphyry: '#7E6114',    // gold-700
  riskTerracotta: '#CC766C',
  pendingBronze: '#D4AF37',
  approvedOlive: '#2E7D6F',   // lcd contagram
  agentSteel: '#35608A',      // lapis-500
};

export const CONTAGRAM_ISFAHAN_MARMORA_TOKENS: AureusColorTokens = {
  bgPrimary: '#FBF9F4',       // chalk-50
  bgCanvas: '#F4F0E6',        // chalk-100
  bgSurface: '#FFFFFF',
  borderLine: '#E8E2D4',      // chalk-200
  textPrimary: '#040F1D',     // lapis-950
  textSecondary: '#143353',   // lapis-700
  textMuted: '#35608A',       // lapis-500
  accent500: '#7E6114',       // gold-700
  accent400: '#C9A227',       // gold-500
  accentForeground: '#FBF9F4',// chalk-50
  sealPorphyry: '#0C2440',
  riskTerracotta: '#A84B42',
  pendingBronze: '#7E6114',
  approvedOlive: '#2E7D6F',
  agentSteel: '#1F476F',
};

export const VIGIL_NOX_TOKENS: AureusColorTokens = {
  bgPrimary: '#0F0D0A',
  bgCanvas: '#15120F',
  bgSurface: '#1E1A15',
  borderLine: '#2D2720',
  textPrimary: '#FAF6EE',
  textSecondary: '#C4BAAA',
  textMuted: '#8E8373',
  accent500: '#E89F4C',       // signal-lucerna (ámbar de señalización romana)
  accent400: '#F2AE62',
  accentForeground: '#14110D',// texto oscuro WCAG AAA (7.8:1)
  sealPorphyry: '#8B4A5A',    // púrpura porfídica
  riskTerracotta: '#CC766C',  // reservado exclusivamente para estado penal crítico
  pendingBronze: '#E89F4C',
  approvedOlive: '#7E9A6E',
  agentSteel: '#8AAEC4',      // acero luminoso para triage y protocolo
};

export const VIGIL_MARMORA_TOKENS: AureusColorTokens = {
  bgPrimary: '#FAF6EE',       // pergamino luminoso para legibilidad bajo estrés
  bgCanvas: '#F3EDE1',
  bgSurface: '#FFFFFF',
  borderLine: '#DCD4C4',
  textPrimary: '#0F0D0A',     // tinta casi negra
  textSecondary: '#3E362C',
  textMuted: '#685D4E',
  accent500: '#B8742A',       // ámbar oscuro para modo claro
  accent400: '#D48937',
  accentForeground: '#FAF6EE',
  sealPorphyry: '#8B4A5A',    // franja de guardia permanente
  riskTerracotta: '#A84B42',
  pendingBronze: '#B8742A',
  approvedOlive: '#3F6B45',
  agentSteel: '#4C7A99',
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
    `--aureus-font-mono: "IBM Plex Mono", "JetBrains Mono", ui-monospace, monospace;`,
  ].join('\n  ');
}

export function resolveAureusTheme(
  firm?: Partial<Firm> | null,
  mode: 'nox' | 'marmora' = 'nox'
): AureusThemeConfig {
  if (firm?.slug === 'contagram') {
    const isfahan = mode === 'marmora' ? CONTAGRAM_ISFAHAN_MARMORA_TOKENS : CONTAGRAM_ISFAHAN_NOX_TOKENS;
    return {
      mode,
      tokens: isfahan,
      cssVariables: `:root {\n  ${tokensToCssVariables(isfahan)}\n  --contagram-pattern: url("/assets/contagram/girih-seamless.svg");\n}`,
      isCustomized: true,
    };
  }

  if (firm?.slug === 'vigil') {
    const vigil = mode === 'marmora' ? VIGIL_MARMORA_TOKENS : VIGIL_NOX_TOKENS;
    return {
      mode,
      tokens: vigil,
      cssVariables: `:root {\n  ${tokensToCssVariables(vigil)}\n  --signal-lucerna: ${vigil.accent500};\n  --urgency-stripe: #8B4A5A;\n}`,
      isCustomized: true,
    };
  }

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
