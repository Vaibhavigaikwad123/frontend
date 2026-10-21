const nodemailer = require('nodemailer');

const createTransporter = () => {
    // If we have SMTP settings, use them. Otherwise, fall back to console logging for development.
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('--- EMAIL SERVICE: No SMTP credentials found. Emails will be logged to the console instead. ---');
        return {
            sendMail: (options) => {
                console.log('========================================');
                console.log('📧 MOCK EMAIL SENT');
                console.log(`To: ${options.to}`);
                console.log(`Subject: ${options.subject}`);
                console.log('Content (HTML):');
                console.log(options.html);
                console.log('========================================');
                return Promise.resolve({ messageId: 'mock-id' });
            }
        };
    }

    // Check if using custom SMTP (e.g., Mailtrap) or a service (e.g., Gmail)
    if (process.env.EMAIL_HOST) {
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT || 587,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    return nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

const sendWelcomeEmail = async (user) => {
    const transporter = createTransporter();

    const html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; border: 1px solid #eee; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #4f46e5; margin: 0;">Stationary<span style="color: #9333ea;">Hub</span></h1>
            </div>
            <h2 style="color: #1f2937;">Welcome to the family, ${user.name}!</h2>
            <p>Thank you for joining StationaryHub. We're excited to help you elevate your study and workspace with the best creative tools.</p>
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; font-weight: bold; color: #4b5563;">What's next?</p>
                <ul style="padding-left: 20px; color: #6b7280;">
                    <li>Explore our premium collections</li>
                    <li>Save your favorites to your wishlist</li>
                    <li>Get exclusive discounts on executive bundles</li>
                </ul>
            </div>
            <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.CLIENT_URL}/shop" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Start Shopping</a>
            </div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
            <p style="font-size: 12px; color: #9ca3af; text-align: center;">You received this because you signed up at StationaryHub. If you didn't, please ignore this email.</p>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: `"StationaryHub" <${process.env.EMAIL_USER || 'noreply@stationaryhub.com'}>`,
            to: user.email,
            subject: 'Welcome to StationaryHub! ✨',
            html
        });
    } catch (err) {
        console.error('Email error:', err);
    }
};

const sendOrderConfirmationEmail = async (user, order) => {
    const transporter = createTransporter();

    // Generate Invoice Number
    const invoiceNumber = `INV-${order._id.toString().slice(-8).toUpperCase()}`;
    const orderNumber = order._id.toString().slice(-6).toUpperCase();

    // Calculate tax breakdown (assuming 18% GST split as 9% CGST + 9% SGST)
    const subtotal = order.totalAmount / 1.18; // Remove 18% tax
    const cgst = subtotal * 0.09;
    const sgst = subtotal * 0.09;
    const totalGst = cgst + sgst;

    // Items table with individual pricing
    const itemsHtml = order.items.map(item => {
        const itemSubtotal = item.price * item.quantity;
        return `
        <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 12px 8px; font-size: 14px;">${item.product.name}</td>
            <td style="padding: 12px 8px; text-align: center; font-size: 14px;">₹${item.price.toFixed(2)}</td>
            <td style="padding: 12px 8px; text-align: center; font-size: 14px;">${item.quantity}</td>
            <td style="padding: 12px 8px; text-align: right; font-size: 14px; font-weight: 600;">₹${itemSubtotal.toFixed(2)}</td>
        </tr>
    `;
    }).join('');

    // Payment method display
    const paymentMethodDisplay = order.paymentMethod || 'COD';
    const paymentStatusDisplay = order.paymentStatus || 'Pending';
    const paymentStatusColor = paymentStatusDisplay === 'Paid' ? '#10b981' : '#f59e0b';

    const html = `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 650px; margin: 0 auto; color: #1f2937; background-color: #ffffff;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
                <h1 style="margin: 0; font-size: 32px; font-weight: 700;">Order Confirmed! 🎉</h1>
                <p style="margin: 15px 0 5px; opacity: 0.95; font-size: 16px;">Thank you for your purchase, ${user.name}!</p>
                <p style="margin: 0; opacity: 0.9; font-size: 14px;">Order #${orderNumber}</p>
            </div>
            
            <!-- Invoice Section -->
            <div style="padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
                
                <!-- Invoice Header -->
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #4f46e5;">
                    <div>
                        <h2 style="margin: 0; color: #4f46e5; font-size: 20px;">StationaryHub</h2>
                        <p style="margin: 5px 0 0; color: #6b7280; font-size: 13px;">Premium Stationery & Office Supplies</p>
                    </div>
                    <div style="text-align: right;">
                        <div style="background-color: #fef3c7; color: #92400e; padding: 8px 16px; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 14px;">
                            ${invoiceNumber}
                        </div>
                        <p style="margin: 8px 0 0; color: #6b7280; font-size: 12px;">Date: ${new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                </div>

                <!-- Thank You Section -->
                <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 25px; border-radius: 12px; margin-bottom: 30px; border-left: 4px solid #f59e0b; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                    <div style="text-align: center;">
                        <h2 style="margin: 0 0 12px 0; color: #92400e; font-size: 24px; font-weight: 700;">💝 Thank You!</h2>
                        <p style="margin: 0 0 15px 0; color: #78350f; font-size: 15px; line-height: 1.6;">
                            We truly appreciate your business and trust in StationaryHub. Your support means the world to us!
                        </p>
                        <div style="background-color: rgba(255,255,255,0.7); padding: 15px; border-radius: 8px; margin-top: 15px;">
                            <p style="margin: 0; color: #92400e; font-weight: 600; font-size: 14px;">🎁 Special Gift for You!</p>
                            <p style="margin: 8px 0 0; color: #78350f; font-size: 13px;">Use code <span style="background-color: #fff; padding: 4px 12px; border-radius: 4px; font-weight: 700; color: #ea580c; font-size: 16px; letter-spacing: 1px;">THANKYOU10</span> on your next purchase for <strong>10% OFF!</strong></p>
                        </div>
                    </div>
                </div>

                <!-- Bill To -->
                <div style="margin-bottom: 25px; background-color: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #4f46e5;">
                    <h4 style="margin: 0 0 10px 0; color: #374151; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Bill To:</h4>
                    <p style="margin: 0; color: #1f2937; font-weight: 600; font-size: 15px;">${user.name}</p>
                    <p style="margin: 5px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                        ${order.shippingAddress.street}<br>
                        ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.zip}<br>
                        Phone: ${order.shippingAddress.phone}
                    </p>
                </div>
                
                <!-- Order Items Table -->
                <h3 style="margin: 30px 0 15px; color: #111827; font-size: 18px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Invoice Details</h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
                    <thead>
                        <tr style="background-color: #f3f4f6; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                            <th style="padding: 12px 8px; text-align: left; font-weight: 600;">Item</th>
                            <th style="padding: 12px 8px; text-align: center; font-weight: 600;">Rate</th>
                            <th style="padding: 12px 8px; text-align: center; font-weight: 600;">Qty</th>
                            <th style="padding: 12px 8px; text-align: right; font-weight: 600;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>

                <!-- Tax Breakdown -->
                <div style="background-color: #fafbfc; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                    <table style="width: 100%; font-size: 14px;">
                        <tr>
                            <td style="padding: 8px 0; color: #6b7280;">Subtotal</td>
                            <td style="padding: 8px 0; text-align: right; color: #374151; font-weight: 500;">₹${subtotal.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #6b7280;">CGST (9%)</td>
                            <td style="padding: 8px 0; text-align: right; color: #374151; font-weight: 500;">₹${cgst.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #6b7280;">SGST (9%)</td>
                            <td style="padding: 8px 0; text-align: right; color: #374151; font-weight: 500;">₹${sgst.toFixed(2)}</td>
                        </tr>
                        <tr style="border-top: 2px solid #e5e7eb;">
                            <td style="padding: 12px 0 0; color: #111827; font-size: 16px; font-weight: 700;">Grand Total</td>
                            <td style="padding: 12px 0 0; text-align: right; color: #4f46e5; font-size: 20px; font-weight: 700;">₹${order.totalAmount.toFixed(2)}</td>
                        </tr>
                    </table>
                </div>

                <!-- Payment Info -->
                <div style="display: flex; gap: 15px; margin-bottom: 30px;">
                    <div style="flex: 1; background-color: #eff6ff; padding: 15px; border-radius: 8px; border-left: 3px solid #3b82f6;">
                        <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Payment Method</p>
                        <p style="margin: 5px 0 0; color: #1f2937; font-weight: 600; font-size: 15px;">${paymentMethodDisplay}</p>
                    </div>
                    <div style="flex: 1; background-color: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 3px solid ${paymentStatusColor};">
                        <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Payment Status</p>
                        <p style="margin: 5px 0 0; color: ${paymentStatusColor}; font-weight: 600; font-size: 15px;">${paymentStatusDisplay}</p>
                    </div>
                </div>

                <!-- Order Tracking Button -->
                <div style="text-align: center; margin: 35px 0 25px; padding: 25px; background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); border-radius: 10px;">
                    <p style="margin: 0 0 15px; color: #374151; font-size: 15px; font-weight: 600;">📦 Track Your Order Status</p>
                    <a href="${process.env.CLIENT_URL}/profile" style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 6px rgba(79, 70, 229, 0.3); transition: all 0.3s;">
                        View My Orders →
                    </a>
                    <p style="margin: 15px 0 0; color: #6b7280; font-size: 13px;">Expected Delivery: 3-5 Business Days</p>
                </div>

                <!-- Footer -->
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
                    <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.6;">
                        Questions? Contact us at <a href="mailto:support@stationaryhub.com" style="color: #4f46e5; text-decoration: none;">support@stationaryhub.com</a><br>
                        This is an automated email. Please do not reply.
                    </p>
                </div>
            </div>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: `"StationaryHub" <${process.env.EMAIL_USER || 'noreply@stationaryhub.com'}>`,
            to: user.email,
            subject: `📧 Order Invoice & Receipt - #${orderNumber}`,
            html
        });
    } catch (err) {
        console.error('Email error:', err);
    }
};

const sendOTPEmail = async (email, otp) => {
    const transporter = createTransporter();

    const html = `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937; background-color: #ffffff;">
            <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
                <h1 style="margin: 0; font-size: 28px; font-weight: 700;">Password Reset Request</h1>
            </div>
            
            <div style="padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
                <p style="font-size: 16px; line-height: 1.6;">Hello,</p>
                <p style="font-size: 16px; line-height: 1.6;">We received a request to reset your password for your StationaryHub account. Use the OTP below to proceed:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <div style="font-size: 32px; font-weight: 800; letter-spacing: 5px; color: #4f46e5; background-color: #f3f4f6; display: inline-block; padding: 20px 40px; border-radius: 12px; border: 2px dashed #c7d2fe;">
                        ${otp}
                    </div>
                    <p style="margin-top: 15px; font-size: 14px; color: #6b7280;">Valid for 10 minutes</p>
                </div>
                
                <p style="font-size: 14px; color: #6b7280; font-style: italic;">If you didn't request this password reset, please ignore this email.</p>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">StationaryHub Support Team</p>
                </div>
            </div>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: `"StationaryHub" <${process.env.EMAIL_USER || 'noreply@stationaryhub.com'}>`,
            to: email,
            subject: '🔒 Your Password Reset OTP',
            html
        });
    } catch (err) {
        console.error('Email error:', err);
    }
};

const sendReturnRequestEmail = async (adminEmail, returnDetails) => {
    const transporter = createTransporter();

    // Fallback if adminEmail is not provided (e.g. env var missing)
    const recipient = adminEmail || process.env.EMAIL_USER;

    const itemsHtml = returnDetails.items.map(item => `
        <li style="margin-bottom: 10px;">
            <strong>${item.name}</strong> (Qty: ${item.quantity})<br>
            <span style="font-size: 12px; color: #666;">ID: ${item.productId || 'N/A'}</span>
        </li>
    `).join('');

    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
            <h2 style="color: #4f46e5;">New Return Request Received</h2>
            <p><strong>Order ID:</strong> ${returnDetails.orderId}</p>
            <p><strong>User:</strong> ${returnDetails.userName} (${returnDetails.userEmail})</p>
            <p><strong>Type:</strong> ${returnDetails.type}</p>
            <div style="background: #f9fafb; padding: 15px; margin: 15px 0;">
                <strong>Reason:</strong><br>
                ${returnDetails.reason}
            </div>
            <h3>Items:</h3>
            <ul>${itemsHtml}</ul>
            <p style="margin-top: 20px;">
                <a href="${process.env.CLIENT_URL}/admin" style="background: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Manage in Dashboard</a>
            </p>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: `"StationaryHub System" <${process.env.EMAIL_USER}>`,
            to: recipient,
            subject: `Action Required: New Return Request - Order #${returnDetails.orderId.slice(-6)}`,
            html
        });
    } catch (err) {
        console.error('Email error:', err);
    }
};

const sendReturnStatusEmail = async (userEmail, returnDetails) => {
    const transporter = createTransporter();

    const statusColors = {
        'Approved': '#10b981',
        'Rejected': '#ef4444',
        'Completed': '#3b82f6',
        'Pending': '#f59e0b'
    };
    const color = statusColors[returnDetails.status] || '#6b7280';

    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
            <h2 style="color: #4f46e5;">Return Request Update</h2>
            <p>Hello ${returnDetails.userName},</p>
            <p>The status of your return request for Order <strong>#${returnDetails.orderId.slice(-6)}</strong> has been updated.</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <span style="background-color: ${color}; color: white; padding: 12px 24px; border-radius: 25px; font-weight: bold; font-size: 16px;">
                    ${returnDetails.status}
                </span>
            </div>

            ${returnDetails.adminNotes ? `
                <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
                    <strong>Note from Support:</strong><br>
                    ${returnDetails.adminNotes}
                </div>
            ` : ''}

            <p>You can track the progress in your profile.</p>
            <p>
                <a href="${process.env.CLIENT_URL}/profile" style="color: #4f46e5; text-decoration: none;">View Request</a>
            </p>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: `"StationaryHub Support" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: `Update on your Return Request - Order #${returnDetails.orderId.slice(-6)}`,
            html
        });
    } catch (err) {
        console.error('Email error:', err);
    }
};

module.exports = {
    sendWelcomeEmail,
    sendOrderConfirmationEmail,
    sendOTPEmail,
    sendReturnRequestEmail,
    sendReturnStatusEmail
};
