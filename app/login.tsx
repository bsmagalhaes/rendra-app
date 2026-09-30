import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useBrand } from '../src/brand'
import { AuthLayout } from '../src/components/layout'
import { ActionBar, Checkbox, Form, FormField, Input } from '../src/components/ui'
import { useRendraNavigation } from '../src/navigation/rendra-navigation'
import { useDocumentTitle } from '../src/lib/use-document-title'
import { zBR } from '../src/lib/validators'

const schema = z.object({
  email: zBR.email(),
  senha: z.string().min(1, 'Senha é obrigatória.'),
  lembrar: z.boolean(),
})

/**
 * Tela de entrada de exemplo, fora do grupo `(shell)`: tela cheia com o próprio `SafeAreaView`
 * (só o inset superior; o rodapé é do `ActionBar`). O envio de exemplo só leva ao painel: quem
 * usa o boilerplate troca `onSubmit` pela chamada da própria API.
 */
export default function Login() {
  const { brand } = useBrand()
  const { navigate } = useRendraNavigation()
  useDocumentTitle(`Entrar · ${brand.productName}`)
  const form = useForm({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: { email: '', senha: '', lembrar: false },
  })

  function onSubmit() {
    navigate('/painel')
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background" testID="safe-area-tela">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView
          tabIndex={0}
          className="flex-1"
          contentContainerClassName="flex-grow"
          keyboardShouldPersistTaps="handled"
        >
          <AuthLayout title="Acesse sua conta" description="Entre com seu e-mail e senha para continuar.">
            <Form form={form} onSubmit={onSubmit} className="gap-4">
              <FormField name="email" label="E-mail" required render={(f) => <Input {...f} />} />
              <FormField name="senha" label="Senha" required render={(f) => <Input {...f} secureTextEntry />} />
              <FormField
                name="lembrar"
                render={(f) => (
                  <Checkbox label="Lembrar de mim" checked={Boolean(f.value)} onCheckedChange={f.onChange} />
                )}
              />
            </Form>
            <ActionBar sticky={false} primary={{ label: 'Entrar', onPress: form.handleSubmit(onSubmit) }} />
          </AuthLayout>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
