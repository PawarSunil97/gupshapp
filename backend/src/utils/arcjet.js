
import arcjet, { detectBot, shield, slidingWindow } from "@arcjet/node";
import { ENV } from "../../Env.js";
const isDev = ENV.NODE_ENV !== "production";
const aj = arcjet({
  key: ENV.ARCJET_KEY, // Get your site key from https://app.arcjet.com
  rules: [
    // Shield protects your app from common attacks e.g. SQL injection
    shield({ mode: "LIVE" }),
    // Create a bot detection rule
    detectBot({
      mode: "LIVE", // Blocks requests. Use "DRY_RUN" to log only
      // Block all bots except the following
      allow: isDev
        ? [
            "CATEGORY:SEARCH_ENGINE",
            "USER_AGENT:POSTMAN", // allow Postman in development
          ]
        : ["CATEGORY:SEARCH_ENGINE"],
    }),
    // Create a token bucket rate limit. Other algorithms are supported.
   slidingWindow({
     mode: "LIVE", // Blocks requests. Use "DRY_RUN" to log only
     max: 100, // Max 100 requests
     interval: 60, // Per 60 seconds
    }),
  ],
});
export default aj;