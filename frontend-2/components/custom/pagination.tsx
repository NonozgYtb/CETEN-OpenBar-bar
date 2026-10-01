"use client"

import { useMemo, useState } from "react"
import { Input } from "../ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination"
import { cn } from "@/lib/utils"

export const PaginationComponent = ({
  value,
  setValue,
  outOf,
  className,
}: {
  outOf: number
  value: number
  setValue: (value: number) => void
  className?: string
}) => {
  const [inputValue, setInputValue] = useState("1")
  const config = useMemo(
    () => ({
      previousPage: value - 1 > 0 ? value - 1 : 1,
      nextPage: value + 1 <= outOf ? value + 1 : outOf,
      previousDisabled: value - 1 <= 0,
      nextDisabled: value + 1 > outOf,
      value,
    }),
    [value, outOf]
  )
  const update = () => {
    if (inputValue.trim().length === 0) return setInputValue(value.toString())
    const newValue = parseInt(inputValue)
    const nval = Math.min(Math.max(parseInt(inputValue), 1), outOf)
    if (isNaN(newValue)) return setInputValue(value.toString())
    setValue(nval)
    setInputValue(nval.toString())
  }
  return (
    <Pagination className={cn(className, "select-none")}>
      <PaginationContent>
        <PaginationItem
          className={cn(config.previousDisabled && "cursor-not-allowed")}
        >
          <PaginationPrevious
            onClick={() => {
              if (config.previousDisabled) return
              setValue(config.previousPage)
              setInputValue(config.previousPage.toString())
            }}
            disabled={config.previousDisabled}
          />
        </PaginationItem>
        <PaginationItem>
          <div className="flex items-center justify-center gap-2 px-1">
            <span>{"Page "}</span>
            <Input
              type="number"
              className="hide-buttons w-12 text-center"
              value={inputValue}
              min={1}
              max={outOf}
              onChange={(e) =>
                setInputValue(e.target.value.replace(/[^0-9]/g, ""))
              }
              onBlur={update}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  ;(e.target as HTMLInputElement).blur()
                }
              }}
            />
            <span>
              {" sur "}
              <b>{outOf}</b>
            </span>
          </div>
        </PaginationItem>
        <PaginationItem
          className={cn(config.nextDisabled && "cursor-not-allowed")}
        >
          <PaginationNext
            onClick={() => {
              console.log("onClick next", config.nextDisabled, config.nextPage)
              if (config.nextDisabled) return
              setValue(config.nextPage)
              setInputValue(config.nextPage.toString())
            }}
            disabled={config.nextDisabled}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
