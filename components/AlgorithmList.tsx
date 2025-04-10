"use client"

import { useState, useEffect } from "react"
import type { Algorithm } from "@/types/database"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"

export default function AlgorithmList() {
  const [algorithms, setAlgorithms] = useState<Algorithm[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAlgorithms() {
      try {
        const response = await fetch("/api/algorithms")
        if (!response.ok) {
          throw new Error("Failed to fetch algorithms")
        }
        const data = await response.json()
        setAlgorithms(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAlgorithms()
  }, [])

  if (isLoading) {
    return <div className="flex justify-center p-4">Loading algorithms...</div>
  }

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Algorithms</CardTitle>
      </CardHeader>
      <CardContent>
        {algorithms.length === 0 ? (
          <p>No algorithms found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {algorithms.map((algorithm) => (
                <TableRow key={algorithm.id}>
                  <TableCell>{algorithm.name}</TableCell>
                  <TableCell>{algorithm.description}</TableCell>
                  <TableCell>{algorithm.created_by}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
