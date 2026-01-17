import { headers as getHeaders } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import { Container, Title, Text, Stack, Alert, Group, Badge, Anchor } from '@mantine/core'

import config from '@/payload.config'
import { AvailabilityMatrix } from '../../components/AvailabilityMatrix'
import { VotingForm } from '../../components/VotingForm'
import { ShareLink } from '../../components/ShareLink'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ created?: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const { docs } = await payload.find({
    collection: 'events',
    where: { slug: { equals: slug } },
    limit: 1,
  })

  const event = docs[0]
  if (!event) {
    return { title: 'Événement introuvable' }
  }

  return {
    title: event.name,
    description: event.description || `Votez pour le meilleur moment pour ${event.name}`,
  }
}

export default async function VotingPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { created } = await searchParams
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  // Fetch event by slug
  const { docs: events } = await payload.find({
    collection: 'events',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1, // Include creator info
  })

  const event = events[0]
  if (!event) {
    notFound()
  }

  // Fetch participations for this event
  const { docs: participations } = await payload.find({
    collection: 'event-participations',
    where: { event: { equals: event.id } },
    sort: 'createdAt',
    limit: 1000,
  })

  const isCreator = user && typeof event.creator === 'object' && event.creator?.id === user.id
  const isClosed = Boolean(event.closedAt)

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        {created === 'true' && (
          <Alert color="green" title="Événement créé !">
            Votre événement a été créé. Partagez le lien ci-dessous avec les participants.
          </Alert>
        )}

        <div>
          <Group gap="sm" mb="xs">
            <Title order={1}>{event.name}</Title>
            {isClosed && <Badge color="gray">Fermé</Badge>}
          </Group>
          {event.description && <Text c="dimmed">{event.description}</Text>}
        </div>

        {isCreator && <ShareLink slug={event.slug!} />}

        <AvailabilityMatrix event={event} participations={participations} />

        <VotingForm
          eventId={event.id}
          dateOptions={(event.dateOptions as string[]) || []}
          disabled={isClosed}
        />

        <Text size="sm" c="dimmed">
          {user ? (
            <Anchor href="/events" component={Link}>
              Retour à mes événements
            </Anchor>
          ) : (
            <>
              Vous voulez créer votre propre événement ?{' '}
              <Anchor href="/login" component={Link}>
                Connectez-vous
              </Anchor>
            </>
          )}
        </Text>
      </Stack>
    </Container>
  )
}
