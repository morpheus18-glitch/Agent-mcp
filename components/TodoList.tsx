"use client";

import type React from "react";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, title: "Review agent configurations", status: "completed" },
    { id: 2, title: "Test conversation flow", status: "in_progress" },
    { id: 3, title: "Analyze conversation results", status: "pending" },
  ]);
  const [newTodoTitle, setNewTodoTitle] = useState("");

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;

    const newTodo = {
      id: todos.length + 1,
      title: newTodoTitle,
      status: "pending",
    };

    setTodos([...todos, newTodo]);
    setNewTodoTitle("");
  };

  const handleDeleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Todo Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <form onSubmit={handleAddTodo} className="flex gap-2">
            <Input
              placeholder="Add a new todo..."
              value={newTodoTitle}
              onChange={(e) => setNewTodoTitle(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">Add</Button>
          </form>

          <div className="space-y-2">
            {todos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
              >
                <span>{todo.title}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10">
                    {todo.status}
                  </span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteTodo(todo.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
