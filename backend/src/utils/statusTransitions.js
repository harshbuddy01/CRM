const { BusinessError } = require('./AppError');

const TRANSITIONS = {
  new:           ['followup', 'dnp', 'lost', 'invalid'],
  followup:      ['followup', 'dnp', 'proposal_sent', 'lost', 'invalid'],
  dnp:           ['followup', 'lost', 'invalid'],
  proposal_sent: ['followup', 'ready_to_pay', 'lost', 'invalid'],
  ready_to_pay:  ['confirmed', 'lost'],
  confirmed:     [],
  lost:          ['new'],
  invalid:       ['new'],
};

function validateTransition(from, to) {
  const allowed = TRANSITIONS[from] || [];
  if (!allowed.includes(to)) {
    throw new BusinessError(
      `Cannot move from '${from}' to '${to}'. Allowed: ${allowed.join(', ') || 'none'}`
    );
  }
}

module.exports = { validateTransition };
