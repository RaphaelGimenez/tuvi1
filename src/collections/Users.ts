import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  access: {
    admin: ({ req: { user } }) => {
      return user?.roles?.includes('admin') || false
    },
  },
  fields: [
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      options: ['admin', 'user'],
      defaultValue: ['user'],
      required: true,
      saveToJWT: true,
      access: {
        create: () => false,
        update: () => false,
      },
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, req, operation }) => {
        if (operation === 'create' && data) {
          // Check if this is the first user
          const users = await req.payload.count({
            collection: 'users',
          })

          if (users.totalDocs === 0) {
            // First user is admin
            data.roles = ['admin']
          } else {
            // All subsequent users are regular users
            data.roles = ['user']
          }
        }
        return data
      },
    ],
  },
  endpoints: [
    {
      path: '/register',
      method: 'post',
      handler: async (req) => {
        if (!req.json) {
          return Response.json({ message: 'Invalid request' }, { status: 400 })
        }
        const data = await req.json()
        const { email, password } = data

        // Validate input
        if (!email || !password) {
          return Response.json({ message: 'Email and password are required' }, { status: 400 })
        }

        try {
          // Create user using Local API
          const newUser = await req.payload.create({
            collection: 'users',
            data: {
              email,
              password,
              roles: ['user'],
            },
          })

          // Log the user in automatically
          const loginResult = await req.payload.login({
            collection: 'users',
            data: {
              email,
              password,
            },
          })

          return Response.json(
            {
              message: 'User created successfully',
              user: {
                id: newUser.id,
                email: newUser.email,
              },
              token: loginResult.token,
            },
            {
              status: 201,
            },
          )
        } catch (error: any) {
          console.error('Registration error:', error)

          // Handle duplicate email error
          if (error.message?.includes('duplicate') || error.message?.includes('E11000')) {
            return Response.json({ message: 'Email already exists' }, { status: 409 })
          }

          return Response.json({ message: error.message || 'Registration failed' }, { status: 500 })
        }
      },
    },
  ],
}
