'use client'

import { TextInput, Button, Group, CopyButton, Text, Paper, Stack } from '@mantine/core'

interface ShareLinkProps {
  slug: string
}

export function ShareLink({ slug }: ShareLinkProps) {
  const url = typeof window !== 'undefined' ? `${window.location.origin}/e/${slug}` : `/e/${slug}`

  return (
    <Paper p="md" withBorder>
      <Stack gap="xs">
        <Text size="sm" fw={500}>
          Partagez ce lien avec les participants
        </Text>
        <Group gap="xs">
          <TextInput value={url} readOnly style={{ flex: 1 }} />
          <CopyButton value={url}>
            {({ copied, copy }) => (
              <Button color={copied ? 'green' : 'pink'} onClick={copy}>
                {copied ? 'Copié !' : 'Copier'}
              </Button>
            )}
          </CopyButton>
        </Group>
      </Stack>
    </Paper>
  )
}
