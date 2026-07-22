const prisma = require('../config/prisma');

/**
 * Smart rule-based CRM assistant chatbot controller.
 * Provides rich, helpful responses about CRM features,
 * with live database stats where available.
 */
exports.askChatbot = async (req, res, next) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const msg = message.toLowerCase().trim();
    const page = context?.page || '';
    let reply = '';

    // ── Helper: safely count records ──
    const safeCount = async (model) => {
      try { return await model.count(); } catch { return 0; }
    };

    // ── Pattern matching (ordered by specificity) ──

    if (/^(hi|hello|hey|good\s*(morning|afternoon|evening)|greetings)/i.test(msg)) {
      const leadCount = await safeCount(prisma.query);
      reply = `👋 Hello! Welcome to **StreamKart TravelCRM**.\n\nI'm your AI assistant — here to help you navigate the CRM. Here's a quick snapshot:\n\n📊 **${leadCount}** leads in the pipeline\n\nTry asking me about:\n• Creating leads & proposals\n• Tour dispatch & operations\n• Payments & invoicing\n• B2B agent management\n• Reports & analytics\n• Team & permissions`;
    }

    else if (/lead|query|enquir|pipeline|funnel/i.test(msg)) {
      const leadCount = await safeCount(prisma.query);
      const statuses = ['New', 'Contacted', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'];
      reply = `📋 **Lead Management**\n\nYou currently have **${leadCount}** leads tracked in the CRM.\n\n**How to create a lead:**\n1. Click "**+ Add Lead**" on the Pipeline or Leads page\n2. Fill in client name, phone, destination & travel dates\n3. The lead is auto-assigned based on round-robin or manual selection\n\n**Pipeline stages:** ${statuses.join(' → ')}\n\n**Pro tips:**\n• Use the Kanban board (Pipeline view) to drag leads between stages\n• Set follow-up dates and the system will remind you\n• Filter by date range, assignee, or lead source for quick analysis`;
    }

    else if (/proposal|itinerar|package|day.*wise|builder/i.test(msg)) {
      const proposalCount = await safeCount(prisma.proposal);
      reply = `✈️ **Proposals & Itineraries**\n\n${proposalCount > 0 ? `You have **${proposalCount}** proposals in the system.` : 'Start creating proposals for your leads!'}\n\n**How to create a proposal:**\n1. Go to any lead → Click "**Create Proposal**"\n2. Use the drag-and-drop builder to add:\n   • 🏨 Hotels (with room categories & pricing)\n   • ✈️ Flights (with timing & class)\n   • 🎯 Activities & Sightseeing\n   • 🚗 Transfers & cab services\n3. Click "**Generate PDF**" for a stunning client-ready document\n\n**Features:**\n• Auto-calculate total cost with markup\n• Share via WhatsApp or Email with one click\n• Multiple versions per lead for comparison\n• Beautiful branded PDF with your company logo`;
    }

    else if (/tour|dispatch|operation|voucher|driver/i.test(msg)) {
      const tourCount = await safeCount(prisma.tour);
      reply = `🚌 **Tour Dispatch & Operations**\n\n${tourCount > 0 ? `You have **${tourCount}** tours in the system.` : 'Tours are created from confirmed bookings.'}\n\n**Tour dispatch workflow:**\n1. Once a lead is confirmed → Create a Tour from it\n2. Add passengers, drivers, and vehicles\n3. Generate service vouchers for hotels, flights, and cabs\n4. Track live status: Upcoming → In Progress → Completed\n\n**Pro features:**\n• Auto-generate supplier vouchers with all booking details\n• Email vouchers directly to hotels/suppliers\n• Real-time tour status tracking dashboard\n• Passenger manifest with emergency contacts`;
    }

    else if (/payment|invoice|finance|billing|receipt|razorpay|ledger|gst|outstanding/i.test(msg)) {
      reply = `💰 **Payments & Finance**\n\n**Invoice generation:**\n1. Go to any confirmed tour/booking\n2. Click "**Generate Invoice**" → Auto-populates from booking\n3. Send branded GST-compliant invoices via email or WhatsApp\n\n**Payment tracking:**\n• Record part-payments against any booking\n• Send Razorpay payment links for online collection\n• Track outstanding balances per client or agent\n• Generate billing statements with payment history\n\n**Finance dashboard:**\n• Revenue tracking with date filters\n• GST report for filing\n• Client-wise & agent-wise ledger view\n• Export to Excel for your accountant`;
    }

    else if (/report|analytic|metric|export|excel|dashboard|performance/i.test(msg)) {
      reply = `📊 **Reports & Analytics**\n\n**Available reports:**\n• 📈 **Sales Performance** — Revenue, conversion rates, top salespeople\n• 📋 **Lead Analysis** — Source-wise, status-wise, date-wise breakdown\n• 💼 **Agent Performance** — Bookings & commissions per B2B agent\n• 💰 **Financial Summary** — Collections, receivables, monthly revenue\n\n**How to use:**\n1. Go to **Reports** from the sidebar\n2. Select date range and filters\n3. View charts & tables in-app\n4. Click "**Export**" → Downloads as Excel (.xlsx)\n\n**Pro tip:** Set up the dashboard widgets on the Overview page to see key metrics at a glance!`;
    }

    else if (/team|user|role|permission|staff|employee|member/i.test(msg)) {
      const userCount = await safeCount(prisma.user);
      reply = `👥 **Team Management**\n\n${userCount > 0 ? `You have **${userCount}** team members.` : ''}\n\n**Roles & permissions:**\n• **Admin** — Full access to everything including settings\n• **Sales** — Manage leads, proposals, and client communication\n• **Operations** — Tour dispatch, vouchers, and supplier coordination\n• **Viewer** — Read-only access for reporting\n\n**How to add team members:**\n1. Go to **Settings → Team**\n2. Click "**+ Add User**"\n3. Set their name, email, role & branch\n4. They'll receive login credentials automatically\n\n**Pro features:**\n• Round-robin lead assignment\n• Branch-based data segregation\n• Activity log tracks every team action`;
    }

    else if (/agent|b2b|partner|commission|wholesale|markup/i.test(msg)) {
      const agentCount = await safeCount(prisma.b2BAgent);
      reply = `🤝 **B2B Agent Portal**\n\n${agentCount > 0 ? `You have **${agentCount}** B2B agents registered.` : 'Start adding your travel agent partners!'}\n\n**Features:**\n• Agents get their own branded login portal\n• Set per-agent markup (% or fixed amount)\n• Track agent-wise bookings & commissions\n• Agents can view their leads, payments & statements\n• Co-branded proposals with agent's logo\n\n**How to add an agent:**\n1. Go to **B2B Agents** from sidebar\n2. Click "**+ Add Agent**"\n3. Fill in company details, markup type & commission\n4. Share their login credentials\n\n**Commission tracking:**\n• Auto-calculates commission on each booking\n• Monthly settlement reports\n• Agent can view their own ledger`;
    }

    else if (/client|customer|contact|crm|database/i.test(msg)) {
      const clientCount = await safeCount(prisma.client);
      reply = `👤 **Client Management**\n\n${clientCount > 0 ? `You have **${clientCount}** clients in the database.` : 'Clients are auto-created from leads.'}\n\n**Client profiles include:**\n• Contact details (phone, email, WhatsApp)\n• Travel history & lifetime spend\n• Passport & visa details\n• Important dates (birthday, anniversary)\n\n**How it works:**\n• Clients are auto-created when a lead is confirmed\n• Link multiple queries to the same client\n• View complete booking history per client\n• Send personalized birthday/anniversary wishes`;
    }

    else if (/whatsapp|wa\s|chat|broadcast|template|message|notification/i.test(msg)) {
      reply = `📱 **WhatsApp Business Integration**\n\n**What StreamKart offers:**\n• Official WhatsApp Business API integration (not unofficial)\n• Send proposals, invoices & vouchers via WhatsApp\n• Automated follow-up reminders\n• Broadcast lists for marketing campaigns\n• Template messages for common scenarios\n\n**Template examples:**\n• "Hi {name}, your Bali trip proposal is ready! 🏝️"\n• "Payment of ₹{amount} received. Thank you! ✅"\n• "Your tour to {destination} starts tomorrow! ✈️"\n\n**Pro tip:** The WhatsApp Simulator in this demo shows how automated notifications would appear to your clients in production!`;
    }

    else if (/setting|config|setup|brand|logo|email.*signature|smtp/i.test(msg)) {
      reply = `⚙️ **Settings & Configuration**\n\n**General settings:**\n• Company name, logo, and contact details\n• GST & PAN numbers for invoices\n• Bank account details for payment receipts\n\n**Email signature:**\n• Rich text editor for professional signatures\n• Auto-appended to all outgoing emails\n\n**Integrations:**\n• WhatsApp Business API keys\n• Razorpay payment gateway\n• SMTP email configuration\n• Cloudinary for image uploads\n\n**Go to:** Settings page from the sidebar → Choose the relevant tab`;
    }

    else if (/thank|great|awesome|perfect|excellent|good job|nice|cool/i.test(msg)) {
      reply = `😊 You're welcome! Happy to help.\n\nFeel free to ask me anything else about the CRM. I'm here to make your demo experience smooth and informative!\n\n💡 **Quick actions:**\n• Type "**features**" for a feature overview\n• Type "**help**" for all available topics`;
    }

    else if (/bye|goodbye|see you|exit|close|quit/i.test(msg)) {
      reply = `👋 Goodbye! Thanks for exploring StreamKart TravelCRM.\n\nRemember, this is a full-featured demo — try creating a lead, building an itinerary, or generating an invoice to see the CRM in action!\n\n🚀 **Ready for the real thing?** Contact us at support@streamkart.shop`;
    }

    else if (/feature|what.*can|capabilit|what.*do|overview|about/i.test(msg)) {
      reply = `🚀 **StreamKart TravelCRM — Feature Overview**\n\n📋 **Lead Management** — Pipeline, Kanban board, auto-assignment\n✈️ **Itinerary Builder** — Drag-and-drop, auto-PDF generation\n🚌 **Tour Operations** — Dispatch, vouchers, live tracking\n💰 **Finance** — Invoicing, part-payments, GST reports\n📊 **Analytics** — Sales performance, lead conversion, revenue\n👥 **Team Management** — Roles, permissions, activity logs\n🤝 **B2B Portal** — Agent management, commissions, co-branding\n📱 **WhatsApp API** — Automated notifications, broadcasts\n👤 **Client CRM** — Contact database, travel history\n🌐 **Website CMS** — Tour packages, booking forms\n\n**Try it out!** Navigate to any section from the sidebar to see it in action.`;
    }

    else if (/help|support|issue|problem|trouble|not.*work|error|bug/i.test(msg)) {
      reply = `🆘 **Need Help?**\n\nI can assist you with:\n\n📋 **"How to create a lead?"** — Step-by-step guide\n✈️ **"How to make a proposal?"** — Itinerary builder tutorial\n💰 **"How to generate an invoice?"** — Finance walkthrough\n👥 **"How to add team members?"** — Team setup guide\n🤝 **"How to manage B2B agents?"** — Agent portal setup\n📊 **"How to export reports?"** — Analytics guide\n\nJust type your question and I'll walk you through it!\n\n📧 For technical support: **support@streamkart.shop**`;
    }

    else if (/price|cost|plan|subscription|pricing|how.*much/i.test(msg)) {
      reply = `💳 **StreamKart TravelCRM Pricing**\n\n🌟 **Starter** — ₹1,499/month\n• Up to 5 users\n• All core CRM features\n• Email support\n\n🚀 **Professional** — ₹2,999/month\n• Up to 15 users\n• WhatsApp Business API\n• B2B Agent Portal\n• Priority support\n\n🏆 **Enterprise** — Custom pricing\n• Unlimited users\n• Custom domain & branding\n• Dedicated account manager\n• API access\n\n📧 Contact **support@streamkart.shop** for a personalized quote!`;
    }

    else {
      // Contextual fallback based on current page
      const pageHints = {
        '/pipeline': 'Try dragging leads between pipeline columns to update their status!',
        '/leads': 'Click "+ Add Lead" to create a new enquiry, or click any lead to view details.',
        '/tours': 'Tours are created from confirmed bookings. Check the Operations tab for active tours.',
        '/settings': 'Update your company details, email signature, and API keys here.',
        '/reports': 'Use the date filters and export button to generate custom reports.',
        '/clients': 'Click on any client to see their complete travel history.',
        '/agents': 'Manage your B2B partners and track their commission here.',
      };

      const pageHint = Object.entries(pageHints).find(([path]) => page.includes(path));

      reply = `🤔 I'm not sure about that specific question, but I can help with many topics!\n\n${pageHint ? `💡 **Page tip:** ${pageHint[1]}\n\n` : ''}**Try asking about:**\n• "How to create a lead?"\n• "Tell me about proposals"\n• "How does invoicing work?"\n• "Explain B2B agent portal"\n• "What features does StreamKart have?"\n• "Show me pricing plans"\n\nOr type **"help"** for all available topics!`;
    }

    return res.status(200).json({
      success: true,
      reply
    });

  } catch (error) {
    console.error('Chatbot Error:', error);
    // Even on error, return a helpful response
    return res.status(200).json({
      success: true,
      reply: "I'm having a temporary issue accessing the database, but I'm still here to help! Try asking about CRM features, proposals, or team management."
    });
  }
};
