import type { ReactElement, ReactNode } from 'react'
import { View } from 'react-native'
import { FormProvider, useController, useFormContext } from 'react-hook-form'
import type { FieldPath, FieldValues, SubmitHandler, UseFormReturn } from 'react-hook-form'
import { Field, type FieldProps } from './field'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './card'
import { cn } from '../../lib/cn'
import { gapClass } from '../layout/tokens'

export interface FormProps<T extends FieldValues> {
  form: UseFormReturn<T>
  // Documenta a intenção (o que este formulário envia), mas não é lido aqui: quem chama
  // `Form` aciona o envio de fora, no próprio botão de ação, via `form.handleSubmit(onSubmit)`
  // (achado 8 do veredito do Bloco B; ver `form.test.tsx`/`showcase.tsx`).
  onSubmit: SubmitHandler<T>
  children: ReactNode
  className?: string
}

export function Form<T extends FieldValues>({ form, children, className }: FormProps<T>) {
  return (
    <FormProvider {...form}>
      <View className={cn('flex min-w-0 flex-col gap-8', className)} dataSet={{ rendra: 'FORM-001' }}>{children}</View>
    </FormProvider>
  )
}

export interface FormControlProps<V = unknown> {
  name: string
  value: V
  onChange: (value: V) => void
  onBlur: () => void
  invalid: boolean
}

interface FormFieldProps<T extends FieldValues> extends Omit<FieldProps, 'children' | 'error'> {
  name: FieldPath<T>
  render: (field: FormControlProps<any>) => ReactNode
}

export function FormField<T extends FieldValues>({ name, render, ...fieldProps }: FormFieldProps<T>) {
  const context = useFormContext<T>()
  if (!context) {
    throw new Error('FormField precisa estar dentro de <Form>.')
  }
  const { field, fieldState } = useController({ name, control: context.control })
  return (
    <Field {...fieldProps} error={fieldState.error?.message}>
      {render({
        name: field.name,
        value: field.value,
        onChange: field.onChange,
        onBlur: field.onBlur,
        invalid: Boolean(fieldState.error),
      }) as ReactElement}
    </Field>
  )
}

export interface FormSectionProps {
  title: ReactNode
  description?: ReactNode
  help?: ReactNode
  children: ReactNode
  id?: string
}

export function FormSection({ title, description, help, children, id }: FormSectionProps) {
  return (
    <Card nativeID={id} code="FORM-002">
      <CardHeader>
        <CardTitle help={help}>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        <View className={cn('flex flex-col', gapClass.fields)}>{children}</View>
      </CardContent>
    </Card>
  )
}
