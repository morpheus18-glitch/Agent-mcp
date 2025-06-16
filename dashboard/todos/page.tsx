import TodoList from "@/components/TodoList";

export default function TodosPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Todo Management</h1>
      <TodoList />
    </div>
  );
}
