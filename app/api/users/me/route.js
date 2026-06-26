import { auth, db } from '@/lib/auth'
import { ObjectId } from 'mongodb'

/**
 * GET /api/user/me
 * Fetch current user profile data
 */
export async function GET(req) {
  try {
    // Try to get session from better-auth; fallback to unauthorized
    const session = (auth.api && auth.api.getSession)
      ? await auth.api.getSession({ headers: req.headers })
      : null

    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Attempt to read user record from MongoDB to include any persisted fields
    const usersCol = db.collection('user')
    let userDoc = null
    const uid = session.user.id || session.user._id || session.user.userId
    try {
      // Try ObjectId filter first
      if (ObjectId.isValid(uid)) {
        userDoc = await usersCol.findOne({ _id: new ObjectId(uid) })
      }
    } catch (e) {
      // ignore
    }

    if (!userDoc) {
      // try string id fields
      userDoc = await usersCol.findOne({ id: uid }) || await usersCol.findOne({ userId: uid })
    }

    const resp = {
      success: true,
      _id: uid,
      name: userDoc?.name || session.user.name,
      email: session.user.email,
      image: userDoc?.image || session.user.image || null,
      bio: userDoc?.bio || session.user.bio || '',
      role: userDoc?.role || session.user.role || 'user',
      isPremium: Boolean(userDoc?.isPremium),
      premiumSince: userDoc?.premiumSince || null,
      lessonsCount: userDoc?.lessonsCount || 0,
      favoritesCount: userDoc?.favoritesCount || 0,
    }

    return Response.json(resp)
  } catch (error) {
    console.error('GET /api/users/me error:', error)
    return Response.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/users/me
 * Update current user profile data
 */
export async function PUT(req) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })

    if (!session?.user) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { name, bio, image } = body

    // Validate input
    if (!name || name.length < 2) {
      return Response.json(
        { error: 'Name must be at least 2 characters' },
        { status: 400 }
      )
    }

    if (bio && bio.length > 300) {
      return Response.json(
        { error: 'Bio must be less than 300 characters' },
        { status: 400 }
      )
    }

    // Update user record directly in MongoDB
    const usersCol = db.collection('user')
    const uid = session.user.id || session.user._id || session.user.userId

    // Try multiple filters (ObjectId and string id)
    const filters = []
    try {
      if (ObjectId.isValid(uid)) filters.push({ _id: new ObjectId(uid) })
    } catch (e) {
      // ignore
    }
    filters.push({ id: uid })
    filters.push({ userId: uid })

    // Find first matching filter
    let matchedFilter = null
    for (const f of filters) {
      const found = await usersCol.findOne(f)
      if (found) {
        matchedFilter = f
        break
      }
    }

    if (!matchedFilter) {
      // If no existing user document found, create one using session info
      const insertRes = await usersCol.insertOne({
        id: uid,
        name,
        email: session.user.email,
        image: image || null,
        bio: bio || '',
        role: session.user.role || 'user',
      })
      const newDoc = await usersCol.findOne({ _id: insertRes.insertedId })
      return Response.json({
        _id: newDoc._id,
        name: newDoc.name,
        email: newDoc.email,
        image: newDoc.image,
        bio: newDoc.bio || '',
        role: newDoc.role,
      })
    }

    // Update existing document
    await usersCol.updateOne(matchedFilter, { $set: { name, image: image || null, bio: bio || '' } })
    const updated = await usersCol.findOne(matchedFilter)

    return Response.json({
      _id: updated._id,
      name: updated.name,
      email: updated.email || session.user.email,
      image: updated.image || null,
      bio: updated.bio || '',
      role: updated.role || session.user.role || 'user',
    })
  } catch (error) {
    console.error('PUT /api/users/me error:', error)
    return Response.json(
      { error: 'Failed to update user profile' },
      { status: 500 }
    )
  }
}
