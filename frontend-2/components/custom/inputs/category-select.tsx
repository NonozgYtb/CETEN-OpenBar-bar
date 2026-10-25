import { useCategoryList } from "@/components/providers/items-provider"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { Category } from "@/lib/api/api"

export const CategorySelect = ({
  value,
  setValue,
  placeholder,
  name,
}: {
  value: Category | null
  setValue: (value: Category | null) => void
  placeholder?: string
  name?: string
}) => {
  const categories = useCategoryList()
  return (
    <Combobox
      items={categories.data || []}
      itemToStringLabel={(e: Category) => e.name}
      value={value}
      onValueChange={(e) => setValue(e || null)}
      name={name}
      id={name}
    >
      <ComboboxInput
        placeholder={placeholder}
        showClear
        showTrigger
        id={name}
        name={name}
      />
      <ComboboxContent>
        <ComboboxEmpty>Aucune catégorie disponible</ComboboxEmpty>
        <ComboboxList>
          {(category: Category) => (
            <ComboboxItem key={category.id} value={category}>
              {category.name}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
