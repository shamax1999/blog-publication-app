import { supabase } from "./supabase"

export async function ensureUserProfile(userId: string, email: string, fullName?: string) {
  try {
    // Check if profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single()

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 is "not found" error, which is expected if profile doesn't exist
      throw fetchError
    }

    if (!existingProfile) {
      // Create profile
      const { error: createError } = await supabase.from("profiles").insert({
        id: userId,
        email: email,
        full_name: fullName || "",
      })

      if (createError) {
        throw createError
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Error ensuring user profile:", error)
    return { success: false, error }
  }
}

export async function generateUniqueSlug(baseSlug: string, excludeId?: string) {
  let slug = baseSlug
  let counter = 1

  while (true) {
    const query = supabase.from("posts").select("id").eq("slug", slug)

    if (excludeId) {
      query.neq("id", excludeId)
    }

    const { data } = await query.single()

    if (!data) {
      // Slug is unique
      return slug
    }

    // Slug exists, try with counter
    slug = `${baseSlug}-${counter}`
    counter++
  }
}
