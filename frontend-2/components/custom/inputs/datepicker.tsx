"use client"

import * as React from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { IconCalendar } from "@tabler/icons-react"
import { Separator } from "@/components/ui/separator"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { TZDate } from "react-day-picker"

export function DatePickerDemo({
  id,
  name,
  date,
  setDate,
}: {
  id?: string
  name?: string
  date: TZDate | null
  setDate: (date: TZDate | null) => void
}) {
  const [hInput, setHInput] = React.useState(
    date ? format(date || 0, "HH", { locale: fr }) : ""
  )
  const [mInput, setMInput] = React.useState(
    date ? format(date || 0, "mm", { locale: fr }) : ""
  )
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            data-empty={!date}
            className="justify-start text-left font-normal data-[empty=true]:text-muted-foreground"
          />
        }
      >
        <IconCalendar />
        {date ? (
          format(date, "dd/MM/yyyy 'à' HH:mm", {
            locale: fr,
          })
        ) : (
          <span>Choisir une date</span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-auto gap-0! p-0">
        <Calendar
          mode="single"
          selected={date || undefined}
          onSelect={(date) => {
            const d = new TZDate(date || 0, "Europe/Paris")
            // set the hours and minutes to the current values
            d.setHours(23) //d.setHours(date.getHours())
            d.setMinutes(59) //d.setMinutes(date.getMinutes())
            d.setSeconds(0)
            setDate(d)
            setHInput(format(d, "HH", { locale: fr }))
            setMInput(format(d, "mm", { locale: fr }))
          }}
          required
          id={id}
        />
        <Separator className="m-0!" />
        <FieldGroup className="p-3">
          <Field className="flex-row!">
            <FieldLabel className="w-auto!" htmlFor={name + "-hfin"}>
              Heure :
            </FieldLabel>
            <InputGroup className="flex-1">
              <InputGroupInput
                id={name + "-hfin"}
                name={name + "-hfin"}
                value={hInput.replaceAll(/[^0-9]/g, "")}
                onChange={(e) => {
                  setHInput(e.target.value.replaceAll(/[^0-9]/g, ""))
                  const content = e.target.value.replaceAll(/[^0-9]/g, "")
                  const h = parseInt(content)
                  if (isNaN(h) || h < 0 || h > 23 || !date) return
                  date.setHours(h)
                  setDate(date)
                }}
                onBlur={() => {
                  const h = Math.min(Math.max(Number(hInput), 0), 23)
                  setHInput(h.toString().padStart(2, "0"))
                  if (!date) return
                  date.setHours(h)
                  setDate(date)
                }}
                type="number"
                min={0}
                max={23}
                step="1"
                autoComplete="off"
                onFocus={(e) => e.target.select()}
                className="hide-buttons text-center"
                placeholder="12"
              />
              <InputGroupAddon align={null}>:</InputGroupAddon>
              <InputGroupInput
                id={name + "-mfin"}
                name={name + "-mfin"}
                value={mInput.replaceAll(/[^0-9]/g, "")}
                onChange={(e) => {
                  setMInput(e.target.value.replaceAll(/[^0-9]/g, ""))
                  const content = e.target.value.replaceAll(/[^0-9]/g, "")
                  const m = parseInt(content)
                  if (isNaN(m) || m < 0 || m > 59 || !date) return
                  date.setMinutes(m)
                  setDate(date)
                }}
                onBlur={() => {
                  const m = Math.min(Math.max(Number(mInput), 0), 59)
                  setMInput(m.toString().padStart(2, "0"))
                  if (!date) return
                  date.setMinutes(m)
                  setDate(date)
                }}
                type="number"
                min={0}
                max={59}
                step="1"
                autoComplete="off"
                onFocus={(e) => e.target.select()}
                className="hide-buttons text-center"
                placeholder="34"
              />
            </InputGroup>
          </Field>
        </FieldGroup>
        <Separator className="m-0!" />
        <div className="flex-warp flex justify-center gap-2 p-2">
          <Button
            variant="outline"
            onClick={() => {
              const d = new TZDate(new Date(), "Europe/Paris")
              d.setHours(23)
              d.setMinutes(59)
              d.setSeconds(0)
              setDate(d)
              setHInput(format(d, "HH", { locale: fr }))
              setMInput(format(d, "mm", { locale: fr }))
            }}
          >
            Ce soir
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const d = new TZDate(new Date(), "Europe/Paris")
              d.setHours(23)
              d.setMinutes(59)
              d.setSeconds(0)
              d.setMonth(6) // July
              d.setDate(31)
              setDate(d)
              setHInput(format(d, "HH", { locale: fr }))
              setMInput(format(d, "mm", { locale: fr }))
            }}
          >
            {"Fin d'année"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
