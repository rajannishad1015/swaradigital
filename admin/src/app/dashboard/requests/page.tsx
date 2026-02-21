import { createClient } from '@/utils/supabase/server'
import { getRequests } from './actions'
import RequestsClient from './requests-client'
import { ClipboardList } from 'lucide-react'

export default async function RequestsPage({ searchParams }: { searchParams: Promise<{ type?: string, status?: string }> }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Verify Admin
    const { data: admin } = await supabase.from('profiles').select('role').eq('id', user?.id).single()
    if (admin?.role !== 'admin') {
        return <div>Unauthorized</div>
    }

    const searchParamsData = await searchParams
    const type = (searchParamsData.type as any) || 'profiling'
    const status = searchParamsData.status || 'pending'

    const requests = await getRequests(type)

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
                        <ClipboardList className="text-indigo-500" /> Requests Queue
                    </h1>
                    <p className="text-zinc-400 mt-1">Review and manage rights, tools, and profiling requests.</p>
                </div>
            </div>

            <RequestsClient initialRequests={requests || []} activeType={type} activeStatus={status} />
        </div>
    )
}
