import { FlatList, Pressable } from 'react-native'
import { Link } from 'expo-router'
import { useDocumentTitle } from '../../src/lib/use-document-title'
import { showcaseGroups } from '../../src/config/showcase'
import { Container, PageHeader } from '../../src/components/layout'
import { Text } from '../../src/components/internal/text'

export default function ComponentesIndex() {
  useDocumentTitle('Componentes')

  return (
    <Container padded className="flex-1 bg-background">
      <PageHeader title="Componentes" showTitle description="Grupos disponíveis na vitrine do design system." />
      <FlatList
        data={showcaseGroups}
        keyExtractor={(group) => group.slug}
        contentContainerClassName="gap-3 py-4"
        renderItem={({ item }) => (
          <Link href={`/componentes/${item.slug}`} asChild>
            <Pressable className="rounded-control border border-border bg-card p-4">
              <Text weight="semibold" className="text-base text-foreground">
                {item.title}
              </Text>
              <Text className="text-sm text-muted-foreground">{item.entries.length} componente(s)</Text>
            </Pressable>
          </Link>
        )}
      />
    </Container>
  )
}
