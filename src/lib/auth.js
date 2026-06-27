import { betterAuth } from 'better-auth'
import { mongodbAdapter } from 'better-auth/adapters/mongodb'
import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI

// If no DB URI is present (e.g. during a build on Vercel without runtime envs)
// export a safe stub for `auth` and `db` so imports don't crash the build.
if (!uri) {
  console.warn('MONGODB_URI is missing — exporting stub auth and db for build-time')

  const noopCollection = () => ({
    findOne: async () => null,
    insertOne: async () => ({ insertedId: null }),
    updateOne: async () => ({}),
  })

  export const client = null
  export const db = { collection: noopCollection }

  export const auth = {
    api: {
      // During build we don't have a session; return null safely.
      getSession: async () => null,
    },
  }

} else {
  // Normal runtime: initialize Mongo client and better-auth
  const client = new MongoClient(uri)

  // Connect lazily and catch connection errors to avoid crashing the import during build
  let connected = false
  async function ensureConnected() {
    if (!connected) {
      try {
        await client.connect()
        connected = true
      } catch (err) {
        console.error('Failed to connect to MongoDB:', err)
        // rethrow so runtime code that actually needs DB can handle it
        throw err
      }
    }
  }

  const db = client.db('life-lessons')

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
          default: 'user',
          type: 'string',
        },
        isPremium: {
          default: false,
          type: 'boolean',
        },
        premiumSince: {
          default: null,
          type: 'string',
          nullable: true,
        },
      },
    },

    socialProviders: {
      google: {
        prompt: 'select_account',
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      },
    },
  })

  export { client, db, ensureConnected }
}