const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const UserModel = require('../../models/usersModel');

class WebhookController {
  static async handleWebhook(req, res) {
const sig = req.headers['stripe-signature'];
  
  try {
    const event = stripe.webhooks.constructEvent(
      req.rawBody || req.body, // Sử dụng rawBody nếu có
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    } catch (err) {
      console.error('❌ Webhook Error:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const amount = parseInt(session.metadata?.topupAmount);

      if (!userId || isNaN(amount)) return res.status(400).json({ message: 'Thiếu metadata' });

      try {
        const user = await UserModel.findOne({ where: { id: userId } });
        if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });

        user.balance = (parseInt(user.balance) || 0) + amount;
        await user.save();

        console.log(`✅ Đã cộng ${amount}₫ cho user ID ${userId}`);
      } catch (err) {
        console.error('❌ DB Error:', err);
        return res.status(500).send();
      }
    }

    res.status(200).json({ received: true });
  }
}

module.exports = WebhookController;
