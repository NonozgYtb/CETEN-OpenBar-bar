import { toastError, ToastId } from "@/components/ui/toast"
import { useCallback } from "react"
import useWebSocket from "react-use-websocket"

export const useWS = (
  url: string,
  shouldConnect = true,
  reconnectAttempts = 10,
  disableError = false,
  onMessage?: (event: MessageEvent) => void
) => {
  const shouldReconnect = useCallback(() => shouldConnect, [shouldConnect])
  return useWebSocket(
    url,
    {
      share: true,
      shouldReconnect,
      reconnectAttempts,
      reconnectInterval: (attemptNumber) =>
        Math.min(Math.pow(2, attemptNumber) * 1000, 30000),
      onMessage,
      onError: () => {
        if (disableError) return
        toastError(
          ToastId.Custom,
          "Erreur WebSocket",
          "Une erreur est survenue lors de la connexion au socket.",
          `ws-err-${url}`
        )
      },
    },
    shouldConnect
  )
}
