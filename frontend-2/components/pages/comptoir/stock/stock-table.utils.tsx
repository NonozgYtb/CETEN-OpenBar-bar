import { Category, Item, ItemPrices } from "@/lib/api"

const arrondiAuMutilple = (x: number, a: number): number =>
  Math.round((x + a / 2) / a) * a

export const transformPrices = (
  item: Item,
  coutant: number,
  category: Category | null = null
): ItemPrices => {
  if (item.prices.coutant <= 0)
    return {
      coutant: 0,
      externe: 0,
      ceten: 0,
      staff_bar: 0,
      privilegies: 0,
      menu: 0,
    }

  if (!category?.special_price) {
    if (item.prices.coutant < 30)
      return {
        coutant,
        externe: arrondiAuMutilple(item.prices.coutant, 5) + 20,
        ceten: arrondiAuMutilple(item.prices.coutant, 5) + 10,
        staff_bar: arrondiAuMutilple(item.prices.coutant, 5) + 5,
        privilegies: arrondiAuMutilple(item.prices.coutant, 5) + 5,
        menu: arrondiAuMutilple(item.prices.coutant, 5) + 10,
      }
    else if (item.prices.coutant >= 30 && item.prices.coutant < 130)
      return {
        coutant,
        externe: arrondiAuMutilple((item.prices.coutant * 3) / 2, 5),
        ceten: arrondiAuMutilple((item.prices.coutant * 113) / 100, 5),
        staff_bar: arrondiAuMutilple((item.prices.coutant * 108) / 100, 5),
        privilegies: arrondiAuMutilple((item.prices.coutant * 11) / 10, 5),
        menu: arrondiAuMutilple((item.prices.coutant * 13) / 10, 5),
      }
    else if (item.prices.coutant >= 130 && item.prices.coutant < 300)
      return {
        coutant,
        externe: arrondiAuMutilple((item.prices.coutant * 14) / 10, 5),
        ceten: arrondiAuMutilple((item.prices.coutant * 11) / 10, 5),
        staff_bar: arrondiAuMutilple((item.prices.coutant * 108) / 100, 5),
        privilegies: arrondiAuMutilple((item.prices.coutant * 11) / 10, 5),
        menu: arrondiAuMutilple((item.prices.coutant * 12) / 10, 5),
      }
    else /*  if (item.prices.coutant >= 300)  */ {
      return {
        coutant,
        externe: arrondiAuMutilple((item.prices.coutant * 125) / 100, 5),
        ceten: arrondiAuMutilple((item.prices.coutant * 11) / 10, 5),
        staff_bar: arrondiAuMutilple((item.prices.coutant * 105) / 100, 5),
        privilegies: arrondiAuMutilple((item.prices.coutant * 11) / 10, 5),
        menu: arrondiAuMutilple((item.prices.coutant * 1125) / 1000, 5),
      }
    }
  } else {
    if (item.prices.coutant < 30)
      return {
        coutant,
        externe: arrondiAuMutilple(item.prices.coutant, 5) + 20,
        ceten: arrondiAuMutilple(item.prices.coutant, 5) + 10,
        staff_bar: item.prices.ceten,
        privilegies: item.prices.ceten,
        menu: item.prices.ceten,
      }
    else if (item.prices.coutant >= 30 && item.prices.coutant < 130)
      return {
        coutant,
        externe: arrondiAuMutilple((item.prices.coutant * 3) / 2, 5),
        ceten: arrondiAuMutilple((item.prices.coutant * 113) / 100, 5),
        staff_bar: item.prices.ceten,
        privilegies: item.prices.ceten,
        menu: item.prices.ceten,
      }
    else if (item.prices.coutant >= 130 && item.prices.coutant < 300)
      return {
        coutant,
        externe: arrondiAuMutilple((item.prices.coutant * 14) / 10, 5),
        ceten: arrondiAuMutilple((item.prices.coutant * 11) / 10, 5),
        staff_bar: item.prices.ceten,
        privilegies: item.prices.ceten,
        menu: item.prices.ceten,
      }
    else
      /* if (item.prices.coutant >= 300)  */
      return {
        coutant,
        externe: arrondiAuMutilple((item.prices.coutant * 125) / 100, 5),
        ceten: arrondiAuMutilple((item.prices.coutant * 11) / 10, 5),
        staff_bar: item.prices.ceten,
        privilegies: item.prices.ceten,
        menu: item.prices.ceten,
      }
  }
}
