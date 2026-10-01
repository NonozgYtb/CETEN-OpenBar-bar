import { toast, ToastType } from "@/components/ui/toast"
import { useCallback, useEffect, useState } from "react"
import useWebSocket from "react-use-websocket"

export const useWS = (url: string, shouldConnect = true) => {
  const shouldReconnect = useCallback(() => shouldConnect, [shouldConnect])
  return useWebSocket(
    url,
    {
      share: true,
      shouldReconnect,
      reconnectAttempts: 10,
      reconnectInterval: (attemptNumber) =>
        Math.min(Math.pow(2, attemptNumber) * 1000, 10000),
      onError: () => {
        toast.add({
          id: `ws-err-${url}`,
          type: ToastType.ERROR,
          title: "Erreur WebSocket",
          description:
            "Une erreur est survenue lors de la connexion au socket.",
        })
      },
    },
    shouldConnect
  )
}
