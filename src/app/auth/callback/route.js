import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import crypto from 'crypto'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && session?.user) {
      const user = session.user
      
      // If user has no organization_id, they just signed up via Google!
      if (!user.user_metadata?.organization_id) {
        const adminSupabase = createAdminClient()
        const newOrgId = crypto.randomUUID()
        const userName = user.user_metadata?.full_name || user.email.split('@')[0]
        
        // 1. Create Organization
        await adminSupabase.from("organizations").insert([{
          id: newOrgId,
          name: `${userName}'s Workspace`,
          status: "Active"
        }])

        // 2. Setup Subscription (Free Trial or similar)
        const expiryDate = new Date()
        expiryDate.setDate(expiryDate.getDate() + 14) // 14 day trial
        const expiryStr = expiryDate.toISOString().split("T")[0]

        await adminSupabase.from("subscriptions").insert([{
          organization_id: newOrgId,
          plan_name: "Pro Monthly",
          status: "Active",
          expiry_date: expiryStr
        }])

        // 3. Give 1 Outlet Slot
        await adminSupabase.from("outlet_slots").insert([{
          organization_id: newOrgId,
          plan_name: "Professional",
          status: "Unassigned",
          expiry_date: expiryStr
        }])

        // 4. Update user metadata
        await adminSupabase.auth.admin.updateUserById(user.id, {
          user_metadata: {
            ...user.user_metadata,
            organization_id: newOrgId,
            name: userName
          }
        })

        // Force refresh session by getting it again using standard client
        await supabase.auth.getUser()
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/?error=AuthFailed`)
}
