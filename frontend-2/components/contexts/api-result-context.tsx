"use client"

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react"
import { toastError, ToastId, toastSuccess } from "@/components/ui/toast"
import { useRouter } from "next/navigation"
import { Route } from "next"
import { apis, QueryTag } from "@/components/providers/base-provider"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
        toastError(
          ToastId.Api_Result,
          "Aucun compte associé",
          "Aucun compte n'est associé à votre compte Google. Veuillez créer un compte à une borne et connecter votre compte TN.net !"
        )
        return
      }
      if (rt === "authError" && rm) {
        setCode(ApiResultCode.AUTH_ERROR)
        setErrMessage(rm)
        toastError(ToastId.Api_Result, "Erreur d'authentification", rm)
        return
      }
      if (rt === "authSuccess") {
        setCode(ApiResultCode.AUTH_SUCCESS)
        setErrMessage(null)
        toastSuccess(
          ToastId.Api_Result,
          "Authentification réussie",
          "Vous êtes maintenant connecté !"
        )
      }
    }

    /* ------------ HANDLING HELLOASSO CALLBACK ------------- */

    const handleHelloassoCallback = async (url: URL) => {
      const checkoutIntentId = parseInt(
        urlParams.get("checkoutIntentId") || "0"
      )
      const error = urlParams.get("error")
      const code = urlParams.get("code")
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
        toastError(ToastId.HelloAsso_Result, "Erreur de paiement", error)
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
            .then(() => {
              setHelloAssoResult({
                checkoutIntentId,
                isSuccess: true,
              })
              toastSuccess(
                ToastId.HelloAsso_Result,
                "Rechargement validé",
                "Votre rechargement a été validé avec succès. Vous pouvez consulter vos rechargements dans votre profil."
              )
            })
            .catch(() => void 0)
        } catch (e) {
          void e
          toastError(
            ToastId.HelloAsso_Result,
            "Erreur de paiement",
            "L'identifiant de paiement est invalide."
          )
          return
        }
      }
    }

    /* ------------ END ------------- */

    handleAuthApi(newUrl)
      .then(() => handleHelloassoCallback(newUrl))
      .then(() => {
        setSent(true)
        if (changeURL) router.replace(newUrl.toString() as Route)
      })
  }, [queryClient, router, sent])

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
