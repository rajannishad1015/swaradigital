import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function RightsLayout({
  children,
}: {
  children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('plan_type')
        .eq('id', user.id)
        .single()

    const planType = profile?.plan_type
    const isPremium = planType === 'multi' || planType === 'elite'

    if (!isPremium) {
        redirect('/dashboard/billing?required=true')
    }

    return <>{children}</>
}
