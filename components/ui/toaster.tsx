"use client"

import * as React from "react"
import * as ToastPrimitive from "@base-ui/react/toast"
import { cn } from "@/lib/utils"

const { Provider, Root, Viewport, Action, Close, Description, Title } =
  ToastPrimitive.Toast

const ToastProvider = Provider

function ToastViewport({
  className,
  ...props
}: React.ComponentProps<typeof Viewport>) {
  return (
    <Viewport
      data-slot="toast-viewport"
      className={cn(
        "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col",
        className
      )}
      {...props}
    />
  )
}

function Toast({
  className,
  ...props
}: React.ComponentProps<typeof Root> & {
  className?: string
}) {
  return (
    <Root
      data-slot="toast"
      className={cn(
        "group pointer-events-auto flex w-full items-center justify-between space-x-4 rounded-lg border bg-popover p-4 pr-3 shadow-[--shadow-toast] transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:translate-y-[var(--radix-toast-swipe-move-y)] data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=end]:translate-y-[var(--radix-toast-swipe-end-y)]",
        className
      )}
      {...props}
    />
  )
}

function ToastAction({
  className,
  ...props
}: React.ComponentProps<typeof Action>) {
  return (
    <Action
      data-slot="toast-action"
      className={cn(
        "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-xs font-medium transition-colors hover:bg-accent data-[state=open]:bg-accent",
        className
      )}
      {...props}
    />
  )
}

function ToastClose({
  className,
  ...props
}: React.ComponentProps<typeof Close>) {
  return (
    <Close
      data-slot="toast-close"
      className={cn(
        "absolute right-2 top-2 rounded-sm p-1 text-foreground/50 opacity-100 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-1 data-[state=open]:opacity-100",
        className
      )}
      {...props}
    >
      <span className="sr-only">Close</span>
    </Close>
  )
}

function ToastDescription({
  className,
  ...props
}: React.ComponentProps<typeof Description>) {
  return (
    <Description
      data-slot="toast-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function ToastTitle({
  className,
  ...props
}: React.ComponentProps<typeof Title>) {
  return (
    <Title
      data-slot="toast-title"
      className={cn("text-sm font-semibold", className)}
      {...props}
    />
  )
}

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastClose,
}
