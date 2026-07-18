const prisma = require('../config/prisma');

/**
 * Smart rule-based chatbot controller
 */
exports.askChatbot = async (req, res, next) => {
  try {
    const { message, context } = req.body;
    
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const msg = message.toLowerCase();
    let reply = "I'm not sure about that. Try asking about leads, proposals, tours, payments, or team management!";

    // Simple pattern matching
    if (msg.includes('lead') || msg.includes('query')) {
      const leadCount = await prisma.query.count();
      reply = `**Lead Management**\nYou have ${leadCount} total leads in the system.\n\nTo create a lead, go to the Leads section and click 'Add Lead'. You can track progress through various stages like 'New', 'Contacted', and 'Converted'.`;
    } 
    else if (msg.includes('proposal') || msg.includes('itinerary')) {
      const proposalCount = await prisma.proposal.count();
      reply = `**Proposals & Itineraries**\nThere are ${proposalCount} proposals created.\n\nTo create a proposal, navigate to a Lead and click 'Create Proposal'. You can use the drag-and-drop itinerary builder to add flights, hotels, and activities.`;
    }
    else if (msg.includes('tour') || msg.includes('dispatch')) {
      const tourCount = await prisma.tour.count();
      reply = `**Tour Operations**\nYou currently have ${tourCount} tours in the system.\n\nTour Dispatch helps you assign drivers, generate vouchers, and track live statuses of ongoing trips.`;
    }
    else if (msg.includes('payment') || msg.includes('invoice') || msg.includes('finance')) {
      reply = `**Payments & Finance**\nYou can generate invoices from any confirmed tour. Track part-payments, send Razorpay links, and monitor outstanding balances in the Finance tab.`;
    }
    else if (msg.includes('report') || msg.includes('export')) {
      reply = `**Reports**\nGo to the Reports section to view metrics on sales performance, lead conversion rates, and revenue. You can export any report to Excel or PDF using the export button in the top right.`;
    }
    else if (msg.includes('team') || msg.includes('user') || msg.includes('role')) {
      reply = `**Team Management**\nAdmin users can add team members in Settings > Users. You can assign roles (Admin, Sales, Ops) which automatically handle permissions.`;
    }
    else if (msg.includes('agent') || msg.includes('b2b')) {
      reply = `**B2B Agents**\nYou can manage B2B travel agents in the Agents section. Set specific commission structures and allow them to log into their own portal to track their bookings.`;
    }
    else if (msg.includes('help') || msg.includes('how')) {
      reply = `**How can I help?**\nI can answer questions about:\n- Leads & Proposals\n- Tour Dispatch\n- Payments & Finance\n- Team Management\n- Reporting\n\nJust ask!`;
    }
    else if (msg.includes('hi') || msg.includes('hello') || msg.includes('hey')) {
      reply = `Hello! How can I help you with TravelCRM today?`;
    }
    else if (msg.includes('thank')) {
      reply = `You're welcome! Let me know if you need anything else.`;
    }

    return res.status(200).json({
      success: true,
      reply
    });

  } catch (error) {
    console.error('Chatbot Error:', error);
    next(error);
  }
};
