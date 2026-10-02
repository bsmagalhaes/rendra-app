import { useState } from 'react'
import type { ReactNode } from 'react'
import { Pressable, View } from 'react-native'
import { Filter, Search, X } from 'lucide-react-native'
import { Text } from '../internal/text'
import { ActionBar } from './action-bar'
import { Button } from './button'
import { Drawer } from './drawer'
import { Input } from './input'
import { Switch } from './switch'
import { a11yPresets } from '../../lib/a11y'

/*
 * Barra de ferramentas de listagem, no formato de celular: busca na largura total; embaixo,
 * "Filtros" (30%) e a ação principal (70%). Filtros, ordenação e campos viram um único botão com
 * contador, que abre uma gaveta em tela cheia. Ficam fora o `selectionBar` (só desktop), o menu
 * "Colunas" e o popover de filtros, que o app não tem.
 */

export interface FilterChip {
  id: string
  label: string
  onRemove: () => void
}

export interface ToolbarColumn {
  id: string
  label: string
  visible: boolean
  onToggle: (visible: boolean) => void
}

export interface DataToolbarProps {
  search?: { value: string; onChange: (v: string) => void; placeholder?: string }
  /** Conteúdo dos filtros, na gaveta em tela cheia. */
  filters?: ReactNode
  /** Quantos filtros estão aplicados (contador no botão). */
  filterCount?: number
  onClearFilters?: () => void
  /** Chips dos filtros aplicados. */
  chips?: FilterChip[]
  /** Ordenação (vai para a gaveta, sob "Ordenar por"). */
  sort?: ReactNode
  /** Campos que a pessoa pode mostrar ou ocultar (vão para a gaveta, sob "Campos no card"). */
  columns?: ToolbarColumn[]
  /** Ações secundárias, numa linha abaixo. */
  actions?: ReactNode
  /** Ação principal da listagem (ex.: Novo cliente). */
  primaryAction?: ReactNode
}

export function DataToolbar({
  search,
  filters,
  filterCount = 0,
  onClearFilters,
  chips = [],
  sort,
  columns,
  actions,
  primaryAction,
}: DataToolbarProps) {
  const [drawer, setDrawer] = useState(false)
  const hasPanel = Boolean(filters || sort || columns?.length)

  return (
    <View dataSet={{ rendra: 'DTB-001' }} className="flex-col gap-3 border-b border-border p-4">
      {search ? (
        <Input
          icon={<Search className="size-icon-sm text-muted-foreground" />}
          clearable
          value={search.value}
          onChange={search.onChange}
          placeholder={search.placeholder ?? 'Buscar'}
          accessibilityLabel={search.placeholder ?? 'Buscar'}
        />
      ) : null}

      {hasPanel || primaryAction ? (
        <View className="flex-row gap-3">
          {hasPanel ? (
            <Button
              variant="outline"
              icon={<Filter className="text-foreground" />}
              iconRight={
                filterCount > 0 ? (
                  <View className="rounded-full bg-primary px-2">
                    <Text weight="medium" className="text-xs tabular-nums text-primary-foreground">
                      {filterCount}
                    </Text>
                  </View>
                ) : undefined
              }
              onPress={() => setDrawer(true)}
              className={primaryAction ? 'flex-3' : 'flex-1'}
            >
              Filtros
            </Button>
          ) : null}
          {primaryAction ? <View className={hasPanel ? 'flex-7' : 'flex-1'}>{primaryAction}</View> : null}
        </View>
      ) : null}

      {actions ? <View className="flex-row flex-wrap gap-3">{actions}</View> : null}

      {chips.length > 0 ? (
        <View className="flex-row flex-wrap items-center gap-2">
          {chips.map((c) => (
            <View key={c.id} className="flex-row items-center gap-1 rounded-item border border-border bg-muted pl-2">
              <Text weight="medium" className="text-xs text-foreground">
                {c.label}
              </Text>
              <Pressable
                accessibilityRole={a11yPresets.button.accessibilityRole}
                accessibilityLabel={`Remover filtro ${c.label}`}
                onPress={c.onRemove}
                className="size-touch items-center justify-center rounded-item"
              >
                <X className="size-icon-sm text-muted-foreground" />
              </Pressable>
            </View>
          ))}
          {onClearFilters ? (
            <Button variant="link" size="sm" onPress={onClearFilters}>
              Limpar filtros
            </Button>
          ) : null}
        </View>
      ) : null}

      {hasPanel ? (
        <Drawer
          open={drawer}
          onOpenChange={setDrawer}
          title="Filtros"
          icon={<Filter className="text-foreground" />}
          size="full"
          footer={
            <ActionBar
              sticky={false}
              cancel={onClearFilters ? { label: 'Limpar', onPress: onClearFilters } : undefined}
              primary={{ label: 'Ver resultados', onPress: () => setDrawer(false) }}
            />
          }
        >
          <View className="flex-col gap-8">
            {filters ? <View className="flex-col gap-4">{filters}</View> : null}
            {sort ? (
              <View className="flex-col gap-3">
                <Text weight="semibold" className="text-sm text-foreground">
                  Ordenar por
                </Text>
                {sort}
              </View>
            ) : null}
            {columns?.length ? (
              <View className="flex-col gap-1">
                <Text weight="semibold" className="text-sm text-foreground">
                  Campos no card
                </Text>
                {columns.map((c) => (
                  <Switch key={c.id} label={c.label} checked={c.visible} onCheckedChange={c.onToggle} />
                ))}
              </View>
            ) : null}
          </View>
        </Drawer>
      ) : null}
    </View>
  )
}
