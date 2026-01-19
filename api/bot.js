import { Telegraf, Markup } from "telegraf";

/* =====================
   ENV
===================== */
const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID = Number(process.env.ADMIN_ID);

if (!BOT_TOKEN || !ADMIN_ID) {
  throw new Error("BOT_TOKEN or ADMIN_ID missing");
}

const bot = new Telegraf(BOT_TOKEN);

/* =====================
   IMAGES (CHANGE LATER)
===================== */
const IMAGES = {
  WELCOME: "AgACAgUAAxkBAAIB6GlRL4tNmesNDlZKE-BAuPOfO-fDAAJHC2sbK_2QVnbvKfPgdG7GAQADAgADdwADNgQ",
  MENU: "AgACAgUAAxkBAAIB5mlRLwdG-hn_vIpTaswy-UWhuv_OAAJDC2sbK_2QVoc5iv0BFAFZAQADAgADdwADNgQ",
  BONUS: "AgACAgUAAxkBAAICCmlSBK8KdNEghljYFkwNaFTawWhhAAKvC2sbwmqQVlZpWW1sZJkCAQADAgADdwADNgQ",
  VOUCHER: "AgACAgUAAxkBAAICAmlSAdft_J24YJT_n0iyiJ7khlFuAAKYC2sbwmqQVsOxfj7UvrNZAQADAgADdwADNgQ",
  SUPPORT: "AgACAgUAAxkBAAIB6mlRL_gQr0Jn0rvlrL8OI4WV0A1AAAKqC2sbeyeJVl1st_Bn_iU8AQADAgADdwADNgQ",
  ADMIN_PANEL: "AgACAgUAAxkBAAIB6GlRL4tNmesNDlZKE-BAuPOfO-fDAAJHC2sbK_2QVnbvKfPgdG7GAQADAgADdwADNgQ",
  BROADCAST: "AgACAgUAAxkBAAIB5mlRLwdG-hn_vIpTaswy-UWhuv_OAAJDC2sbK_2QVoc5iv0BFAFZAQADAgADdwADNgQ",
  PREDICTORS: "AgACAgUAAxkBAAICCGlSBGBMSq_-tBKJxLIR0imS0zm-AAKtC2sbeyeJVoBzwZ_rcpXDAQADAgADdwADNgQ"
};
const VIDEOS = {
  WITHDRAW: "BAACAgUAAxkBAAIB8mlR-_vzDdyUn2jSd3zPJt4_YnFxAAKZFwACeyeJVkjbEqiNIURoNgQ",
  SPINS: "BAACAgUAAxkBAAICBGlSApR1BOsJpqQ0tQfhsy5Si2qHAAJjFgACwmqQVhG27zp0VhnqNgQ",
  LUCKY_SPINS: "BAACAgUAAxkBAAICBmlSBBvQPsogCGzLE512cRUMMT3pAAJpFgACwmqQVvTxyCgBNBnINgQ",
  DEPOSIT: "BAACAgUAAxkBAAIB9GlR_M6f8kZ58qdPZzC3Y6NyiBv3AAKVFwACeyeJVnGQJJ9MZmxvNgQ"
};

/* =====================
   MEMORY
===================== */
const openTickets = new Map();
const adminReplyTarget = new Map();
const userTracking = new Map(); // ✅ नया: Users को track करने के लिए
let broadcastMode = new Map(); // ✅ नया: Broadcast mode track करने के लिए

/* =====================
   START
===================== */
bot.start(async (ctx) => {
  const firstName = ctx.from.first_name || "User";
  const userId = ctx.from.id;
  
  // ✅ IMPROVED: Better user tracking
  const userData = {
    id: userId,
    firstName: ctx.from.first_name || "User",
    lastName: ctx.from.last_name || "",
    username: ctx.from.username || "",
    active: true,
    joinedAt: new Date().toISOString(),
    lastSeen: new Date().toISOString()
  };
  
  // Update or add user
  userTracking.set(userId, userData);
  
  await ctx.replyWithPhoto(
    IMAGES.WELCOME,
    {
      caption:
`👋 *WELCOME, ${firstName}!*

You have successfully reached *HACK ZONE SUPPORT* 🛠️  
Our team is here to assist you with all official support-related queries.

━━━━━━━━━━━━━━━━━━
📢 *https://t.me/+rOuALeM_WaQzODU1*
━━━━━━━━━━━━━━━━━━

To continue and access support options, please click the *CONTINUE* button below.

⚠️ *Important Notes:*
• Only trust updates from our official channel  
• Support replies may take some time — please be patient.`,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "▶️ CONTINUE", callback_data: "MENU" }],
          [{ text: "📢 OFFICIAL CHANNEL", url: "https://t.me/hack_zone_ai" }]
        ]
      }
    }
  );
});

/* =====================
   MAIN MENU (EDIT MEDIA)
===================== */
bot.action("MENU", async (ctx) => {
  const isAdmin = ctx.from.id === ADMIN_ID;
  
  const menuButtons = [
    [
      Markup.button.callback("💸 WITHDRAW", "WITHDRAW"),
      Markup.button.callback("💳 DEPOSIT", "DEPOSIT")
    ],
    [
      Markup.button.callback("🎁 BONUS", "BONUS"),
      Markup.button.callback("🎟 VOUCHER", "VOUCHER")
    ],
    [
      Markup.button.callback("🎰 SPINS", "SPINS"),
      Markup.button.callback("🍀 LUCKY DRIVE", "LUCKY_SPINS")
    ],
    [Markup.button.callback("🤖 PREDICTOR BOTS", "PREDICTORS")],
    [Markup.button.callback("🧑‍💻 LIVE SUPPORT", "SUPPORT_OPEN")],
  ];
  
  // ✅ सिर्फ Admin के लिए Admin Panel button add करें
  if (isAdmin) {
    menuButtons.push([Markup.button.callback("🛡️ ADMIN PANEL", "ADMIN_PANEL")]);
  }
  
  menuButtons.push([Markup.button.url("📢 OFFICIAL CHANNEL", "https://t.me/hack_zone_ai")]);
  
  await ctx.editMessageMedia(
    {
      type: "photo",
      media: IMAGES.MENU,
      caption: `❓ *PLEASE SELECT YOUR QUERY*`,
      parse_mode: "Markdown"
    },
    {
      ...Markup.inlineKeyboard(menuButtons)
    }
  );
});

/* =====================
   SUPPORT OPEN
===================== */
bot.action("SUPPORT_OPEN", async (ctx) => {
  openTickets.set(ctx.from.id, true);

  await ctx.editMessageMedia(
    {
      type: "photo",
      media: IMAGES.SUPPORT, // ✅ SUPPORT IMAGE WILL SHOW NOW
      caption:
`👨‍💻 <b>LIVE SUPPORT IS NOW OPEN</b>

<i>You can send your message below.</i>  
<i>Supported formats: Text, Photo, Video.</i>

━━━━━━━━━━━━━━━━━━
📌 <b>WHAT HAPPENS NEXT</b>
━━━━━━━━━━━━━━━━━━
• <i>Your message has been received by our support system</i>  
• <i>A support agent will review your request</i>  
• <i>You will receive a reply as soon as possible</i>

━━━━━━━━━━━━━━━━━━
⚠️ <b>IMPORTANT NOTES</b>
━━━━━━━━━━━━━━━━━━
• <i>Please describe your issue clearly for faster assistance</i>  
• <i>Do not send duplicate messages</i>  
• <i>Response time may vary depending on queue volume</i>

<b>To end this session, click <u>CLOSE TICKET</u>.</b>`,
      parse_mode: "HTML"
    },
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "❌ CLOSE TICKET", callback_data: "SUPPORT_CLOSE" }],
          [{ text: "⬅️ BACK", callback_data: "MENU" }]
        ]
      }
    }
  );
});

/* =====================
   SUPPORT CLOSE
===================== */
bot.action("SUPPORT_CLOSE", async (ctx) => {
  openTickets.delete(ctx.from.id);

  await ctx.editMessageCaption(
    `✅ *YOUR SUPPORT TICKET HAS BEEN CLOSED.*

YOU CAN OPEN A NEW TICKET ANYTIME.`,
    {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        [Markup.button.callback("⬅️ BACK TO MENU", "MENU")],
        [Markup.button.url("📢 OFFICIAL CHANNEL", "https://t.me/hack_zone_ai")]
      ])
    }
  );
});

/* =====================
   ADMIN REPLY BUTTON
===================== */
bot.action(/^ADMIN_REPLY_(\d+)$/, async (ctx) => {
  const userId = Number(ctx.match[1]);
  adminReplyTarget.set(ctx.from.id, userId);

  await ctx.reply(
    `✍️ *TYPE YOUR REPLY FOR USER ID:* ${userId}`,
    {
      parse_mode: "Markdown",
      reply_markup: { force_reply: true }
    }
  );
});

/* =====================
   ADMIN CLOSE TICKET
===================== */
bot.action(/^ADMIN_CLOSE_(\d+)$/, async (ctx) => {
  const userId = Number(ctx.match[1]);

  // Remove ticket from memory
  openTickets.delete(userId);

  // Notify user
  await bot.telegram.sendMessage(
    userId,
`❌ <b>YOUR SUPPORT TICKET HAS BEEN CLOSED BY SUPPORT TEAM</b>

<i>If you need more help, you can open a new ticket anytime.</i>`,
    { parse_mode: "HTML" }
  );

  // Confirm to admin
  await ctx.editMessageText(
    `✅ <b>TICKET CLOSED SUCCESSFULLY</b>\n\nUser ID: <code>${userId}</code>`,
    { parse_mode: "HTML" }
  );
});

/* =====================
   SINGLE MESSAGE HANDLER
===================== */
bot.on("message", async (ctx) => {
  /* ADMIN BROADCAST MESSAGE */
  if (ctx.from.id === ADMIN_ID && broadcastMode.get(ctx.from.id)) {
    const allUsers = Array.from(userTracking.keys());
    let sent = 0;
    let failed = 0;
    
    // Sending notification
    const broadcastMsg = await ctx.reply("⏳ *Sending broadcast...*", { parse_mode: "Markdown" });
    
    // Send to all users
    for (const userId of allUsers) {
      try {
        await ctx.copyMessage(userId);
        sent++;
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        failed++;
        // Mark user as inactive if they blocked the bot
        if (error.description && error.description.includes('blocked')) {
          const user = userTracking.get(userId);
          if (user) {
            user.active = false;
            userTracking.set(userId, user);
          }
        }
      }
    }
    
    // Update broadcast status
    await ctx.telegram.editMessageText(
      ctx.chat.id,
      broadcastMsg.message_id,
      null,
      `✅ *Broadcast Complete*\n\n📩 Sent: ${sent} users\n🚫 Failed: ${failed} users`,
      { parse_mode: "Markdown" }
    );
    
    // Clear broadcast mode
    broadcastMode.delete(ctx.from.id);
    
    // Show admin panel again
    const totalUsers = userTracking.size;
    const activeUsers = Array.from(userTracking.values()).filter(u => u.active).length;
    const inactiveUsers = totalUsers - activeUsers;
    
    await ctx.replyWithPhoto(
      IMAGES.ADMIN_PANEL,
      {
        caption: `🛡️ *ADMIN CONTROL PANEL*\n\n👥 *Total Users: ${totalUsers}*\n✅ *Active Users: ${activeUsers}*\n❌ *Inactive Users: ${inactiveUsers}*`,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "👥 User List", callback_data: "ADMIN_USER_LIST_1" }],
            [{ text: "📢 Broadcast", callback_data: "ADMIN_BROADCAST" }],
            [{ text: "⬅️ Back", callback_data: "MENU" }]
          ]
        }
      }
    );
    return;
  }
  
  /* ADMIN MESSAGE */
  if (ctx.from.id === ADMIN_ID) {
    const targetUser = adminReplyTarget.get(ctx.from.id);
    if (!targetUser) return;

    await ctx.copyMessage(targetUser);
    adminReplyTarget.delete(ctx.from.id);
    return;
  }

  /* USER MESSAGE */
  if (!openTickets.get(ctx.from.id)) return;

  await ctx.copyMessage(ADMIN_ID, {
    caption:
`📩 *NEW SUPPORT MESSAGE*

👤 USER: ${ctx.from.first_name || "USER"}
🆔 ID: ${ctx.from.id}`
  });

  await bot.telegram.sendMessage(
    ADMIN_ID,
    `⚙️ *SELECT ACTION*`,
    {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        [
          Markup.button.callback("✍️ REPLY TO USER", `ADMIN_REPLY_${ctx.from.id}`),
          Markup.button.callback("❌ CLOSE TICKET", `ADMIN_CLOSE_${ctx.from.id}`)
        ]
      ])
    }
  );

  await ctx.reply(
    `✅ *YOUR MESSAGE HAS BEEN SUCCESSFULLY SENT.*

Please be Patient. our support team will reply soon.`,
    { parse_mode: "Markdown" }
  );
});

/* =====================
   INFO SECTIONS (EDIT MEDIA)
===================== */
bot.action("WITHDRAW", (ctx) =>
  ctx.editMessageMedia(
    {
      type: "video",
      media: VIDEOS.WITHDRAW,
      caption:
`💸 *WITHDRAWAL INFORMATION*

━━━━━━━━━━━━━━━━━━
📌 *IMPORTANT WITHDRAWAL RULES*
━━━━━━━━━━━━━━━━━━
• Withdrawal is available only after completing account verification  
• The minimum withdrawal amount depends on the selected payment method  
• Ensure your payment details are correct before submitting a request  

━━━━━━━━━━━━━━━━━━
⏳ *PROCESSING TIME*
━━━━━━━━━━━━━━━━━━
• Crypto / UPI: Usually within 
5–30 minutes  
• Bank transfer: Up to 24 hours

━━━━━━━━━━━━━━━━━━
⚠️ *IMPORTANT NOTICE*
━━━━━━━━━━━━━━━━━━
• Use only your own payment details  
• Do not attempt multiple withdrawals at the same time  
• Any violation of 1win terms may result in withdrawal delay or rejection

_If your withdrawal is pending, please remain patient._

Click *WITHDRAW NOW* to proceed.`,
      parse_mode: "Markdown"
    },
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "💸 WITHDRAW NOW", url: "https://lkxw.cc/6706" }],
          [{ text: "⬅️ BACK", callback_data: "MENU" }],
          [{ text: "📢 OFFICIAL CHANNEL", url: "https://t.me/hack_zone_ai" }]
        ]
      }
    }
  )
);

bot.action("DEPOSIT", (ctx) =>
  ctx.editMessageMedia(
    {
      type: "video",
      media: VIDEOS.DEPOSIT,
      caption: 
`‎💳 *1WIN DEPOSIT INFORMATION*
‎
‎━━━━━━━━━━━━━━━━━━
‎📌 *IMPORTANT DEPOSIT RULES*
‎━━━━━━━━━━━━━━━━━━
‎• Deposits must be made only from your own payment method  
‎• The minimum deposit amount depends on the selected payment option  
‎• Always check the deposit amount before confirming payment 
‎
‎━━━━━━━━━━━━━━━━━━
‎⚡ *DEPOSIT PROCESSING TIME*
‎━━━━━━━━━━━━━━━━━━
‎• UPI / Crypto: Instant to a few minutes  
‎• Bank transfer: May take up to 15–30 minutes 
‎
‎━━━━━━━━━━━━━━━━━━
‎🎁 *BONUS & PROMOCODE*
‎━━━━━━━━━━━━━━━━━━
‎• Enter the correct *promocode* \`SUMSUNG\` during Registration to receive *600% deposit bonuses*  
‎• Bonuses are subject to wagering requirements  
‎• Incorrect or missing promocode may void the bonus
‎
‎━━━━━━━━━━━━━━━━━━
‎⚠️ *IMPORTANT NOTICE*
‎━━━━━━━━━━━━━━━━━━
‎_• Do not close the app or refresh the page during payment  
‎• Save the transaction ID until the balance is credited  
‎• For failed deposits, contact official 1win support only_
‎
‎Click *DEPOSIT NOW* to proceed.`,
      parse_mode: "Markdown"
    },
    {
      ...Markup.inlineKeyboard([
        [Markup.button.url("DEPOSIT NOW", "https://lkxw.cc/6706")],
        [Markup.button.callback("⬅️ BACK", "MENU")],
        [Markup.button.url("📢 OFFICIAL CHANNEL", "https://t.me/hack_zone_ai")]
      ])
    }
  )
);

bot.action("BONUS", (ctx) =>
  ctx.editMessageMedia(
    {
      type: "photo",
      media: IMAGES.BONUS,
      caption: `🎁 *EXCLUSIVE DEPOSIT BONUS*

_Express bonus - when making an express bet with 5 or more events, a percentage of the winning amount is added to the net profit._

Use the special *promocode* \`SUMSUNG\` during registration & deposit to unlock your bonuses.

━━━━━━━━━━━━━━━━━━
💱 *CASHBACK*
━━━━━━━━━━━━━━━━━━
• Cashback up to 30% at the casino - return up to *30%* of your losses per week.
━━━━━━━━━━━━━━━━━━
🎁 *BONUSES*
━━━━━━━━━━━━━━━━━━
• Bonuses up to *500%* - welcome bonuses on the first 4 deposits.

• Bonuses up to *600%* - welcome bonuses for the first 4 deposits in cryptocurrency.

━━━━━━━━━━━━━━━━━━
🎯 *BONUS CODE:* \`SUMSUNG\`
━━━━━━━━━━━━━━━━━━

📌 *IMPORTANT:*
• *Promocode* \`SUMSUNG\` must be entered before confirming the registration or deposit
• Bonus is applicable on eligible deposits only

You can find out more about all promotions and bonuses by following *CLAIM BONUS* button.

_Deposit now and maximize your winning potential._

Click *CLAIM BONUS* to proceed.`,
      parse_mode: "Markdown"
    },
    {
      ...Markup.inlineKeyboard([
        [Markup.button.url("CLAIM BONUS", "https://lkxw.cc/6706")],
        [Markup.button.callback("⬅️ BACK", "MENU")],
        [Markup.button.url("📢 OFFICIAL CHANNEL", "https://t.me/hack_zone_ai")]
      ])
    }
  )
);

bot.action("VOUCHER", async (ctx) => {
  await ctx.answerCbQuery();

  await ctx.editMessageMedia(
    {
      type: "photo",
      media: IMAGES.VOUCHER, // ✅ THIS FIXES THE ISSUE
      caption:
`🎟️ <b>1WIN VOUCHERS & PROMO CODES</b>

<i>Get exclusive 1win voucher codes to boost your balance and maximize rewards.</i>

━━━━━━━━━━━━━━━━━━
📌 <b>HOW TO GET DAILY VOUCHERS</b>
━━━━━━━━━━━━━━━━━━
• Join our <a href="https://t.me/hack_zone_ai"><b>Official Telegram Channel</b></a>  
• Daily voucher codes are shared only in the channel  
• Vouchers are limited and available for a short time  
• Codes are valid for eligible users only  

━━━━━━━━━━━━━━━━━━
⚠️ <b>IMPORTANT NOTICE</b>
━━━━━━━━━━━━━━━━━━
• Vouchers are provided by <a href="https://t.me/hack_zone_ai"><b>Official Channel</b></a> sources only  
• Each voucher may have specific terms and conditions  
• Expired or already-used vouchers cannot be reused  

Join the <a href="https://t.me/hack_zone_ai"><b>Official Channel</b></a> now to receive daily voucher codes.

Click <b>GET VOUCHER</b> to proceed.`,
      parse_mode: "HTML"
    },
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "🎟️ GET VOUCHER", url: "https://t.me/hack_zone_ai" }],
          [{ text: "⬅️ BACK", callback_data: "MENU" }],
          [{ text: "📢 OFFICIAL CHANNEL", url: "https://t.me/hack_zone_ai" }]
        ]
      }
    }
  );
});

bot.action("SPINS", async (ctx) => {
  await ctx.answerCbQuery();

  await ctx.editMessageMedia(
    {
      type: "video",
      media: VIDEOS.SPINS,
      caption:
`🎰 <b>FREE SPINS OFFER</b>

<i>Get free spins and increase your winning chances instantly.</i>

━━━━━━━━━━━━━━━━━━
📌 <b>HOW IT WORKS</b>
━━━━━━━━━━━━━━━━━━
• Login / Register your account  
• Make an eligible deposit  
• Free spins will be credited automatically  

━━━━━━━━━━━━━━━━━━
⚠️ <b>IMPORTANT</b>
━━━━━━━━━━━━━━━━━━
• Spins are subject to wagering rules  
• Valid for selected games only  
• One offer per user

Click <b>GET SPINS</b> to continue.`,
      parse_mode: "HTML"
    },
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "🎰 GET SPINS", url: "https://lkxw.cc/6706" }],
          [{ text: "⬅️ BACK", callback_data: "MENU" }],
          [{ text: "📢 OFFICIAL CHANNEL", url: "https://t.me/hack_zone_ai" }]
        ]
      }
    }
  );
});

bot.action("LUCKY_SPINS", async (ctx) => {
  await ctx.answerCbQuery();

  await ctx.editMessageMedia(
    {
      type: "video",
      media: VIDEOS.LUCKY_SPINS,
      caption: `🍀 <b>LUCKY DRIVE 🎫 Pull a Lucky Ticket & Win Big!</b>

<i>Every day, more 1win players are turning their luck into reality —
driving away in brand-new supercars and enjoying a luxury lifestyle.</i>

How? By collecting Golden Tickets in the Free Money section and participating in the Lucky Drive.

━━━━━━━━━━━━━━━━━━
🚗 <b>Lucky Drive – Season Rewards</b>
━━━━━━━━━━━━━━━━━━
• 🏆 Grand Prize  
• Porsche GT3 RS  
• Exclusive spin rewards  
• Limited-time event  

━━━━━━━━━━━━━━━━━━
⚠️ <b>Premium Additional Prizes</b>
━━━━━━━━━━━━━━━━━━
• iPhone 17 Pro Max  
• MacBook Pro 14" (M3)  
• AirPods Max  

━━━━━━━━━━━━━━━━━━
🎰 <b>Bonus for Participants</b>
━━━━━━━━━━━━━━━━━━
• Free Spins for everyone who collects 7 or more tickets  

━━━━━━━━━━━━━━━━━━
⚠️ <b>Participation Requirement</b>
━━━━━━━━━━━━━━━━━━
To take part in the Lucky Drive, your account must have at least one deposit of $10 or more.

🎫 Collect tickets. Increase your chances. Drive away with luxury.

Click <b>TRY YOUR LUCK</b> now.`,
      parse_mode: "HTML"
    },
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "🍀 TRY YOUR LUCK", url: "https://lkxw.cc/6706" }],
          [{ text: "⬅️ BACK", callback_data: "MENU" }],
          [{ text: "📢 OFFICIAL CHANNEL", url: "https://t.me/hack_zone_ai" }]
        ]
      }
    }
  );
});

/* =====================
   PREDICTOR BOTS
===================== */
bot.action("PREDICTORS", (ctx) =>
  ctx.editMessageMedia(
    {
      type: "photo",
      media: IMAGES.PREDICTORS,
      caption: `🤖 *Boost your earnings by using the Predictor & Hack bots below and increase your winning chances*.`,
      parse_mode: "Markdown"
    },
    {
      ...Markup.inlineKeyboard([
        [Markup.button.url("✈️ AVIATOR HACK", "https://t.me/aviator_predict_vipbot?start=ar1465380042")],
        [Markup.button.url("💣 MINES HACK", "https://t.me/Mines_hacke_bot?start=ar1465380042")],
        [Markup.button.url("👑 KING THIMBLES", "https://t.me/King_thimblesbot?start=ar1465380042")],
        [Markup.button.callback("⬅️ BACK", "MENU")],
        [Markup.button.url("📢 OFFICIAL CHANNEL", "https://t.me/hack_zone_ai")]
      ])
    }
  )
);

/* =====================
   ADMIN PANEL FEATURES
===================== */
bot.action("ADMIN_PANEL", async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;
  
  const totalUsers = userTracking.size;
  const activeUsers = Array.from(userTracking.values()).filter(u => u.active).length;
  const inactiveUsers = totalUsers - activeUsers;
  
  await ctx.editMessageMedia(
    {
      type: "photo",
      media: IMAGES.ADMIN_PANEL,
      caption: `🛡️ *ADMIN CONTROL PANEL*\n\n👥 *Total Users: ${totalUsers}*\n✅ *Active Users: ${activeUsers}*\n❌ *Inactive Users: ${inactiveUsers}*`,
      parse_mode: "Markdown"
    },
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "👥 User List", callback_data: "ADMIN_USER_LIST_1" }],
          [{ text: "📢 Broadcast", callback_data: "ADMIN_BROADCAST" }],
          [{ text: "⬅️ Back", callback_data: "MENU" }]
        ]
      }
    }
  );
});

// ✅ USER LIST WITH PAGINATION
bot.action(/^ADMIN_USER_LIST_(\d+)$/, async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;
  
  const page = parseInt(ctx.match[1]);
  const usersPerPage = 5;
  const allUsers = Array.from(userTracking.values());
  const totalPages = Math.ceil(allUsers.length / usersPerPage);
  const startIdx = (page - 1) * usersPerPage;
  const endIdx = startIdx + usersPerPage;
  const pageUsers = allUsers.slice(startIdx, endIdx);
  
  // ✅ NEW: Better formatting
  let caption = `👥 *USER LIST (Page ${page}/${totalPages})*\n`;
  caption += `👤 *Total Users:* ${allUsers.length}\n\n`;
  
  // Create buttons array
  const buttons = pageUsers.map(user => [
    {
      text: `${user.active ? '✅' : '❌'} ${user.firstName} (${user.id})`,
      callback_data: `ADMIN_USER_DETAILS_${user.id}_${page}`
    }
  ]);
  
  // Pagination buttons
  const paginationButtons = [];
  if (page > 1) {
    paginationButtons.push({ text: "◀️ Previous", callback_data: `ADMIN_USER_LIST_${page - 1}` });
  }
  if (page < totalPages) {
    paginationButtons.push({ text: "Next ▶️", callback_data: `ADMIN_USER_LIST_${page + 1}` });
  }
  
  if (paginationButtons.length > 0) {
    buttons.push(paginationButtons);
  }
  
  buttons.push([{ text: "⬅️ Back to Admin Panel", callback_data: "ADMIN_PANEL" }]);
  
  await ctx.editMessageCaption(
    caption,
    {
      parse_mode: "Markdown",
      reply_markup: { inline_keyboard: buttons }
    }
  );
});

// ✅ USER DETAILS
bot.action(/^ADMIN_USER_DETAILS_(\d+)_(\d+)$/, async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;
  
  const userId = parseInt(ctx.match[1]);
  const page = parseInt(ctx.match[2]);
  const user = userTracking.get(userId);
  
  if (!user) {
    await ctx.answerCbQuery("User not found!");
    return;
  }
  
  await ctx.editMessageCaption(
`👤 *USER DETAILS*\n\n👤: ${user.firstName} ${user.lastName}\n🆔: ${user.id}\n👤: @${user.username || 'No username'}\nStatus: ${user.active ? '✅ ACTIVE' : '❌ INACTIVE'}`,
    {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "📩 MSG", callback_data: `ADMIN_USER_MSG_${userId}` },
            { text: "👁️ VIEW", url: `tg://user?id=${userId}` }
          ],
          [{ text: "⬅️ Back to List", callback_data: `ADMIN_USER_LIST_${page}` }]
        ]
      }
    }
  );
});

// ✅ ADMIN SEND MESSAGE TO USER
bot.action(/^ADMIN_USER_MSG_(\d+)$/, async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;
  
  const userId = parseInt(ctx.match[1]);
  adminReplyTarget.set(ctx.from.id, userId);
  
  await ctx.editMessageCaption(
    `✍️ *TYPE YOUR MESSAGE FOR USER*\n\nUser ID: \`${userId}\`\n\nSend text, photo, or video with caption.`,
    {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "❌ Cancel", callback_data: `ADMIN_USER_DETAILS_${userId}_1` }]
        ]
      }
    }
  );
});

// ✅ ADMIN BROADCAST INIT
bot.action("ADMIN_BROADCAST", async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;
  
  broadcastMode.set(ctx.from.id, true);
  
  await ctx.editMessageMedia(
    {
      type: "photo",
      media: IMAGES.BROADCAST,
      caption: `📢 *BROADCAST MESSAGE*\n\nType message to send to *ALL users*.\n\nClick *CANCEL* to abort.`,
      parse_mode: "Markdown"
    },
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "❌ CANCEL", callback_data: "ADMIN_BROADCAST_CANCEL" }]
        ]
      }
    }
  );
});

// ✅ ADMIN BROADCAST CANCEL
bot.action("ADMIN_BROADCAST_CANCEL", async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;
  
  broadcastMode.delete(ctx.from.id);
  await ctx.answerCbQuery("Broadcast cancelled!");
  
  // वापस Admin Panel पर जाएं
  const totalUsers = userTracking.size;
  const activeUsers = Array.from(userTracking.values()).filter(u => u.active).length;
  const inactiveUsers = totalUsers - activeUsers;
  
  await ctx.editMessageMedia(
    {
      type: "photo",
      media: IMAGES.ADMIN_PANEL,
      caption: `🛡️ *ADMIN CONTROL PANEL*\n\n👥 *Total Users: ${totalUsers}*\n✅ *Active Users: ${activeUsers}*\n❌ *Inactive Users: ${inactiveUsers}*`,
      parse_mode: "Markdown"
    },
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "👥 User List", callback_data: "ADMIN_USER_LIST_1" }],
          [{ text: "📢 Broadcast", callback_data: "ADMIN_BROADCAST" }],
          [{ text: "⬅️ Back", callback_data: "MENU" }]
        ]
      }
    }
  );
});

/* =====================
   VERCEL HANDLER
===================== */
export default async function handler(req, res) {
  try {
    await bot.handleUpdate(req.body);
  } catch (e) {
    console.error(e);
  }
  res.status(200).send("OK");
}
