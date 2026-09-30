const http = require("http");
const { Telegraf, Markup } = require("telegraf");
const QRCode = require("qrcode");

const BOT_TOKEN = process.env.BOT_TOKEN;
const PORT = process.env.PORT || 3000;
const DIRECT_LINK = "https://omg10.com/4/11872948";

if (!BOT_TOKEN) {
  console.error("BOT_TOKEN is missing!");
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

const mainMenu = Markup.inlineKeyboard([
  [Markup.button.callback("🔢 أدوات النصوص", "text_tools")],
  [Markup.button.callback("🔗 أدوات الروابط", "link_tools")],
  [Markup.button.callback("📱 أدوات السوشيال", "social_tools")],
  [Markup.button.callback("📲 QR Code", "qr")],
  [Markup.button.url("🚀 استخدام الخدمة", DIRECT_LINK)]
]);

bot.start(async (ctx) => {
  await ctx.reply(
    "🛠️ أهلاً بك في Smart Tools!\n\n" +
    "مجموعة أدوات مجانية وسريعة للنصوص والروابط ووسائل التواصل الاجتماعي.\n\n" +
    "اختر الأداة التي تريد استخدامها 👇",
    mainMenu
  );
});

bot.action("text_tools", async (ctx) => {
  await ctx.answerCbQuery();

  await ctx.reply(
    "🔢 أدوات النصوص\n\n" +
    "أرسل أي نص وسأحسب لك:\n" +
    "• عدد الكلمات\n" +
    "• عدد الحروف\n" +
    "• عدد الأسطر\n\n" +
    "أرسل النص الآن 👇"
  );
});

bot.action("link_tools", async (ctx) => {
  await ctx.answerCbQuery();

  await ctx.reply(
    "🔗 فحص الرابط\n\n" +
    "أرسل الرابط الذي تريد فحصه."
  );
});

bot.action("social_tools", async (ctx) => {
  await ctx.answerCbQuery();

  await ctx.reply(
    "📱 أدوات السوشيال\n\n" +
    "أرسل موضوع المنشور وسأجهز لك Caption وHashtags مناسبة."
  );
});

bot.action("qr", async (ctx) => {
  await ctx.answerCbQuery();

  await ctx.reply(
    "📲 QR Code\n\n" +
    "أرسل الرابط الذي تريد تحويله إلى QR Code 👇"
  );
});

bot.on("text", async (ctx) => {
  const text = ctx.message.text.trim();

  if (text.startsWith("/")) return;

  // إذا كان المستخدم أرسل رابطًا، أنشئ QR Code
  if (/^https?:\/\/\S+$/i.test(text)) {
    try {
      const buffer = await QRCode.toBuffer(text, {
        width: 800,
        margin: 2
      });

      await ctx.replyWithPhoto(
        { source: buffer },
        { caption: "📲 تم إنشاء QR Code للرابط." }
      );

      return;
    } catch (error) {
      console.error("QR Error:", error);
      await ctx.reply("❌ حدث خطأ أثناء إنشاء QR Code.");
      return;
    }
  }

  // إحصائيات النص
  const words = text.split(/\s+/).filter(Boolean).length;
  const characters = text.length;
  const lines = text.split("\n").length;

  await ctx.reply(
    "📊 إحصائيات النص\n\n" +
    `🔤 الحروف: ${characters}\n` +
    `📝 الكلمات: ${words}\n` +
    `📄 الأسطر: ${lines}`
  );
});

bot.catch((error) => {
  console.error("Bot error:", error);
});

// Web server for Render + Telegram Webhook
const webhookPath = `/telegram/${BOT_TOKEN}`;

const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Smart Tools Bot is running.");
    return;
  }

  if (req.method === "POST" && req.url === webhookPath) {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      try {
        const update = JSON.parse(body);
        await bot.handleUpdate(update);

        res.writeHead(200);
        res.end("OK");
      } catch (error) {
        console.error("Webhook error:", error);
        res.writeHead(500);
        res.end("Error");
      }
    });

    return;
  }

  res.writeHead(404);
  res.end("Not Found");
});

server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  const renderUrl = process.env.RENDER_EXTERNAL_URL;

  if (renderUrl) {
    const webhookUrl = `${renderUrl}${webhookPath}`;

    try {
      await bot.telegram.setWebhook(webhookUrl);
      console.log("Telegram webhook configured.");
    } catch (error) {
      console.error("Webhook setup error:", error);
    }
  } else {
    console.log("RENDER_EXTERNAL_URL not found.");
  }
});
