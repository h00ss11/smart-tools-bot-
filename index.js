const { Telegraf, Markup } = require("telegraf");
const QRCode = require("qrcode");

const bot = new Telegraf(process.env.BOT_TOKEN);

const mainMenu = Markup.inlineKeyboard([
  [Markup.button.callback("🔢 أدوات النصوص", "text_tools")],
  [Markup.button.callback("🔗 أدوات الروابط", "link_tools")],
  [Markup.button.callback("📱 أدوات السوشيال", "social_tools")],
  [Markup.button.callback("📲 QR Code", "qr")],
  [Markup.button.url("🚀 استخدام الخدمة", "https://example.com")]
]);

bot.start((ctx) => {
  ctx.reply(
    "🛠️ أهلاً بك في Smart Tools!\n\n" +
    "مجموعة أدوات مجانية وسريعة للنصوص والروابط والسوشيال ميديا.\n\n" +
    "اختر الأداة التي تريد استخدامها 👇",
    mainMenu
  );
});

bot.action("text_tools", async (ctx) => {
  await ctx.answerCbQuery();
  ctx.reply(
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
  ctx.reply(
    "🔗 فحص الرابط\n\n" +
    "أرسل الرابط الذي تريد فحصه."
  );
});

bot.action("social_tools", async (ctx) => {
  await ctx.answerCbQuery();
  ctx.reply(
    "📱 أدوات السوشيال\n\n" +
    "أرسل موضوع المنشور وسنجهز لك Caption وHashtags."
  );
});

bot.action("qr", async (ctx) => {
  await ctx.answerCbQuery();
  ctx.reply("📲 أرسل الرابط الذي تريد تحويله إلى QR Code 👇");
});

bot.on("text", async (ctx) => {
  const text = ctx.message.text.trim();

  if (text.startsWith("/")) return;

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
      console.error(error);
    }
  }

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

bot.launch();

console.log("Smart Tools Bot is running...");
