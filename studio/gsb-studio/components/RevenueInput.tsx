// studio/gsb-studio/components/RevenueInput.tsx
import React, {useCallback} from 'react'
import {TextInput} from '@sanity/ui'
import {type StringInputProps, set, unset} from 'sanity'

// Normalizes values like "11.3", "11.3B", "$11.3B" into "$11.3b".
// Defaults to a "b" suffix when the author omits one, since revenue here is typically in billions.
function formatRevenue(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return trimmed

  const match = trimmed.match(/^\$?\s*(\d+(?:\.\d+)?)\s*([bBmMkK])?$/)
  if (!match) return trimmed

  const [, number, suffix] = match
  const unit = (suffix || 'b').toLowerCase()
  return `$${number}${unit}`
}

export function RevenueInput(props: StringInputProps) {
  const {value, onChange} = props

  const handleBlur = useCallback(() => {
    if (!value) return
    const formatted = formatRevenue(value)
    if (formatted !== value) {
      onChange(formatted ? set(formatted) : unset())
    }
  }, [value, onChange])

  return (
    <TextInput
      {...props.elementProps}
      value={value || ''}
      onBlur={(event) => {
        props.elementProps.onBlur?.(event)
        handleBlur()
      }}
    />
  )
}
