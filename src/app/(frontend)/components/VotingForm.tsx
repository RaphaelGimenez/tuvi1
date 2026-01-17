'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  TextInput,
  Textarea,
  Button,
  Stack,
  Alert,
  Checkbox,
  Group,
  Paper,
  Text,
} from '@mantine/core'
import dayjs from 'dayjs'
import 'dayjs/locale/fr'

dayjs.locale('fr')

interface VotingFormProps {
  eventId: number
  dateOptions: string[]
  disabled?: boolean
}

export function VotingForm({ eventId, dateOptions, disabled }: VotingFormProps) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [comment, setComment] = useState('')
  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Sort dates for display
  const sortedDates = [...dateOptions].sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

  const handleDateToggle = (date: string) => {
    setSelectedDates((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date],
    )
  }

  const handleSelectAll = () => {
    if (selectedDates.length === dateOptions.length) {
      setSelectedDates([])
    } else {
      setSelectedDates([...dateOptions])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Veuillez entrer votre nom')
      return
    }

    if (selectedDates.length === 0) {
      setError('Veuillez sélectionner au moins une date')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/event-participations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: eventId,
          participantName: name.trim(),
          selectedDates,
          comment: comment.trim() || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.errors?.[0]?.message || "Échec de l'envoi du vote")
      }

      setSuccess(true)
      setName('')
      setComment('')
      setSelectedDates([])
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'envoi du vote")
    } finally {
      setLoading(false)
    }
  }

  if (disabled) {
    return (
      <Paper p="md" withBorder>
        <Text c="dimmed" ta="center">
          Le vote est fermé pour cet événement.
        </Text>
      </Paper>
    )
  }

  return (
    <Paper p="md" withBorder>
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Text fw={500}>Indiquez vos disponibilités</Text>

          {error && (
            <Alert color="red" title="Erreur">
              {error}
            </Alert>
          )}

          {success && (
            <Alert color="green" title="Succès">
              Votre réponse a été enregistrée !
            </Alert>
          )}

          <TextInput
            label="Votre nom"
            placeholder="Jean Dupont"
            required
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div>
            <Group justify="space-between" mb="xs">
              <Text size="sm" fw={500}>
                Sélectionnez les dates où vous êtes disponible
              </Text>
              <Button variant="subtle" size="xs" onClick={handleSelectAll}>
                {selectedDates.length === dateOptions.length
                  ? 'Tout désélectionner'
                  : 'Tout sélectionner'}
              </Button>
            </Group>
            <Stack gap="xs">
              {sortedDates.map((date) => (
                <Checkbox
                  key={date}
                  label={dayjs(date).format('dddd D MMMM YYYY')}
                  checked={selectedDates.includes(date)}
                  onChange={() => handleDateToggle(date)}
                />
              ))}
            </Stack>
          </div>

          <Textarea
            label="Commentaire (optionnel)"
            placeholder="Notes sur vos disponibilités..."
            maxLength={500}
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <Button type="submit" loading={loading} disabled={loading}>
            Envoyer ma réponse
          </Button>
        </Stack>
      </form>
    </Paper>
  )
}
