// ============================================================
// TravelCRM — Shared Constants
// ============================================================
// Single source of truth for status transitions and other
// constants used across frontend components.
// ============================================================

export const TRANSITIONS: Record<string, string[]> = {
  new:           ['quoted', 'negotiation', 'confirmed', 'lost', 'invalid'],
  quoted:        ['negotiation', 'confirmed', 'lost', 'invalid', 'new'],
  negotiation:   ['quoted', 'confirmed', 'lost', 'invalid', 'new'],
  confirmed:     ['in_progress', 'completed', 'lost'],
  in_progress:   ['completed', 'lost'],
  completed:     [],
  lost:          ['new', 'quoted'],
  invalid:       ['new'],
};

export const STATUS_LABELS: Record<string, string> = {
  new: 'New',
  quoted: 'Quoted',
  negotiation: 'Negotiation',
  confirmed: 'Confirmed',
  in_progress: 'In Progress',
  completed: 'Completed',
  lost: 'Lost',
  invalid: 'Invalid',
};

export const LEAD_SOURCES = [
  { value: 'website', label: 'Website' },
  { value: 'call', label: 'Phone Call' },
  { value: 'walkin', label: 'Walk-in' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'facebook', label: 'Facebook/Instagram' },
  { value: 'google', label: 'Google Ads' },
  { value: 'reference', label: 'Reference' },
  { value: 'agent', label: 'Agent' },
] as const;
