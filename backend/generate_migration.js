const fs = require('fs');

const fullSql = fs.readFileSync('full_schema.sql', 'utf8');

const targetTables = [
  'clients', 'b2b_agents', 'email_templates', 'email_logs', 'query_status_settings',
  'org_settings', 'suppliers', 'activities', 'transfers', 'room_types', 'meal_plans',
  'package_themes', 'day_itinerary_templates', 'cms_pages', 'home_banners',
  'testimonials', 'gallery_images', 'blog_posts', 'destination_cms', 'package_terms',
  'expenses', 'invoices', 'vendor_payments', 'sheet_sync_configs', 'branches'
];

let output = '';

// Add the 4 columns to users
output += '-- AlterTable\n';
output += 'ALTER TABLE "users" ADD COLUMN "mobile" TEXT;\n';
output += 'ALTER TABLE "users" ADD COLUMN "mobile2" TEXT;\n';
output += 'ALTER TABLE "users" ADD COLUMN "department" TEXT;\n';
output += 'ALTER TABLE "users" ADD COLUMN "profile_photo" TEXT;\n\n';

// Extract table creations
for (const table of targetTables) {
  const tableRegex = new RegExp(`-- CreateTable\\nCREATE TABLE "${table}" \\([\\s\\S]*?\\);\\n`, 'g');
  const match = tableRegex.exec(fullSql);
  if (match) {
    output += match[0] + '\n';
  } else {
    console.log("Missing table CREATE " + table);
  }
}

// Extract indices
const indicesRegex = /-- CreateIndex\nCREATE (UNIQUE )?INDEX "[^"]+" ON "([^"]+)"\([^)]+\);\n/g;
let m;
while ((m = indicesRegex.exec(fullSql)) !== null) {
  if (targetTables.includes(m[2])) {
    output += m[0] + '\n';
  }
}

// Extract foreign keys
const fksRegex = /-- AddForeignKey\nALTER TABLE "([^"]+)" ADD CONSTRAINT "[^"]+" FOREIGN KEY \([^)]+\) REFERENCES "[^"]+"\([^)]+\)( ON DELETE [A-Z ]+)?( ON UPDATE [A-Z ]+)?;\n/g;
while ((m = fksRegex.exec(fullSql)) !== null) {
  if (targetTables.includes(m[1])) {
    output += m[0] + '\n';
  }
}

fs.writeFileSync('prisma/migrations/20260321_sprint8/migration.sql', output);
console.log('Done!');
