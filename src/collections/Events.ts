import type { CollectionConfig } from 'payload'
import { nanoid } from 'nanoid'

export const Events: CollectionConfig = {
  slug: 'events',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'creator', 'createdAt'],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user }, data }) => {
      if (!user) return false
      return { creator: { equals: user.id } }
    },
    delete: ({ req: { user } }) => {
      if (!user) return false
      return { creator: { equals: user.id } }
    },
  },
  hooks: {
    beforeValidate: [
      ({ data, operation, req }) => {
        if (operation === 'create' && data) {
          if (!data.slug) {
            data.slug = nanoid(12)
          }
          if (!data.creator && req.user) {
            data.creator = req.user.id
          }
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      maxLength: 200,
    },
    {
      name: 'description',
      type: 'textarea',
      maxLength: 2000,
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        readOnly: true,
        description: 'Auto-generated unique identifier for sharing',
      },
    },
    {
      name: 'dateOptions',
      type: 'json',
      required: true,
      admin: {
        description: 'Array of ISO date strings representing available dates',
      },
    },
    {
      name: 'creator',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'closedAt',
      type: 'date',
      admin: {
        description: 'When set, voting is closed',
      },
    },
  ],
  timestamps: true,
}
