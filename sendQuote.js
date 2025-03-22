require("dotenv").config();
const fs = require("fs");
const twilio = require("twilio");

// Load Twilio credentials
const client = new twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Load quotes from JSON
const quotes = JSON.parse(fs.readFileSync("quotes.json", "utf8"));

// Function to send a random quote
const sendRandomQuote = () => {
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  const message = `🌟 *Quote of the Moment* 🌟\n\n"${randomQuote.quote}"\n💡 *Lesson:* ${randomQuote.lesson}`;

  client.messages
    .create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: process.env.MY_WHATSAPP_NUMBER,
      body: message,
    })
    .then((msg) => console.log(`Quote sent! ID: ${msg.sid}`))
    .catch((error) => console.error(error));
};

// Send 4 quotes at equal intervals (every 6 hours)
const interval = 2*60 * 60 * 1000; // 6 hours in milliseconds
let count = 0;

const intervalID = setInterval(() => {
  if (count < 30) {
    sendRandomQuote();
    count++;
  } else {
    clearInterval(intervalID); // Stop after sending 4 quotes
  }
}, interval);
