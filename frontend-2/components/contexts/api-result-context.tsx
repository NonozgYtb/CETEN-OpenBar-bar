"use client"

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react"
import { toast, ToastType } from "../ui/toast"
import { redirect, useRouter } from "next/navigation"
import { Route } from "next"
import { apis, QueryTag } from "../providers/base-provider"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { useQueryClient } from "@tanstack/react-query"

export enum ApiResultCode {
  AUTH_NO_ACCOUNT = "AUTH_NO_ACCOUNT",
  AUTH_ERROR = "AUTH_ERROR",
  AUTH_SUCCESS = "AUTH_SUCCESS",
}

const ApiResultContext = createContext<{
  code: ApiResultCode | null
  errMessage: string | null
}>({ code: null, errMessage: null })

export const useApiResultContext = () => useContext(ApiResultContext)

export const ApiResultHandler = ({ children }: { children: ReactNode }) => {
  // On page load :

  const [code, setCode] = useState<ApiResultCode | null>(null)
  const [errMessage, setErrMessage] = useState<string | null>(null)

  const [helloAssoResult, setHelloAssoResult] = useState<{
    checkoutIntentId: number
    isSuccess: boolean
  } | null>(null)

  const [sent, setSent] = useState(false)

  const router = useRouter()

  /**
   * ?noaccount
   * ?rt=authError & rm=<error>
   * ?rt=authSuccess
   * ?checkoutIntentId=1234&code=succeeded&orderId=12345
   */

  const queryClient = useQueryClient()

  useEffect(() => {
    if (sent) return
    const urlParams = new URLSearchParams(window.location.search)
    const newUrl = new URL(window.location.href)
    let changeURL = false

    /* ------------ HANDLE AUTH API ------------- */

    const handleAuthApi = async (url: URL) => {
      const noAccount = urlParams.get("noaccount")
      const rt = urlParams.get("rt")
      const rm = urlParams.get("rm")

      if (!noAccount && !rt && !rm) return

      changeURL = true

      url.searchParams.delete("noaccount")
      url.searchParams.delete("rt")
      url.searchParams.delete("rm")

      if (noAccount) {
        setCode(ApiResultCode.AUTH_NO_ACCOUNT)
        toast.add({
          id: "api-result",
          type: ToastType.ERROR,
          title: "Aucun compte associé",
          description:
            "Aucun compte n'est associé à votre compte Google. Veuillez créer un compte à une borne et connecter votre compte TN.net !",
        })
        return
      }
      if (rt === "authError" && rm) {
        setCode(ApiResultCode.AUTH_ERROR)
        setErrMessage(rm)
        toast.add({
          id: "api-result",
          type: ToastType.ERROR,
          title: "Erreur d'authentification",
          description: rm,
        })
        return
      }
      if (rt === "authSuccess") {
        setCode(ApiResultCode.AUTH_SUCCESS)
        setErrMessage(null)
        toast.add({
          id: "api-result",
          type: ToastType.SUCCESS,
          title: "Authentification réussie",
          description: "Vous êtes maintenant connecté !",
        })
      }
    }

    /* ------------ HANDLING HELLOASSO CALLBACK ------------- */

    const handleHelloassoCallback = async (url: URL) => {
      const checkoutIntentId = parseInt(
        urlParams.get("checkoutIntentId") || "0"
      )
      const error = urlParams.get("error")
      const code = urlParams.get("code")
      const orderId = urlParams.get("orderId")
      if (!checkoutIntentId) return
      changeURL = true
      url.searchParams.delete("checkoutIntentId")
      url.searchParams.delete("error")
      url.searchParams.delete("code")
      url.searchParams.delete("orderId")
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: [QueryTag.Refills] })
        queryClient.invalidateQueries({ queryKey: [QueryTag.RemoteRefills] })
      }, 500)
      if (error) {
        toast.add({
          id: "hello-asso-result",
          type: ToastType.ERROR,
          title: "Erreur de paiement",
          description: error,
        })
        setHelloAssoResult({
          checkoutIntentId,
          isSuccess: false,
        })
        return
      }
      if (code === "succeeded") {
        try {
          apis.refills
            .selfValidateRemoteRefill(checkoutIntentId)
            .then((res) =>
              setHelloAssoResult({
                checkoutIntentId,
                isSuccess: true,
              })
            )
            .catch((err) => void 0)
        } catch (e) {
          toast.add({
            id: "hello-asso-result",
            type: ToastType.ERROR,
            title: "Erreur de paiement",
            description: "L'identifiant de paiement est invalide.",
          })
          return
        }
      }
    }

    /* ------------ END ------------- */

    !(async () => {
      await handleAuthApi(newUrl)
      await handleHelloassoCallback(newUrl)

      setSent(true)

      if (changeURL) router.replace(newUrl.toString() as Route)
    })()
  }, [])

  return (
    <ApiResultContext.Provider value={{ code, errMessage }}>
      {children}
      {helloAssoResult?.isSuccess && (
        <Dialog defaultOpen={true}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rechargement validé</DialogTitle>
              <DialogDescription>
                Votre rechargement a été validé avec succès. Vous pouvez
                consulter vos rechargements dans votre profil.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 flex justify-end">
              <DialogClose buttonRender variant={"secondary"}>
                Fermer
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </ApiResultContext.Provider>
  )
}
