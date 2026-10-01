"use client"; 

import { ItemState } from "@/lib/api"
import { apis, customUseQuery } from "./base-provider"
import { redirect, useRouter } from "next/navigation";
import { AxiosPromise } from "axios";

export const useAccount = () =>
{
  const router = useRouter();
  
  const data = customUseQuery({
    queryKey: ["account"],
    queryFn: () => apis.accounts.getAccount().catch((error) => {
      if (error.response?.status === 401) {
        router.push("/auth");
      }
      return Promise.reject(error);
    })
  });

  return data;
}

export const getFullName = (account?: {
  first_name: string
  last_name: string
}) => account ? `${account.first_name} ${account.last_name}` : ""
