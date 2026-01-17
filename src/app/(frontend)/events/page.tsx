import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import Link from 'next/link'
import { Container, Title, Text, Paper, Stack, Group, Button, Badge, Anchor } from '@mantine/core'
import dayjs from 'dayjs'
import 'dayjs/locale/fr'

dayjs.locale('fr')

import config from '@/payload.config'

export const metadata = {
  title: 'Mes événements',
  description: 'Consultez et gérez vos événements',
}

export default async function EventsPage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  if (!user) {
    redirect('/login')
  }

  const { docs: events } = await payload.find({
    collection: 'events',
    where: { creator: { equals: user.id } },
    sort: '-createdAt',
    user,
    overrideAccess: false,
  })

  return (
    <Container size="md" py="xl">
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <div>
            <Title order={1}>Mes événements</Title>
            <Text c="dimmed">Les événements que vous avez créés</Text>
          </div>
          <Button component={Link} href="/events/new">
            Créer un événement
          </Button>
        </Group>

        {events.length === 0 ? (
          <Paper p="xl" withBorder ta="center">
            <Text c="dimmed" mb="md">
              Vous n&apos;avez pas encore créé d&apos;événement.
            </Text>
            <Button component={Link} href="/events/new">
              Créer votre premier événement
            </Button>
          </Paper>
        ) : (
          <Stack gap="md">
            {events.map((event) => (
              <Paper key={event.id} p="md" withBorder>
                <Group justify="space-between" align="flex-start">
                  <div>
                    <Group gap="xs" mb="xs">
                      <Anchor component={Link} href={`/e/${event.slug}`} fw={500}>
                        {event.name}
                      </Anchor>
                      {event.closedAt && <Badge color="gray">Fermé</Badge>}
                    </Group>
                    {event.description && (
                      <Text size="sm" c="dimmed" lineClamp={2}>
                        {event.description}
                      </Text>
                    )}
                    <Text size="xs" c="dimmed" mt="xs">
                      Créé le {dayjs(event.createdAt).format('D MMMM YYYY')} •{' '}
                      {Array.isArray(event.dateOptions) ? event.dateOptions.length : 0} options de
                      date
                    </Text>
                  </div>
                  <Button component={Link} href={`/e/${event.slug}`} variant="light" size="sm">
                    Voir
                  </Button>
                </Group>
              </Paper>
            ))}
          </Stack>
        )}

        <Text size="sm" c="dimmed">
          <Anchor href="/" component={Link}>
            Retour à l&apos;accueil
          </Anchor>
        </Text>
      </Stack>
    </Container>
  )
}
