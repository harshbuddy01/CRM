const prisma = require('../config/prisma');

async function seedDemoData(userId) {
  console.log(`[Demo Seed] Seeding data for demo user ${userId}...`);

  const statuses = ['new', 'contacted', 'quoted', 'negotiation', 'confirmed', 'cancelled'];
  const destinations = ['Goa', 'Kerala', 'Sikkim', 'Rajasthan', 'Himachal'];

  // 1. Create B2B Agents
  const agents = [];
  for (let i = 1; i <= 3; i++) {
    const agent = await prisma.b2bAgent.create({
      data: {
        companyName: `Demo Travels B2B ${i}`,
        mobile: `987654${Math.floor(1000 + Math.random() * 9000)}${i}`,
        email: `agent${i}_${Date.now()}@demotravels.com`,
      }
    });
    agents.push(agent);
  }

  // 2. Create Clients & Queries
  for (let i = 1; i <= 15; i++) {
    const status = statuses[i % statuses.length];
    const destination = destinations[i % destinations.length];

    const client = await prisma.client.create({
      data: {
        name: `Demo Client ${i}`,
        phone: `998877${Math.floor(1000 + Math.random() * 9000)}${i}`,
        email: `client${i}_${Date.now()}@example.com`,
      }
    });

    const query = await prisma.query.create({
      data: {
        queryCode: `QRY-DEMO-${Date.now().toString().slice(-6)}-${i}`,
        name: client.name,
        phone: client.phone,
        email: client.email,
        destination,
        leadSource: 'website',
        status,
        assignedTo: userId,
        clientId: client.id,
        b2bAgentId: i % 3 === 0 ? agents[0].id : null,
      }
    });

    // 3. Create Activity Log
    await prisma.activityLog.create({
      data: {
        userId,
        action: 'query.created',
        entityType: 'query',
        entityId: query.id,
      }
    });

    // 4. Create Proposal for some queries
    if (['quoted', 'negotiation', 'confirmed'].includes(status)) {
      await prisma.proposal.create({
        data: {
          queryId: query.id,
          status: status === 'confirmed' ? 'confirmed' : 'pending',
          createdBy: userId,
          totalCost: 50000 + (i * 1000),
        }
      });
    }

    // 5. Create Payments for confirmed queries
    if (status === 'confirmed') {
      await prisma.payment.create({
        data: {
          queryId: query.id,
          amount: 25000,
          mode: 'upi',
          paymentDate: new Date(),
          recordedBy: userId,
          status: 'verified',
        }
      });
    }
  }

  // 6. Create Itineraries
  try {
      for(let i = 1; i <= 5; i++) {
          await prisma.itinerary.create({
             data: {
                 title: `${destinations[i%destinations.length]} Demo Itinerary`,
                 createdBy: userId
             }
          });
      }
  } catch(e) {
      console.error("[Demo Seed] Error seeding itineraries", e);
  }

  console.log(`[Demo Seed] Seeding completed for demo user ${userId}`);
}

module.exports = { seedDemoData };
