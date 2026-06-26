import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is missing");
}

console.log(process.env.MONGODB_URI);
const client = new MongoClient(uri);

await client.connect();

const db = client.db("life-lessons");

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },

  user: {
    additionalFields: {
      role: {
        default: "user",
        type: "string",
      },
      isPremium: {
        default: false,
        type: "boolean",
      },
      premiumSince: {
        default: null,
        type: "string",
        nullable: true,
      },
    },
  },

  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
});

export { client, db };