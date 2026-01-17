'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TextInput, Textarea, Button, Stack, Alert, Text } from '@mantine/core'
import { DatePicker } from '@mantine/dates'
import dayjs from 'dayjs'
import 'dayjs/locale/fr'

dayjs.locale('fr')

export function EventForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedDates, setSelectedDates] = useState<Date[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDateChange = (values: (string | Date)[]) => {
    // Mantine v8 may pass strings or Dates depending on configuration
    const dates = values.map((v) => (typeof v === 'string' ? new Date(v) : v))
    setSelectedDates(dates)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError("Le nom de l'événement est requis")
      return
    }

    if (selectedDates.length === 0) {
      setError('Veuillez sélectionner au moins une date')
      return
    }

    setLoading(true)

    try {
      const dateOptions = selectedDates
        .sort((a, b) => a.getTime() - b.getTime())
        .map((d) => dayjs(d).format('YYYY-MM-DD'))

      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          dateOptions,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.errors?.[0]?.message || "Échec de la création de l'événement")
      }

      const { doc } = await res.json()
      router.push(`/e/${doc.slug}?created=true`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de la création de l'événement")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        {error && (
          <Alert color="red" title="Erreur">
            {error}
          </Alert>
        )}

        <TextInput
          label="Nom de l'événement"
          placeholder="Déjeuner d'équipe"
          required
          maxLength={200}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Textarea
          label="Description"
          placeholder="Description optionnelle de votre événement"
          maxLength={2000}
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div>
          <Text size="sm" fw={500} mb="xs">
            Sélectionnez les dates disponibles
          </Text>
          <DatePicker
            type="multiple"
            value={selectedDates}
            onChange={handleDateChange as (value: string[]) => void}
            minDate={new Date()}
            numberOfColumns={2}
          />
          {selectedDates.length > 0 && (
            <Text size="sm" c="dimmed" mt="xs">
              {selectedDates.length} date{selectedDates.length > 1 ? 's' : ''} sélectionnée
              {selectedDates.length > 1 ? 's' : ''}
            </Text>
          )}
        </div>

        <Button type="submit" loading={loading} disabled={loading}>
          Créer l&apos;événement
        </Button>
      </Stack>
    </form>
  )
}
