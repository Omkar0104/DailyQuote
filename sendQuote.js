require("dotenv").config();
const fs = require("fs");
const twilio = require("twilio");

console.log("Starting the Twilio Quote Sender script...");

// ✅ Log environment variables
console.log("TWILIO_ACCOUNT_SID:", process.env.TWILIO_ACCOUNT_SID || "❌ MISSING");
console.log("TWILIO_AUTH_TOKEN:", process.env.TWILIO_AUTH_TOKEN ? "✅ LOADED" : "❌ MISSING");
console.log("TWILIO_WHATSAPP_NUMBER:", process.env.TWILIO_WHATSAPP_NUMBER || "❌ MISSING");
console.log("MY_WHATSAPP_NUMBER:", process.env.MY_WHATSAPP_NUMBER || "❌ MISSING");

// ❌ Exit if missing credentials
if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_WHATSAPP_NUMBER || !process.env.MY_WHATSAPP_NUMBER) {
  console.error("❌ ERROR: Missing required environment variables. Check your .env file.");
  process.exit(1);
}

// Load Twilio client
const client = new twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Load quotes
console.log("Loading quotes from quotes.json...");
let quotes = [];
try {
  const data = fs.readFileSync("quotes.json", "utf8");
  quotes = JSON.parse(data);
  console.log(`✅ Loaded ${quotes.length} quotes.`);
} catch (error) {
  console.error("❌ Error loading quotes.json:", error);
}

// Track sent quotes
const SENT_QUOTES_FILE = "sentQuotes.json";

const loadSentQuotes = () => {
  try {
    const data = fs.readFileSync(SENT_QUOTES_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return []; // If file doesn't exist, return empty array
  }
};

const saveSentQuotes = (sentQuotes) => {
  fs.writeFileSync(SENT_QUOTES_FILE, JSON.stringify(sentQuotes, null, 2), "utf8");
};

// Function to send a unique quote each day
const sendRandomQuote = () => {
  console.log("Selecting a random quote...");

  let sentQuotes = loadSentQuotes();

  // Reset the list if all quotes have been sent
  if (sentQuotes.length >= quotes.length) {
    console.log("🔄 All quotes sent! Resetting for a new cycle.");
    sentQuotes = [];
  }

  // Filter out already sent quotes
  const remainingQuotes = quotes.filter(q => !sentQuotes.includes(q.quote));

  if (remainingQuotes.length === 0) {
    console.error("❌ No new quotes available to send.");
    return;
  }

  // Pick a new random quote
  const randomQuote = remainingQuotes[Math.floor(Math.random() * remainingQuotes.length)];

  const message = `🌟 *Quote of the Moment* 🌟\n\n"${randomQuote.quote}"\n\n💡 *Lesson:* ${randomQuote.lesson}`;

  console.log("Sending quote via Twilio...");
  console.log("From:", process.env.TWILIO_WHATSAPP_NUMBER);
  console.log("To:", process.env.MY_WHATSAPP_NUMBER);

  client.messages
    .create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: process.env.MY_WHATSAPP_NUMBER,
      body: message,
    })
    .then((msg) => {
      console.log(`✅ Quote sent successfully! Message ID: ${msg.sid}`);

      // Store the sent quote
      sentQuotes.push(randomQuote.quote);
      saveSentQuotes(sentQuotes);
    })
    .catch((error) => console.error("❌ Error sending message:", error));
};

// Start sending quotes every 3 hours
const interval = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
console.log("Starting the interval for sending quotes...");

setInterval(() => {
  console.log("Sending a new quote...");
  sendRandomQuote();
}, interval);
