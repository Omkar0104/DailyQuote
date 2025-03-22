require("dotenv").config();
const fs = require("fs");
const twilio = require("twilio");

console.log("Starting the Twilio Quote Sender script...");

// ✅ Log all required environment variables
console.log("TWILIO_ACCOUNT_SID:", process.env.TWILIO_ACCOUNT_SID || "❌ MISSING");
console.log("TWILIO_AUTH_TOKEN:", process.env.TWILIO_AUTH_TOKEN ? "✅ LOADED" : "❌ MISSING");
console.log("TWILIO_WHATSAPP_NUMBER:", process.env.TWILIO_WHATSAPP_NUMBER || "❌ MISSING");
console.log("MY_WHATSAPP_NUMBER:", process.env.MY_WHATSAPP_NUMBER || "❌ MISSING");

// ❌ Exit if required variables are missing
if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_WHATSAPP_NUMBER || !process.env.MY_WHATSAPP_NUMBER) {
  console.error("❌ ERROR: Missing required environment variables. Check your .env file.");
  process.exit(1);
}

// Load Twilio credentials
console.log("Loading Twilio credentials...");
const client = new twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Load quotes from JSON
console.log("Loading quotes from quotes.json...");
let quotes = [];
try {
  const data = fs.readFileSync("quotes.json", "utf8");
  quotes = JSON.parse(data);
  console.log(`✅ Loaded ${quotes.length} quotes.`);
} catch (error) {
  console.error("❌ Error loading quotes.json:", error);
}

// Function to send a random quote
const sendRandomQuote = () => {
  console.log("Selecting a random quote...");
  if (quotes.length === 0) {
    console.error("❌ No quotes available to send.");
    return;
  }

  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  const message = `🌟 *Quote of the Moment* 🌟\n\n"${randomQuote.quote}"\n💡 *Lesson:* ${randomQuote.lesson}`;

  console.log("Sending quote via Twilio...");
  console.log("From:", process.env.TWILIO_WHATSAPP_NUMBER);
  console.log("To:", process.env.MY_WHATSAPP_NUMBER);

  client.messages
    .create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: process.env.MY_WHATSAPP_NUMBER,
      body: message,
    })
    .then((msg) => console.log(`✅ Quote sent successfully! Message ID: ${msg.sid}`))
    .catch((error) => console.error("❌ Error sending message:", error));
};

// Send 4 quotes at equal intervals (every 6 hours)
const interval =  60 * 1000; // 6 hours in milliseconds
let count = 0;
console.log("Starting the interval for sending quotes...");

const intervalID = setInterval(() => {
  console.log(`Sending quote #${count + 1}...`);
  if (count < 4) {
    sendRandomQuote();
    count++;
  } else {
    console.log("✅ Sent 4 quotes, stopping interval.");
    clearInterval(intervalID);
  }
}, interval);
