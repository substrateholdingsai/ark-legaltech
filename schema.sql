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
  email TEXT,
  clabe TEXT,
  bank TEXT DEFAULT 'BBVA',
  clabe_holder TEXT,
  domain TEXT,
  theme_primary TEXT DEFAULT '#0A192F',
  theme_accent TEXT DEFAULT '#D4AF37',
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

-- 6. Semilla Muestra (Contagram como despacho fiscal)
INSERT OR REPLACE INTO firms (
  id, slug, name, commercial_name, rfc, bar_association, lead_partner,
  cedula_profesional, specialty_focus, whatsapp, clabe, bank, clabe_holder, theme_primary, theme_accent
) VALUES (
  'firm_contagram', 'contagram', 'CONTAGRAM · Asesoría Contable & Fiscal', 'Contagram',
  'CTG200101XYZ', 'Instituto Mexicano de Contadores Públicos', 'C.P. M. Morales',
  'CP-9821453', 'Contabilidad PyME, SAT & Balanza Mensual', '525657062511',
  '012180012345678901', 'BBVA', 'Contagram México SC', '#0A192F', '#D4AF37'
);
INSERT OR REPLACE INTO practice_areas (id, firm_id, name, fee_type, base_fee, description, display_order)
VALUES
  ('srv_cont_01', 'firm_contagram', 'Diagnóstico y Regularización Fiscal SAT', 'consulta_inicial', 1800.0, 'Revisión integral de buzón tributario y opiniones de cumplimiento 32-D.', 1),
  ('srv_cont_02', 'firm_contagram', 'Contabilidad General y Balanza Mensual', 'iguala_mensual', 2800.0, 'Pólizas, cálculo de IVA/ISR, DIOT y timbrado de nómina hasta 10 colaboradores.', 2),
  ('srv_cont_03', 'firm_contagram', 'Defensa y Aclaración de Requerimientos', 'cuota_fija', 4500.0, 'Atención jurídica a multas y embargos de cuentas ante el SAT e IMSS.', 3);

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

-- Semilla de Alertas Regulatorias Sentinela
INSERT OR REPLACE INTO sentinela_events (id, source, source_url, channel, title, summary, severity, effective_date, action_required, matched_practice_area)
VALUES
  ('sen_sat_01', 'SAT', 'https://sat.gob.mx/normatividad', 'fiscal', 'Restricción Masiva de Certificados de Sello Digital (CSD) por discrepancias en Buzón Tributario', 'El SAT intensificó la cancelación temporal de sellos a contribuyentes con diferencias en retenciones de nómina vs CFDI emitidos.', 'CRITICAL', 'Inmediata', 'Auditoría urgente de CFDI y aclaración en buzón para evitar parálisis de facturación.', 'srv_cont_01'),
  ('sen_dof_02', 'DOF', 'https://dof.gob.mx', 'fiscal', 'Publicación del Anexo 1-A de la RMF: Nuevas validaciones en opiniones de cumplimiento 32-D', 'Nuevos requisitos estrictos en declaraciones complementarias para licitaciones y contratos públicos con dependencias federales.', 'HIGH', 'Próximo mes', 'Regularización inmediata de ejercicios 2024 y 2025 para mantener constancia 32-D positiva.', 'srv_cont_01'),
  ('sen_banxico_03', 'BANXICO', 'https://banxico.org.mx/disposiciones', 'fintech_banca', 'Circular 14/2026: Trazabilidad reforzada en transferencias SPEI empresariales de alto valor', 'Obligación para personas morales de registrar RFC verificado del beneficiario final en pagos superiores a $100,000 MXN.', 'MEDIUM', '2026-11-01', 'Actualización de layout bancario empresarial y conciliación contable de transferencias.', 'srv_cont_02'),
  ('sen_cnbv_04', 'CNBV', 'https://gob.mx/cnbv', 'fintech_banca', 'Revisión trimestral de cumplimiento PLD/FT y manuales de prevención de operaciones ilícitas', 'Requerimiento de auditoría externa a despachos y sujetos obligados con actividades vulnerables.', 'HIGH', '2026-11-15', 'Elaboración y actualización del expediente de identificación de clientes y dictamen anual.', 'srv_cont_03'),
  ('sen_condusef_05', 'CONDUSEF', 'https://condusef.gob.mx/redeco', 'cobranza', 'Actualización al Registro de Despachos de Cobranza (REDECO) y sanciones por gestión no registrada', 'Multas de hasta 2,000 UMAS por realizar gestiones de cobro sin registro previo del apoderado o intermediario.', 'MEDIUM', '2026-10-30', 'Validación de contratos mercantiles y registro formal de cobranza supervisada.', 'srv_cont_03');
