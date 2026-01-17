import { headers as getHeaders } from 'next/headers.js'
import Link from 'next/link'
import { getPayload } from 'payload'
import {
  Container,
  Title,
  Text,
  Button,
  Stack,
  Group,
  Paper,
  SimpleGrid,
  ThemeIcon,
  Anchor,
} from '@mantine/core'

import config from '@/payload.config'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <div style={{ textAlign: 'center' }}>
          <Title order={1} mb="sm">
            Trouvez le meilleur moment
          </Title>
          <Text size="lg" c="dimmed" maw={500} mx="auto">
            Créez un événement, partagez le lien et laissez les participants voter sur leurs
            disponibilités.
          </Text>
        </div>

        <Group justify="center" gap="md">
          {user ? (
            <Button component={Link} href="/events/new" size="lg">
              Créer un événement
            </Button>
          ) : (
            <Button component={Link} href="/login" size="lg">
              Connectez-vous pour créer un événement
            </Button>
          )}
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg" mt="xl">
          <Paper p="lg" withBorder>
            <Stack gap="xs">
              <ThemeIcon size="lg" variant="light" color="pink">
                1
              </ThemeIcon>
              <Text fw={500}>Créer un événement</Text>
              <Text size="sm" c="dimmed">
                Configurez votre événement avec un nom, une description et les dates disponibles.
              </Text>
            </Stack>
          </Paper>

          <Paper p="lg" withBorder>
            <Stack gap="xs">
              <ThemeIcon size="lg" variant="light" color="grape">
                2
              </ThemeIcon>
              <Text fw={500}>Partager le lien</Text>
              <Text size="sm" c="dimmed">
                Envoyez le lien unique aux participants. Aucune inscription requise pour voter.
              </Text>
            </Stack>
          </Paper>

          <Paper p="lg" withBorder>
            <Stack gap="xs">
              <ThemeIcon size="lg" variant="light" color="violet">
                3
              </ThemeIcon>
              <Text fw={500}>Trouver le meilleur moment</Text>
              <Text size="sm" c="dimmed">
                Consultez le tableau des disponibilités et choisissez la date qui convient à tous.
              </Text>
            </Stack>
          </Paper>
        </SimpleGrid>

        <Text ta="center" size="sm" c="dimmed" mt="xl">
          <Anchor href={payloadConfig.routes?.admin || '/admin'} c="dimmed" component={Link}>
            Panneau d&apos;administration
          </Anchor>
        </Text>
      </Stack>
    </Container>
  )
}
