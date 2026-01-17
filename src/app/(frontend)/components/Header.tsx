'use client'

import Link from 'next/link'
import { Container, Group, Anchor, Text } from '@mantine/core'
import { ColorSchemeToggle } from './ColorSchemeToggle'

interface HeaderProps {
  user?: { email: string } | null
}

export function Header({ user }: HeaderProps) {
  return (
    <header
      style={{
        borderBottom: '1px solid var(--mantine-color-default-border)',
      }}
    >
      <Container size="lg" py="sm">
        <Group justify="space-between">
          <Anchor component={Link} href="/" underline="never" fw={600} c="inherit">
            Event Scheduler
          </Anchor>

          <Group gap="md">
            {user ? (
              <>
                <Anchor component={Link} href="/events" size="sm">
                  My Events
                </Anchor>
                <Anchor component={Link} href="/events/new" size="sm">
                  Create Event
                </Anchor>
                <Text size="sm" c="dimmed">
                  {user.email}
                </Text>
              </>
            ) : (
              <Anchor component={Link} href="/login" size="sm">
                Sign In
              </Anchor>
            )}
            <ColorSchemeToggle />
          </Group>
        </Group>
      </Container>
    </header>
  )
}
