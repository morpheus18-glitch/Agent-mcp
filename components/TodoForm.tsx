"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import type { Todo } from "@/types/database"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TodoFormProps {
  todo: Todo | null
  userId?: number
  onSuccess: () => void
}

export default function TodoForm({ todo, userId, onSuccess }: TodoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dueDate, setDueDate] = useState<string>(
    todo?.due_date ? new Date(todo.due_date).toISOString().split("T")[0] : "",
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: todo?.title || "",
      description: todo?.description || "",
      status: todo?.status || "pending",
      priority: todo?.priority || "medium",
    },
  })

  async function onSubmit(data: Record<string, unknown>) {
    try {
      setIsSubmitting(true)
      setError(null)

      const todoData = {
        ...data,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
        user_id: todo?.user_id || userId,
      }

      const url = todo ? `/api/todos/${todo.id}` : "/api/todos"
      const method = todo ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(todoData),
      })

      if (!response.ok) {
        throw new Error(`Failed to ${todo ? "update" : "create"} todo`)
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...register("title", { required: "Title is required" })} placeholder="Enter todo title" />
        {errors.title && <p className="text-sm text-red-500">{errors.title.message as string}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register("description")} placeholder="Enter todo description" rows={3} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select defaultValue={todo?.status || "pending"}>
            <SelectTrigger id="status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <input type="hidden" {...register("status")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select defaultValue={todo?.priority || "medium"}>
            <SelectTrigger id="priority">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
          <input type="hidden" {...register("priority")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="due_date">Due Date</Label>
        <Input id="due_date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : todo ? "Update Todo" : "Create Todo"}
        </Button>
      </div>
    </form>
  )
}
