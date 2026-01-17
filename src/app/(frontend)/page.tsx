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
            Find the Best Time
          </Title>
          <Text size="lg" c="dimmed" maw={500} mx="auto">
            Create an event, share the link, and let participants vote on their availability.
          </Text>
        </div>

        <Group justify="center" gap="md">
          {user ? (
            <Button component={Link} href="/events/new" size="lg">
              Create Event
            </Button>
          ) : (
            <Button component={Link} href="/login" size="lg">
              Sign In to Create Event
            </Button>
          )}
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg" mt="xl">
          <Paper p="lg" withBorder>
            <Stack gap="xs">
              <ThemeIcon size="lg" variant="light" color="blue">
                1
              </ThemeIcon>
              <Text fw={500}>Create Event</Text>
              <Text size="sm" c="dimmed">
                Set up your event with a name, description, and available date options.
              </Text>
            </Stack>
          </Paper>

          <Paper p="lg" withBorder>
            <Stack gap="xs">
              <ThemeIcon size="lg" variant="light" color="teal">
                2
              </ThemeIcon>
              <Text fw={500}>Share Link</Text>
              <Text size="sm" c="dimmed">
                Send the unique link to participants. No sign-up required to vote.
              </Text>
            </Stack>
          </Paper>

          <Paper p="lg" withBorder>
            <Stack gap="xs">
              <ThemeIcon size="lg" variant="light" color="green">
                3
              </ThemeIcon>
              <Text fw={500}>Find Best Time</Text>
              <Text size="sm" c="dimmed">
                View the availability matrix and pick the date that works for everyone.
              </Text>
            </Stack>
          </Paper>
        </SimpleGrid>

        <Text ta="center" size="sm" c="dimmed" mt="xl">
          <Anchor href={payloadConfig.routes?.admin || '/admin'} c="dimmed">
            Admin Panel
          </Anchor>
        </Text>
      </Stack>
    </Container>
  )
}
