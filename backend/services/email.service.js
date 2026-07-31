const nodemailer = require("nodemailer");
require("dotenv").config();

const createTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
};

const sendBookingConfirmation = async ({ to, name, bookingId, movieTitle, seats, date, startTime, hall, totalAmount }) => {
  const t = createTransporter();
  if (!t) return;
  await t.sendMail({
    from: `"CineMax" <${process.env.SMTP_USER}>`,
    to,
    subject: `✅ Booking Confirmed – ${movieTitle}`,
    html: `<div style="font-family:sans-serif;background:#0a0a0a;color:#fff;padding:24px;border-radius:12px">
      <h1 style="color:#e50914">🎬 CineMax</h1>
      <p>Hi ${name}, your booking is confirmed!</p>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="color:#999;padding:6px 0">Movie</td><td style="color:#fff;font-weight:bold">${movieTitle}</td></tr>
        <tr><td style="color:#999;padding:6px 0">Date</td><td style="color:#fff">${new Date(date).toLocaleDateString()}</td></tr>
        <tr><td style="color:#999;padding:6px 0">Time</td><td style="color:#fff">${startTime}</td></tr>
        <tr><td style="color:#999;padding:6px 0">Hall</td><td style="color:#fff">${hall}</td></tr>
        <tr><td style="color:#999;padding:6px 0">Seats</td><td style="color:#fff">${seats.join(", ")}</td></tr>
        <tr><td style="color:#999;padding:6px 0;font-weight:bold">Total</td><td style="color:#e50914;font-size:18px;font-weight:bold">₱${Number(totalAmount).toFixed(2)}</td></tr>
      </table>
      <p style="color:#999;font-size:12px;margin-top:16px">Ref: CNM-${bookingId}</p>
    </div>`,
  });
};

const sendContactAck = async ({ to, name, subject }) => {
  const t = createTransporter();
  if (!t) return;
  await t.sendMail({
    from: `"CineMax" <${process.env.SMTP_USER}>`,
    to,
    subject: `We received your message – CineMax`,
    html: `<div style="font-family:sans-serif;background:#0a0a0a;color:#fff;padding:24px;border-radius:12px">
      <h1 style="color:#e50914">🎬 CineMax</h1>
      <p>Hi ${name}!</p>
      <p>We've received your message about "<strong>${subject}</strong>" and will get back to you within 24 hours.</p>
      <p style="color:#999;font-size:12px">Please do not reply to this email.</p>
    </div>`,
  });
};

module.exports = { sendBookingConfirmation, sendContactAck };
