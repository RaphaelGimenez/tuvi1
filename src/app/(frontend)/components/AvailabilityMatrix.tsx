'use client'

import { Table, Text, Badge, Paper, Stack, Group, useComputedColorScheme } from '@mantine/core'
import dayjs from 'dayjs'
import 'dayjs/locale/fr'

dayjs.locale('fr')
import type { Event, EventParticipation } from '@/payload-types'

interface AvailabilityMatrixProps {
  event: Event
  participations: EventParticipation[]
}

export function AvailabilityMatrix({ event, participations }: AvailabilityMatrixProps) {
  const colorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true })
  const isDark = colorScheme === 'dark'
  const dateOptions = (event.dateOptions as string[]) || []

  if (dateOptions.length === 0) {
    return (
      <Paper p="md" withBorder>
        <Text c="dimmed">Aucune option de date disponible.</Text>
      </Paper>
    )
  }

  // Calculate vote counts per date
  const voteCounts: Record<string, number> = {}
  dateOptions.forEach((date) => {
    voteCounts[date] = 0
  })

  participations.forEach((p) => {
    const selectedDates = (p.selectedDates as string[]) || []
    selectedDates.forEach((date) => {
      if (voteCounts[date] !== undefined) {
        voteCounts[date]++
      }
    })
  })

  // Find max votes for highlighting
  const maxVotes = Math.max(...Object.values(voteCounts), 0)

  // Sort dates
  const sortedDates = [...dateOptions].sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

  if (participations.length === 0) {
    return (
      <Paper p="md" withBorder>
        <Stack gap="sm">
          <Text fw={500}>Options de dates</Text>
          <Group gap="xs" wrap="wrap">
            {sortedDates.map((date) => (
              <Badge key={date} variant="light" size="lg">
                {dayjs(date).format('ddd D MMMM')}
              </Badge>
            ))}
          </Group>
          <Text size="sm" c="dimmed">
            Pas encore de votes. Soyez le premier à répondre !
          </Text>
        </Stack>
      </Paper>
    )
  }

  return (
    <Paper p="md" withBorder>
      <Stack gap="md">
        <Text fw={500}>Disponibilités ({participations.length} réponses)</Text>
        <div style={{ overflowX: 'auto' }}>
          <Table striped highlightOnHover withTableBorder withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Participant</Table.Th>
                {sortedDates.map((date) => (
                  <Table.Th key={date} ta="center" style={{ minWidth: 80 }}>
                    <Text size="xs">{dayjs(date).format('ddd')}</Text>
                    <Text size="sm" fw={500}>
                      {dayjs(date).format('D MMM')}
                    </Text>
                  </Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {participations.map((p) => {
                const selectedDates = (p.selectedDates as string[]) || []
                return (
                  <Table.Tr key={p.id}>
                    <Table.Td>
                      <Text size="sm" fw={500}>
                        {p.participantName}
                      </Text>
                      {p.comment && (
                        <Text size="xs" c="dimmed">
                          {p.comment}
                        </Text>
                      )}
                    </Table.Td>
                    {sortedDates.map((date) => {
                      const isSelected = selectedDates.includes(date)
                      return (
                        <Table.Td
                          key={date}
                          ta="center"
                          bg={isSelected ? (isDark ? 'teal.9' : 'teal.1') : undefined}
                        >
                          {isSelected ? (
                            <Text c={isDark ? 'teal.3' : 'teal.7'} fw={500}>
                              ✓
                            </Text>
                          ) : (
                            <Text c="dimmed">-</Text>
                          )}
                        </Table.Td>
                      )
                    })}
                  </Table.Tr>
                )
              })}
              {/* Vote count row */}
              <Table.Tr>
                <Table.Td>
                  <Text size="sm" fw={700}>
                    Total
                  </Text>
                </Table.Td>
                {sortedDates.map((date) => {
                  const count = voteCounts[date]
                  const isBest = count === maxVotes && maxVotes > 0
                  return (
                    <Table.Td
                      key={date}
                      ta="center"
                      bg={isBest ? (isDark ? 'teal.8' : 'teal.2') : undefined}
                    >
                      <Text
                        size="sm"
                        fw={isBest ? 700 : 500}
                        c={isBest ? (isDark ? 'teal.1' : 'teal.9') : undefined}
                      >
                        {count}
                      </Text>
                    </Table.Td>
                  )
                })}
              </Table.Tr>
            </Table.Tbody>
          </Table>
        </div>

        {/* Best dates summary */}
        {maxVotes > 0 && (
          <Group gap="xs">
            <Text size="sm" fw={500}>
              Meilleure{sortedDates.filter((d) => voteCounts[d] === maxVotes).length > 1 ? 's' : ''}{' '}
              date{sortedDates.filter((d) => voteCounts[d] === maxVotes).length > 1 ? 's' : ''} :
            </Text>
            {sortedDates
              .filter((d) => voteCounts[d] === maxVotes)
              .map((date) => (
                <Badge key={date} color="teal">
                  {dayjs(date).format('ddd D MMMM')} ({maxVotes} vote{maxVotes > 1 ? 's' : ''})
                </Badge>
              ))}
          </Group>
        )}
      </Stack>
    </Paper>
  )
}
