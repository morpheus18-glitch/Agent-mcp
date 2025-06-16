import { query } from "./db"

// Template types
export interface Template {
  id: number
  name: string
  description: string
  category: string
  content: unknown
  tags: string[]
  created_by: number
  is_public: boolean
  created_at: string
  updated_at: string
}

// Create a new template
export async function createTemplate(template: Omit<Template, "id" | "created_at" | "updated_at">) {
  try {
    const result = await query(
      `INSERT INTO templates (name, description, category, content, tags, created_by, is_public)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        template.name,
        template.description,
        template.category,
        template.content,
        template.tags,
        template.created_by,
        template.is_public,
      ],
    )

    return result.rows[0]
  } catch (error) {
    console.error("Error creating template:", error)
    throw error
  }
}

// Get a template by ID
export async function getTemplateById(id: number) {
  try {
    const result = await query(`SELECT * FROM templates WHERE id = $1`, [id])

    return result.rows[0] || null
  } catch (error) {
    console.error("Error getting template:", error)
    throw error
  }
}

// Update a template
export async function updateTemplate(
  id: number,
  template: Partial<Omit<Template, "id" | "created_at" | "updated_at">>,
) {
  try {
    // Build the SET clause dynamically based on provided fields
    const updates: string[] = []
    const values: unknown[] = []
    let paramIndex = 1

    if (template.name !== undefined) {
      updates.push(`name = $${paramIndex++}`)
      values.push(template.name)
    }

    if (template.description !== undefined) {
      updates.push(`description = $${paramIndex++}`)
      values.push(template.description)
    }

    if (template.category !== undefined) {
      updates.push(`category = $${paramIndex++}`)
      values.push(template.category)
    }

    if (template.content !== undefined) {
      updates.push(`content = $${paramIndex++}`)
      values.push(template.content)
    }

    if (template.tags !== undefined) {
      updates.push(`tags = $${paramIndex++}`)
      values.push(template.tags)
    }

    if (template.is_public !== undefined) {
      updates.push(`is_public = $${paramIndex++}`)
      values.push(template.is_public)
    }

    // Add updated_at
    updates.push(`updated_at = NOW()`)

    // If no fields to update, return null
    if (updates.length === 0) {
      return null
    }

    // Add the ID to values
    values.push(id)

    const result = await query(
      `UPDATE templates
       SET ${updates.join(", ")}
       WHERE id = $${paramIndex}
       RETURNING *`,
      values,
    )

    return result.rows[0] || null
  } catch (error) {
    console.error("Error updating template:", error)
    throw error
  }
}

// Delete a template
export async function deleteTemplate(id: number) {
  try {
    const result = await query(`DELETE FROM templates WHERE id = $1 RETURNING id`, [id])

    return result.rows.length > 0
  } catch (error) {
    console.error("Error deleting template:", error)
    throw error
  }
}

// Search templates
export async function searchTemplates(options: {
  userId?: number
  category?: string
  tags?: string[]
  query?: string
  includePublic?: boolean
  page?: number
  limit?: number
}) {
  try {
    const { userId, category, tags, query, includePublic = true, page = 1, limit = 20 } = options

    // Build the WHERE clause
    const conditions: string[] = []
    const values: unknown[] = []
    let paramIndex = 1

    // Filter by user ID and public status
    if (userId) {
      if (includePublic) {
        conditions.push(`(created_by = $${paramIndex++} OR is_public = true)`)
        values.push(userId)
      } else {
        conditions.push(`created_by = $${paramIndex++}`)
        values.push(userId)
      }
    } else if (!includePublic) {
      conditions.push(`is_public = true`)
    }

    // Filter by category
    if (category) {
      conditions.push(`category = $${paramIndex++}`)
      values.push(category)
    }

    // Filter by tags (array overlap)
    if (tags && tags.length > 0) {
      conditions.push(`tags && $${paramIndex++}`)
      values.push(tags)
    }

    // Filter by search query
    if (query) {
      conditions.push(`(
        name ILIKE $${paramIndex} OR
        description ILIKE $${paramIndex} OR
        $${paramIndex} = ANY(tags)
      )`)
      values.push(`%${query}%`)
      paramIndex++
    }

    // Build the final query
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""

    // Calculate pagination
    const offset = (page - 1) * limit

    // Get total count
    const countResult = await query(`SELECT COUNT(*) as total FROM templates ${whereClause}`, values)

    const total = Number.parseInt(countResult.rows[0].total)

    // Get templates
    const templatesResult = await query(
      `SELECT * FROM templates
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      [...values, limit, offset],
    )

    return {
      templates: templatesResult.rows,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    }
  } catch (error) {
    console.error("Error searching templates:", error)
    throw error
  }
}

// Get template categories
export async function getTemplateCategories() {
  try {
    const result = await query(`SELECT DISTINCT category FROM templates ORDER BY category`)

    return result.rows.map((row) => row.category)
  } catch (error) {
    console.error("Error getting template categories:", error)
    throw error
  }
}

// Get template tags
export async function getTemplateTags() {
  try {
    const result = await query(`SELECT DISTINCT unnest(tags) as tag FROM templates ORDER BY tag`)

    return result.rows.map((row) => row.tag)
  } catch (error) {
    console.error("Error getting template tags:", error)
    throw error
  }
}

// Export the functions
export default {
  createTemplate,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
  searchTemplates,
  getTemplateCategories,
  getTemplateTags,
}
