const { BusinessError } = require('./AppError');

const TRANSITIONS = {
  new:           ['quoted', 'negotiation', 'confirmed', 'lost', 'invalid'],
  quoted:        ['negotiation', 'confirmed', 'lost', 'invalid', 'new'],
  negotiation:   ['quoted', 'confirmed', 'lost', 'invalid', 'new'],
  confirmed:     ['in_progress', 'completed', 'lost'],
  in_progress:   ['completed', 'lost'],
  completed:     [],
  lost:          ['new', 'quoted'],
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
