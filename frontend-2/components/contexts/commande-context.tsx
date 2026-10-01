"use client"

import { createContext, useContext, useState } from "react"
import { useAccount } from "../providers/account-provider"

type Commande = {
  pictureUri: string
  productId: string
  quantity: number
  price: number
  maxBuyableQuantity: number
  name: string
  picked_categories_items?: {
    item_id: string
    amount: number
  }[] // TODO : remove this because unusable
}

const CommandeContext = createContext<{
  commandes: Commande[]
  addNewCommande: (
    newCommande: Omit<Commande, "quantity">,
    quantity?: number | null
  ) => void
  total: number
  reste: number | null
}>({
  commandes: [],
  addNewCommande: () => {},
  total: 0,
  reste: null,
})

export const useCommandeContext = () => useContext(CommandeContext)

const calculReste = (total: number, balance: number | undefined) =>
  balance !== undefined ? balance / 100 - total : null

export const CommandeContextProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [commandes, setCommandes] = useState<Commande[]>([])
  const total =
    commandes.reduce((acc, c) => acc + c.price * c.quantity, 0) / 100
  const { data: user } = useAccount()
  const reste = calculReste(total, user?.account?.balance)
  return (
    <CommandeContext.Provider
      value={{
        total,
        commandes,
        reste,
        addNewCommande: (newCommande, _quantity = null) => {
          setCommandes((prev) => {
            const index = prev.findIndex(
              (c) => c.productId === newCommande.productId
            )
            const quantity = Math.min(
              typeof _quantity === "number"
                ? _quantity
                : index === -1
                  ? 1
                  : prev[index].quantity + 1,
              newCommande.maxBuyableQuantity
            )
            const updatedCommande = {
              ...(index === -1 ? {} : prev[index]),
              ...newCommande,
              quantity,
            }
            const updatedCommandes = [...prev]
            if (index === -1) updatedCommandes.push(updatedCommande)
            else updatedCommandes[index] = updatedCommande
            /* const calculatedReste = calculReste(
              updatedCommandes.reduce(
                (acc, c) => acc + c.price * c.quantity,
                0
              ) / 100,
              user?.account?.balance
            )
            if (calculatedReste !== null && calculatedReste < 0) return prev */
            return updatedCommandes.filter((c) => c.quantity > 0)
          })
        },
      }}
    >
      {children}
    </CommandeContext.Provider>
  )
}
