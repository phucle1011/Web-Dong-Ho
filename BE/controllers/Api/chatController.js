const { Op } = require("sequelize");
const Product = require("../../models/productsModel");
const ProductVariant = require("../../models/productVariantsModel");
const PromotionProduct = require("../../models/promotionProductsModel");
const Promotion = require("../../models/promotionsModel");
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GROQ_API_KEY);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function isWatchRelated(prompt) {
  const keywords = [
    "đồng hồ", "watch", "chopard", "rolex", "giảm giá",
    "bảo hành", "còn hàng", "mẫu", "sản phẩm", "giá",
    "khuyến mãi", "chi tiết", "mua", "hình ảnh", "tình trạng"
  ];
  return keywords.some(keyword => prompt.toLowerCase().includes(keyword));
}

class ChatController {
  static async chatWithGemini(req, res) {
    try {
      const { prompt, history = [] } = req.body;
      if (!prompt) return res.status(400).json({ error: "Prompt is required" });

      const vietnamesePrompt = `Bạn là chatbot hỗ trợ cho website bán đồng hồ. Chỉ trả lời các nội dung liên quan đến sản phẩm đồng hồ, khuyến mãi, bảo hành. Nếu nội dung không phù hợp, hãy nói: "Xin lỗi, tôi chỉ có thể hỗ trợ các thông tin liên quan đến sản phẩm đồng hồ trên website." \n\n${prompt}`;

      const matchedProducts = await Product.findAll({
        where: {
          name: { [Op.like]: `%${prompt}%` },
          status: 1,
          publication_status: "published"
        },
        include: [
          {
            model: ProductVariant,
            as: "variants",
            include: [
              {
                model: PromotionProduct,
                as: "promotionProducts",
                include: [
                  {
                    model: Promotion,
                    as: "promotion",
                    where: {
                      status: "active",
                      start_date: { [Op.lte]: new Date() },
                      end_date: { [Op.gte]: new Date() },
                    },
                    required: false
                  }
                ],
                required: false
              }
            ]
          }
        ],
        limit: 5
      });

      if (matchedProducts.length === 0 && !isWatchRelated(prompt)) {
        return res.json({
          reply: "Xin lỗi bạn nhé, mình chưa hiểu ý câu hỏi vừa rồi. Bạn có thể nói lại chi tiết hơn không ạ?",
          products: []
        });
      }

      if (matchedProducts.length > 0) {
        const result = matchedProducts.map(product => {
          const variant = product.variants[0];
          const promo = variant?.promotionProducts?.[0]?.promotion;
          const price = parseFloat(variant?.price || 0);
          let finalPrice = price;

          if (promo) {
            if (promo.discount_type === "percentage") {
              finalPrice = price * (1 - promo.discount_value / 100);
            } else if (promo.discount_type === "fixed") {
              finalPrice = price - promo.discount_value;
            }
          }

          return {
            id: product.id,
            name: product.name,
            thumbnail: product.thumbnail,
            price,
            final_price: promo ? parseFloat(finalPrice.toFixed(2)) : null,
            promotion: promo ? {
              discount_type: promo.discount_type,
              discount_value: promo.discount_value
            } : null
          };
        });

        return res.json({
          reply: `Tôi tìm thấy ${result.length} sản phẩm liên quan đến yêu cầu của bạn.`,
          products: result
        });
      }

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const chatSession = model.startChat({
        generationConfig: {
          temperature: 0.7,
          topK: 1,
          topP: 1,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
          },
        ],
        history: [
          {
            role: "user",
            parts: [{ text: "Bạn luôn trả lời bằng tiếng Việt." }],
          },
          ...history.map((item) => ({
            role: item.isBot ? "model" : "user",
            parts: [{ text: item.text }],
          })),
        ],
      });

      let result;
      let retries = 0;
      const maxRetries = 3;

      while (retries < maxRetries) {
        try {
          result = await chatSession.sendMessage(vietnamesePrompt);
          break;
        } catch (err) {
          if (err.message.includes("503") && retries < maxRetries - 1) {
            retries++;
            console.warn(`Gemini overloaded, retry ${retries} after 2s...`);
            await sleep(2000);
          } else {
            throw err;
          }
        }
      }

      const response = await result.response.text();
      return res.json({
        reply: response || "Không có phản hồi từ Gemini.",
        products: []
      });
    } catch (error) {
      console.error("Gemini API Error:", error?.response?.data || error.message);
      res.status(500).json({
        reply: "Lỗi từ server Gemini.",
        detail: error?.response?.data || error.message,
        products: []
      });
    }
  }
}

module.exports = ChatController;
