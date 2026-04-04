const fs = require('fs');
const content = fs.readFileSync('backend/src/controllers/itinerary.controller.js', 'utf8');
if (content.includes('publishToTemplates')) {
  console.log('SUCCESS');
} else {
  console.log('FAILED');
}
