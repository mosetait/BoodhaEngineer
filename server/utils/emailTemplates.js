const generateBookingConfirmationEmail = (booking, user, service) => {
  return {
    subject: 'Booking Confirmation - Appliance Service',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4a90e2; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { text-align: center; padding: 20px; color: #666; }
          .button { background-color: #4a90e2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Confirmed!</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.name},</h2>
            <p>Your service booking has been confirmed. Here are the details:</p>
            <ul>
              <li><strong>Service:</strong> ${service.name}</li>
              <li><strong>Date:</strong> ${new Date(booking.scheduledDate).toLocaleDateString()}</li>
              <li><strong>Time:</strong> ${booking.timeSlot.start} - ${booking.timeSlot.end}</li>
              <li><strong>Booking ID:</strong> ${booking._id}</li>
              <li><strong>Status:</strong> ${booking.status}</li>
            </ul>
            <p>Our technician will arrive at the scheduled time. You can track your booking status in your dashboard.</p>
            <a href="${process.env.FRONTEND_URL}/bookings/${booking._id}" class="button">View Booking</a>
          </div>
          <div class="footer">
            <p>Thank you for choosing our services!</p>
            <p>&copy; 2024 Appliance Service. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
};

const generateOrderConfirmationEmail = (order, user) => {
  const itemsList = order.items.map(item => 
    `<li>${item.sparePart.name} - Qty: ${item.quantity} - ₹${item.price * item.quantity}</li>`
  ).join('');

  return {
    subject: 'Order Confirmation - Appliance Service',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4a90e2; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { text-align: center; padding: 20px; color: #666; }
          .order-summary { background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmed!</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.name},</h2>
            <p>Thank you for your order! Here are the details:</p>
            <div class="order-summary">
              <h3>Order #${order._id}</h3>
              <ul>${itemsList}</ul>
              <hr>
              <p><strong>Subtotal:</strong> ₹${order.pricing.subtotal}</p>
              <p><strong>Shipping:</strong> ₹${order.pricing.shipping}</p>
              <p><strong>Tax:</strong> ₹${order.pricing.tax}</p>
              <p><strong>Total:</strong> ₹${order.pricing.total}</p>
            </div>
            <p>We'll send you tracking information once your order ships.</p>
          </div>
          <div class="footer">
            <p>Thank you for shopping with us!</p>
            <p>&copy; 2024 Appliance Service. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
};

const generateStatusUpdateEmail = (type, item, user, newStatus) => {
  const itemType = type === 'booking' ? 'Service Booking' : 'Order';
  const itemId = item._id;
  
  return {
    subject: `${itemType} Status Update - ${newStatus}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4a90e2; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .status-box { background-color: #28a745; color: white; padding: 10px; text-align: center; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${itemType} Update</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.name},</h2>
            <p>Your ${itemType.toLowerCase()} status has been updated:</p>
            <div class="status-box">
              <h3>Status: ${newStatus.toUpperCase()}</h3>
            </div>
            <p><strong>${itemType} ID:</strong> ${itemId}</p>
            <p>You can check more details in your dashboard.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
};

module.exports = {
  generateBookingConfirmationEmail,
  generateOrderConfirmationEmail,
  generateStatusUpdateEmail
};