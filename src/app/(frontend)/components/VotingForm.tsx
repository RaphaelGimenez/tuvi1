'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from '@mantine/form'
import { useDebouncedCallback } from '@mantine/hooks'
import { zodResolver } from 'mantine-form-zod-resolver'
import { z } from 'zod'
import { PayloadSDK } from '@payloadcms/sdk'
import dayjs from 'dayjs'
import 'dayjs/locale/fr'
import type { Config } from '@/payload-types'
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

dayjs.locale('fr')

interface VotingFormProps {
  eventId: number
  dateOptions: string[]
  disabled?: boolean
}

const formSchema = z.object({
  name: z.string().min(1, 'Veuillez entrer votre nom').max(100),
  comment: z.string().max(500).optional(),
  dates: z.array(z.string()).min(1, 'Veuillez sélectionner au moins une date'),
})

type FormValues = z.infer<typeof formSchema>

export function VotingForm({ eventId, dateOptions, disabled }: VotingFormProps) {
  const router = useRouter()

  // UI state
  const [loading, setLoading] = useState(false)
  const [checkingExisting, setCheckingExisting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Edit mode state
  const [existingParticipationId, setExistingParticipationId] = useState<number | null>(null)
  const isEditing = existingParticipationId !== null

  const sdk = useMemo(() => new PayloadSDK<Config>({ baseURL: '/api' }), [])

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      name: '',
      comment: '',
      dates: [] as string[],
    },
    validate: zodResolver(formSchema),
  })

  const sortedDates = useMemo(
    () => [...dateOptions].sort((a, b) => new Date(a).getTime() - new Date(b).getTime()),
    [dateOptions],
  )

  const resetEditMode = () => {
    setExistingParticipationId(null)
    form.setFieldValue('dates', [])
    form.setFieldValue('comment', '')
  }

  const loadExistingParticipation = (existing: {
    id: number
    selectedDates: unknown
    comment?: string | null
  }) => {
    setExistingParticipationId(existing.id)
    form.setFieldValue('dates', (existing.selectedDates as string[]) || [])
    form.setFieldValue('comment', existing.comment || '')
  }

  const checkExistingParticipation = useDebouncedCallback(async (name: string) => {
    const trimmedName = name.trim()

    if (!trimmedName || trimmedName.length < 2) {
      resetEditMode()
      return
    }

    setCheckingExisting(true)
    try {
      const result = await sdk.find({
        collection: 'event-participations',
        where: {
          and: [{ event: { equals: eventId } }, { participantName: { equals: trimmedName } }],
        },
        limit: 1,
      })

      if (result.docs?.[0]) {
        loadExistingParticipation(result.docs[0])
      } else {
        resetEditMode()
      }
    } catch (err) {
      console.error('Error checking existing participation:', err)
    } finally {
      setCheckingExisting(false)
    }
  }, 500)

  form.watch('name', ({ value }) => checkExistingParticipation(value))

  const handleDateToggle = (date: string) => {
    const currentDates = form.getValues().dates
    const newDates = currentDates.includes(date)
      ? currentDates.filter((d) => d !== date)
      : [...currentDates, date]
    form.setFieldValue('dates', newDates)
  }

  const handleSelectAll = () => {
    const allSelected = form.getValues().dates.length === dateOptions.length
    form.setFieldValue('dates', allSelected ? [] : [...dateOptions])
  }

  const handleSubmit = async (values: FormValues) => {
    setError(null)
    setLoading(true)

    try {
      const participationData = {
        event: eventId,
        participantName: values.name.trim(),
        selectedDates: values.dates,
        comment: values.comment?.trim() || undefined,
      }

      if (existingParticipationId) {
        await sdk.update({
          collection: 'event-participations',
          id: existingParticipationId,
          data: participationData,
        })
      } else {
        await sdk.create({
          collection: 'event-participations',
          data: participationData,
        })
      }

      setSuccess(true)
      if (!existingParticipationId) form.reset()
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
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Text fw={500}>
            {isEditing ? 'Modifier vos disponibilités' : 'Indiquez vos disponibilités'}
          </Text>

          {isEditing && (
            <Alert color="blue" title="Vote existant trouvé">
              Vous avez déjà voté. Modifiez vos disponibilités ci-dessous.
            </Alert>
          )}

          {error && (
            <Alert color="red" title="Erreur">
              {error}
            </Alert>
          )}

          {success && (
            <Alert color="green" title="Succès">
              {isEditing ? 'Votre vote a été mis à jour !' : 'Votre réponse a été enregistrée !'}
            </Alert>
          )}

          <TextInput
            label="Votre nom"
            placeholder="Jean Dupont"
            required
            maxLength={100}
            key={form.key('name')}
            {...form.getInputProps('name')}
          />

          <div>
            <Group justify="space-between" mb="xs">
              <Text size="sm" fw={500}>
                Sélectionnez les dates où vous êtes disponible
              </Text>
              <Button variant="subtle" size="xs" onClick={handleSelectAll}>
                {form.getValues().dates.length === dateOptions.length
                  ? 'Tout désélectionner'
                  : 'Tout sélectionner'}
              </Button>
            </Group>

            <Stack gap="xs">
              {sortedDates.map((date) => (
                <Checkbox
                  key={date}
                  label={dayjs(date).format('dddd D MMMM YYYY')}
                  checked={form.getValues().dates.includes(date)}
                  onChange={() => handleDateToggle(date)}
                />
              ))}
            </Stack>

            {form.errors.dates && (
              <Text size="sm" c="red" mt="xs">
                {form.errors.dates}
              </Text>
            )}
          </div>

          <Textarea
            label="Commentaire (optionnel)"
            placeholder="Notes sur vos disponibilités..."
            maxLength={500}
            rows={2}
            key={form.key('comment')}
            {...form.getInputProps('comment')}
          />

          <Button type="submit" loading={loading || checkingExisting}>
            {isEditing ? 'Mettre à jour mon vote' : 'Envoyer ma réponse'}
          </Button>
        </Stack>
      </form>
    </Paper>
  )
}
