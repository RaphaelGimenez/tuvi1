import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import { Container, Title, Text, Paper, Anchor, Stack } from '@mantine/core'

import config from '@/payload.config'
import { EventForm } from '../../components/EventForm'

export const metadata = {
  title: 'Create Event',
  description: 'Create a new event for scheduling',
}

export default async function NewEventPage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  if (!user) {
    redirect('/login')
  }

  return (
    <Container size="sm" py="xl">
      <Stack gap="lg">
        <div>
          <Title order={1}>Create Event</Title>
          <Text c="dimmed">
            Create a new event and share the link with participants to find the best time.
          </Text>
        </div>

        <Paper p="lg" withBorder>
          <EventForm />
        </Paper>

        <Text size="sm" c="dimmed">
          <Anchor href="/events">Back to my events</Anchor>
        </Text>
      </Stack>
    </Container>
  )
}
