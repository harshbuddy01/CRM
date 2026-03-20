// ============================================================
// TravelCRM — Shared Constants
// ============================================================
// Single source of truth for status transitions and other
// constants used across frontend components.
// ============================================================

export const TRANSITIONS: Record<string, string[]> = {
  new:           ['followup', 'dnp', 'lost', 'invalid'],
  followup:      ['followup', 'dnp', 'proposal_sent', 'lost', 'invalid'],
  dnp:           ['followup', 'lost', 'invalid'],
  proposal_sent: ['followup', 'ready_to_pay', 'lost', 'invalid'],
  ready_to_pay:  ['confirmed', 'lost'],
  confirmed:     [],
  lost:          ['new'],
  invalid:       ['new'],
};

export const STATUS_LABELS: Record<string, string> = {
  new: 'New',
  followup: 'Follow Up',
  dnp: 'DNP',
  proposal_sent: 'Proposal Sent',
  ready_to_pay: 'Ready to Pay',
  confirmed: 'Confirmed',
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
