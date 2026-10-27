-- 1. Despachos / Firmas (Tenants)
CREATE TABLE IF NOT EXISTS firms (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  commercial_name TEXT,
  legal_name TEXT,
  rfc TEXT,
  bar_association TEXT,
  lead_partner TEXT,
  cedula_profesional TEXT,
  specialty_focus TEXT,
  whatsapp TEXT NOT NULL,
  whatsapp_display TEXT,
  email TEXT,
  clabe TEXT,
  bank TEXT DEFAULT 'Banco Azteca',
  clabe_holder TEXT,
  domain TEXT,
  creator_url TEXT,
  btcpay_pos_url TEXT,
  lightning TEXT,
  theme_primary TEXT DEFAULT '#071A30',
  theme_accent TEXT DEFAULT '#C9A227',
  active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
-- 2. Áreas de Práctica / Servicios Jurídicos & Contables
CREATE TABLE IF NOT EXISTS practice_areas (
  id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  fee_type TEXT NOT NULL,
  base_fee REAL NOT NULL,
  description TEXT,
  weight TEXT,
  badge TEXT,
  icon TEXT,
  retainer_percentage REAL DEFAULT 50.0,
  active INTEGER DEFAULT 1,
  display_order INTEGER DEFAULT 0
);
-- 3. Expedientes / Consultas / Leads Capturados
CREATE TABLE IF NOT EXISTS consultations (
  id TEXT PRIMARY KEY,
  firm_id TEXT NOT NULL REFERENCES firms(id),
  channel TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_email TEXT,
  case_summary TEXT NOT NULL,
  legal_branch TEXT,
  quoted_fee REAL,
  formal_folio TEXT,
  status TEXT DEFAULT 'diagnostico_pendiente',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
-- 4. Mensajes y Auditoría de WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id TEXT PRIMARY KEY,
  firm_id TEXT,
  phone TEXT NOT NULL,
  sender_name TEXT,
  direction TEXT NOT NULL,
  message_text TEXT NOT NULL,
  matched_firm TEXT,
  matched_service TEXT,
  quoted_price REAL,
  status TEXT DEFAULT 'processed',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
-- 5. Eventos y Radar Regulatorio Sentinela
CREATE TABLE IF NOT EXISTS sentinela_events (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  source_url TEXT,
  source_id TEXT,
  channel TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  severity TEXT NOT NULL,
  effective_date TEXT,
  action_required TEXT,
  matched_practice_area TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. Semilla Muestra (Contagram como despacho contable y fiscal)
INSERT OR REPLACE INTO firms (
  id, slug, name, commercial_name, legal_name, rfc, bar_association, lead_partner,
  cedula_profesional, specialty_focus, whatsapp, whatsapp_display, email, clabe, bank, clabe_holder,
  creator_url, btcpay_pos_url, lightning, theme_primary, theme_accent
) VALUES (
  'firm_contagram', 'contagram', 'Contagram — Despacho de Contabilidad', 'Contagram',
  'Contagram México SC', 'CTG200101XYZ', 'Instituto Mexicano de Contadores Públicos', 'C.P. M. Morales',
  'CP-9821453', 'Contabilidad General, SAT, Nómina y Auditoría Financiera', '525657062511',
  '+52 56 5706 2511', 'contacto@contagram.mx', '127180001844721431', 'Banco Azteca', 'Contagram México SC',
  'https://contagram.mx', 'https://btcpay.contagram.mx/pos', 'contagram@blink.sv', '#071A30', '#C9A227'
);
DELETE FROM practice_areas WHERE firm_id = 'firm_contagram';
INSERT OR REPLACE INTO practice_areas (id, firm_id, name, code, fee_type, base_fee, weight, badge, icon, description, display_order)
VALUES
  ('srv_cont_01', 'firm_contagram', 'Contabilidad General y Mensual', 'CONT-01', 'iguala_mensual', 2800.0, 'Mensual · Hasta 60 pólizas', 'BASE · MRR', 'package', 'Registro analítico de pólizas, conciliaciones bancarias, balanza de comprobación y estados financieros mensuales. Certidumbre y orden estricto en cada balance.', 1),
  ('srv_cont_02', 'firm_contagram', 'Declaraciones Fiscales y Cumplimiento', 'SAT-02', 'cuota_fija', 3500.0, 'Declaración mensual o anual', 'OBLIGATORIO', 'layers', 'Cálculo exacto de impuestos (ISR, IVA, retenciones, DIOT) y atención inmediata a requerimientos del SAT para mantener tu opinión de cumplimiento positiva.', 2),
  ('srv_cont_03', 'firm_contagram', 'Nómina y Seguridad Social', 'NOM-03', 'iguala_mensual', 1950.0, 'Quincenal · Hasta 10 colaboradores', 'OPERATIVO', 'box', 'Timbrado de CFDI de nómina, dispersión, cálculo de finiquitos y gestión integral de altas, bajas y modificaciones ante el IMSS e INFONAVIT.', 3),
  ('srv_cont_04', 'firm_contagram', 'Auditoría y Diagnóstico Financiero', 'AUD-04', 'cuota_fija', 8500.0, 'Por dictamen / proyecto', 'PREMIUM', 'cuboid', 'Revisión profunda de control interno, auditoría de CFDI emitidos vs recibidos, prevención de discrepancia fiscal y análisis de riesgos tributarios.', 4);

-- 7. Semilla Muestra (Valenzuela & Asociados como despacho jurídico / corporativo)
INSERT OR REPLACE INTO firms (
  id, slug, name, commercial_name, rfc, bar_association, lead_partner,
  cedula_profesional, specialty_focus, whatsapp, clabe, bank, clabe_holder, theme_primary, theme_accent
) VALUES (
  'firm_valenzuela', 'valenzuela', 'VALENZUELA & ASOCIADOS · Abogados Corporativos', 'Valenzuela & Asoc.',
  'VLA190412AB1', 'Barra Mexicana, Colegio de Abogados', 'Lic. Roberto Valenzuela',
  'CED-4820194', 'Litigio Mercantil, Contratos & Blindaje Patrimonial', '525541691234',
  '014180098765432109', 'Santander', 'Valenzuela Consultores Jurídicos SC', '#100F0D', '#C9A664'
);
INSERT OR REPLACE INTO practice_areas (id, firm_id, name, fee_type, base_fee, description, display_order)
VALUES
  ('srv_val_01', 'firm_valenzuela', 'Blindaje y Auditoría de Contratos Mercantiles', 'cuota_fija', 3500.0, 'Revisión preventiva de cláusulas leoninas, garantías y penas convencionales.', 1),
  ('srv_val_02', 'firm_valenzuela', 'Defensa en Litigio y Cobranza Judicial', 'consulta_inicial', 2500.0, 'Estrategia procesal para recuperación de cartera y mediación mercantil.', 2),
  ('srv_val_03', 'firm_valenzuela', 'Gobierno Corporativo y Asambleas de Accionistas', 'cuota_fija', 7500.0, 'Formalización notarial de libros corporativos, fusiones y poderes.', 3);

-- 8. Semilla Muestra: AUREUS VIGIL (Guardia Legal Permanente · Penal y Amparo)
INSERT OR REPLACE INTO firms (
  id, slug, name, commercial_name, legal_name, rfc, bar_association, lead_partner,
  cedula_profesional, specialty_focus, whatsapp, whatsapp_display, email, clabe, bank, clabe_holder,
  creator_url, lightning, theme_primary, theme_accent
) VALUES (
  'firm_vigil', 'vigil', 'AUREUS VIGIL · Guardia Legal Permanente', 'AUREUS VIGIL',
  'Defensa Penal Inmediata SC', 'DPI210815AB9', 'Barra Mexicana de Abogados Penalistas', 'Lic. Marco Valenzuela',
  'PEN-5819024', 'Urgencias Penales 24/7, Ministerio Público y Amparo contra Detención', '525541691234',
  '+52 55 4169 1234', 'guardia@aureusvigil.mx', '012180001234567890', 'BBVA México', 'Defensa Penal Inmediata SC',
  'https://aureusvigil.mx', 'vigil@blink.sv', '#0F0D0A', '#E89F4C'
);
DELETE FROM practice_areas WHERE firm_id = 'firm_vigil';
INSERT OR REPLACE INTO practice_areas (id, firm_id, name, code, fee_type, base_fee, weight, badge, icon, description, display_order)
VALUES
  ('srv_vigil_01', 'firm_vigil', 'Despliegue Inmediato ante MP / Sede Ministerial', 'PEN-01', 'cuota_fija', 9500.0, 'Despliegue nocturno < 8 min · CDMX y Zona Metro', 'URGENCIA INMEDIATA', 'lucerna', 'Custodio presencial en agencia del Ministerio Público. Garantía de comunicación con defensor, certificación médica y tutela inmediata de derechos constitucionales.', 1),
  ('srv_vigil_02', 'firm_vigil', 'Demanda de Amparo Urgente y Suspensión de Plano', 'AMP-02', 'cuota_fija', 18500.0, 'Juzgado de Distrito de Guardia · Turno 24/7', 'CÓDICE PROBATORIO', 'scroll', 'Redacción y presentación inmediata de demanda de amparo indirecto contra incomunicación, tortura, retención ilegal o extradición con fe ministerial.', 2),
  ('srv_vigil_03', 'firm_vigil', 'Triage de Crisis Penal y Defensa en Audiencia Inicial', 'AUD-03', 'cuota_fija', 25000.0, 'Audiencia de Control de Detención', 'DEFENSA INTEGRAL', 'shield', 'Defensa técnica ante Juez de Control para debatir legalidad de la detención, imputación y solicitud de medidas cautelares no privativas de la libertad.', 3);

-- Semilla de Alertas Regulatorias Sentinela
INSERT OR REPLACE INTO sentinela_events (id, source, source_url, channel, title, summary, severity, effective_date, action_required, matched_practice_area)
VALUES
  ('sen_sat_01', 'SAT', 'https://sat.gob.mx/normatividad', 'fiscal', 'Restricción Masiva de Certificados de Sello Digital (CSD) por discrepancias en Buzón Tributario', 'El SAT intensificó la cancelación temporal de sellos a contribuyentes con diferencias en retenciones de nómina vs CFDI emitidos.', 'CRITICAL', 'Inmediata', 'Auditoría urgente de CFDI y aclaración en buzón para evitar parálisis de facturación.', 'srv_cont_01'),
  ('sen_dof_02', 'DOF', 'https://dof.gob.mx', 'fiscal', 'Publicación del Anexo 1-A de la RMF: Nuevas validaciones en opiniones de cumplimiento 32-D', 'Nuevos requisitos estrictos en declaraciones complementarias para licitaciones y contratos públicos con dependencias federales.', 'HIGH', 'Próximo mes', 'Regularización inmediata de ejercicios 2024 y 2025 para mantener constancia 32-D positiva.', 'srv_cont_01'),
  ('sen_banxico_03', 'BANXICO', 'https://banxico.org.mx/disposiciones', 'fintech_banca', 'Circular 14/2026: Trazabilidad reforzada en transferencias SPEI empresariales de alto valor', 'Obligación para personas morales de registrar RFC verificado del beneficiario final en pagos superiores a $100,000 MXN.', 'MEDIUM', '2026-11-01', 'Actualización de layout bancario empresarial y conciliación contable de transferencias.', 'srv_cont_02'),
  ('sen_cnbv_04', 'CNBV', 'https://gob.mx/cnbv', 'fintech_banca', 'Revisión trimestral de cumplimiento PLD/FT y manuales de prevención de operaciones ilícitas', 'Requerimiento de auditoría externa a despachos y sujetos obligados con actividades vulnerables.', 'HIGH', '2026-11-15', 'Elaboración y actualización del expediente de identificación de clientes y dictamen anual.', 'srv_cont_03'),
  ('sen_condusef_05', 'CONDUSEF', 'https://condusef.gob.mx/redeco', 'cobranza', 'Actualización al Registro de Despachos de Cobranza (REDECO) y sanciones por gestión no registrada', 'Multas de hasta 2,000 UMAS por realizar gestiones de cobro sin registro previo del apoderado o intermediario.', 'MEDIUM', '2026-10-30', 'Validación de contratos mercantiles y registro formal de cobranza supervisada.', 'srv_cont_03');
