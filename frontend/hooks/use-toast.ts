import * as React from "react"

type ToastProps = {
    title: string
    description?: string
    variant?: "default" | "destructive"
}

export function useToast() {
    const toast = React.useCallback((props: ToastProps) => {
        // Simple console log for now - you can enhance this later
        console.log(`Toast: ${props.title}`, props.description)

        // Optional: Show browser alert for errors
        if (props.variant === "destructive") {
            alert(`${props.title}: ${props.description}`)
        }
    }, [])

    return { toast }
}