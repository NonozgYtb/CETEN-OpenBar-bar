import { ScrollArea } from "../ui/scroll-area"
import { AppHeader } from "./app-header"

export const InsetLayout = ({
  pageTitle,
  children,
}: {
  pageTitle?: string
  children?: React.ReactNode
}) => {
  return (
    <>
      <AppHeader pageTitle={pageTitle} />
      <ScrollArea className="flex flex-1 flex-col overflow-auto h-full">
        <div className="@container/main flex flex-1 flex-col gap-2 h-full">
          <div className="flex flex-col gap-4 py-4 md:gap-6 h-full">
            {children}
          </div>
        </div>
      </ScrollArea>
    </>
  )
}
