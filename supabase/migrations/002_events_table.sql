-- Events/Audit Log Table
-- Version: 1.0
-- Date: 2025-01-13

-- ============================================
-- EVENTS (Журнал событий / Аудит)
-- ============================================

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Event type
  type TEXT NOT NULL CHECK (type IN (
    'DEAL_CREATED', 'DEAL_UPDATED', 'DEAL_STATUS_CHANGED',
    'REGISTRY_CREATED', 'REGISTRY_APPROVED', 'REGISTRY_SENT_TO_BANK', 'REGISTRY_EXECUTED',
    'PAYMENT_STATUS_CHANGED',
    'CONTRACTOR_CREATED', 'CONTRACTOR_UPDATED', 'CONTRACTOR_OFFER_ACCEPTED',
    'DOCUMENT_UPLOADED', 'DOCUMENT_VERIFIED'
  )),

  -- Entity reference
  entity_type TEXT NOT NULL CHECK (entity_type IN ('DEAL', 'REGISTRY', 'PAYMENT', 'CONTRACTOR', 'DOCUMENT')),
  entity_id TEXT NOT NULL,

  -- User who performed the action
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL CHECK (user_role IN ('M2_OPERATOR', 'M2_ADMIN', 'DEVELOPER_ADMIN', 'AGENCY_ADMIN', 'CONTRACTOR')),

  -- Event details
  description TEXT NOT NULL,
  metadata JSONB,

  -- Timestamp
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX idx_events_entity ON events(entity_type, entity_id);
CREATE INDEX idx_events_type ON events(type);
CREATE INDEX idx_events_user ON events(user_id);
CREATE INDEX idx_events_timestamp ON events(timestamp DESC);
CREATE INDEX idx_events_lookup ON events(entity_type, entity_id, timestamp DESC);

-- Comment
COMMENT ON TABLE events IS 'Audit log for all significant operations in the system';
