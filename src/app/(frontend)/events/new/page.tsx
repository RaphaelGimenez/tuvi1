import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import { Container, Title, Text, Paper, Anchor, Stack } from '@mantine/core'

import config from '@/payload.config'
import { EventForm } from '../../components/EventForm'
import Link from 'next/link'

export const metadata = {
  title: 'Créer un événement',
  description: 'Créez un nouvel événement pour planifier',
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
          <Title order={1}>Créer un événement</Title>
          <Text c="dimmed">
            Créez un nouvel événement et partagez le lien avec les participants pour trouver le
            meilleur moment.
          </Text>
        </div>

        <Paper p="lg" withBorder>
          <EventForm />
        </Paper>

        <Text size="sm" c="dimmed">
          <Anchor href="/events" component={Link}>
            Retour à mes événements
          </Anchor>
        </Text>
      </Stack>
    </Container>
  )
}
