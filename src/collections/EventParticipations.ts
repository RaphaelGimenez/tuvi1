import type { CollectionConfig } from 'payload'

export const EventParticipations: CollectionConfig = {
  slug: 'event-participations',
  admin: {
    useAsTitle: 'participantName',
    defaultColumns: ['participantName', 'event', 'createdAt'],
  },
  access: {
    read: () => true,
    create: () => true, // Anonymous voting allowed
    update: () => false, // No updates allowed
    delete: () => false, // No deletes allowed
  },
  fields: [
    {
      name: 'event',
      type: 'relationship',
      relationTo: 'events',
      required: true,
      index: true,
    },
    {
      name: 'participantName',
      type: 'text',
      required: true,
      maxLength: 100,
    },
    {
      name: 'selectedDates',
      type: 'json',
      required: true,
      admin: {
        description: 'Array of ISO date strings the participant selected',
      },
    },
    {
      name: 'comment',
      type: 'textarea',
      maxLength: 500,
    },
  ],
  timestamps: true,
}
