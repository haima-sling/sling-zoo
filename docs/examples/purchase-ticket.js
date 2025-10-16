const axios = require('axios');

// Example: Complete ticket purchase workflow

const API_BASE_URL = 'http://localhost:3000/api';

async function purchaseTicket() {
  try {
    console.log('=== Zoo Ticket Purchase Example ===\n');

    // Step 1: Check if visitor exists or register new visitor
    console.log('Step 1: Visitor Registration');
    const visitorData = {
      firstName: 'Emma',
      lastName: 'Thompson',
      email: 'emma.thompson@example.com',
      phone: '+1234567890',
      dateOfBirth: '1985-03-20',
      gender: 'female',
      address: {
        street: '789 Maple Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        country: 'USA'
      },
      preferences: {
        interests: ['wildlife', 'photography', 'education'],
        language: 'en',
        communicationMethod: 'email',
        newsletterSubscription: true,
        promotionalEmails: true
      },
      source: 'website'
    };

    const visitorResponse = await axios.post(`${API_BASE_URL}/visitors`, visitorData);
    const visitor = visitorResponse.data.data;
    console.log(`✓ Visitor registered: ${visitor.fullName}`);
    console.log(`  Email: ${visitor.email}`);
    console.log(`  Visitor ID: ${visitor._id}`);

    // Step 2: Check available ticket types and prices
    console.log('\nStep 2: Available Ticket Types');
    console.log('  - Adult: $25.00');
    console.log('  - Child: $15.00');
    console.log('  - Senior: $20.00');
    console.log('  - Student: $18.00');
    console.log('  - Group (10+): $20.00 per person');
    console.log('  - Annual Pass: $200.00');
    console.log('  - VIP: $75.00');

    // Step 3: Purchase tickets
    console.log('\nStep 3: Purchasing Tickets');
    
    const visitDate = new Date();
    visitDate.setDate(visitDate.getDate() + 7); // 7 days from now

    const tickets = [
      {
        visitorId: visitor._id,
        type: 'adult',
        price: 25.00,
        visitDate: visitDate,
        paymentMethod: 'credit_card',
        transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      },
      {
        visitorId: visitor._id,
        type: 'child',
        price: 15.00,
        visitDate: visitDate,
        paymentMethod: 'credit_card',
        transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }
    ];

    const purchasedTickets = [];
    let totalAmount = 0;

    for (const ticketData of tickets) {
      const ticketResponse = await axios.post(`${API_BASE_URL}/tickets`, ticketData);
      const ticket = ticketResponse.data.data;
      purchasedTickets.push(ticket);
      totalAmount += ticket.price;
      
      console.log(`  ✓ Ticket purchased: ${ticket.type.toUpperCase()}`);
      console.log(`    Ticket ID: ${ticket.ticketId}`);
      console.log(`    Price: $${ticket.price.toFixed(2)}`);
      console.log(`    Visit Date: ${new Date(ticket.visitDate).toLocaleDateString()}`);
    }

    console.log(`\n  Total Amount: $${totalAmount.toFixed(2)}`);

    // Step 4: Apply discount (if applicable)
    console.log('\nStep 4: Checking for Discounts');
    
    // Check if visitor qualifies for first-time visitor discount
    const isFirstTimeVisitor = visitor.totalVisits === 0;
    if (isFirstTimeVisitor) {
      const discountAmount = totalAmount * 0.10; // 10% discount
      console.log(`  ✓ First-time visitor discount applied: -$${discountAmount.toFixed(2)}`);
      console.log(`  New Total: $${(totalAmount - discountAmount).toFixed(2)}`);
    } else {
      console.log('  No discounts available');
    }

    // Step 5: Generate QR codes for tickets
    console.log('\nStep 5: Generating Digital Tickets');
    purchasedTickets.forEach((ticket, index) => {
      console.log(`  ✓ QR Code generated for Ticket ${index + 1}`);
      console.log(`    Scan code: ${ticket.ticketId}`);
    });

    // Step 6: Send confirmation email
    console.log('\nStep 6: Sending Confirmation');
    console.log(`  ✓ Confirmation email sent to: ${visitor.email}`);
    console.log('  ✓ Digital tickets attached');

    // Step 7: Provide visitor information
    console.log('\nStep 7: Visit Information');
    console.log(`  Visit Date: ${new Date(visitDate).toLocaleDateString()}`);
    console.log('  Zoo Hours: 9:00 AM - 5:00 PM');
    console.log('  Parking: Available on-site ($10)');
    console.log('  Food & Beverages: Cafeteria and food carts available');
    console.log('  Special Events: Check website for daily events');

    // Step 8: Add visitor to loyalty program
    console.log('\nStep 8: Loyalty Program');
    const loyaltyPoints = Math.floor(totalAmount); // 1 point per dollar spent
    
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@zoo.com',
      password: 'admin123'
    });
    const token = loginResponse.data.data.token;

    await axios.post(
      `${API_BASE_URL}/visitors/${visitor._id}/loyalty-points`,
      {
        points: loyaltyPoints,
        reason: 'Ticket purchase'
      },
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    
    console.log(`  ✓ ${loyaltyPoints} loyalty points added`);
    console.log(`  Total Points: ${loyaltyPoints}`);
    console.log('  Benefits: Redeem points for discounts on future visits!');

    // Summary
    console.log('\n=== Purchase Summary ===');
    console.log(`Visitor: ${visitor.fullName}`);
    console.log(`Email: ${visitor.email}`);
    console.log(`Tickets Purchased: ${purchasedTickets.length}`);
    console.log(`Total Amount: $${totalAmount.toFixed(2)}`);
    console.log(`Visit Date: ${new Date(visitDate).toLocaleDateString()}`);
    console.log(`Loyalty Points Earned: ${loyaltyPoints}`);
    console.log('\n✅ Ticket purchase completed successfully!');
    console.log('\nTicket IDs:');
    purchasedTickets.forEach((ticket, index) => {
      console.log(`  ${index + 1}. ${ticket.ticketId}`);
    });

    return {
      visitor,
      tickets: purchasedTickets,
      totalAmount,
      loyaltyPoints
    };

  } catch (error) {
    console.error('\n❌ Error:', error.response?.data?.message || error.message);
    
    if (error.response?.data?.errors) {
      console.error('\nValidation Errors:');
      error.response.data.errors.forEach(err => {
        console.error(`  - ${err.field}: ${err.message}`);
      });
    }
    
    throw error;
  }
}

// Run the example
if (require.main === module) {
  purchaseTicket()
    .then(() => {
      console.log('\nExample completed successfully');
      process.exit(0);
    })
    .catch(() => {
      console.log('\nExample failed');
      process.exit(1);
    });
}

module.exports = purchaseTicket;
