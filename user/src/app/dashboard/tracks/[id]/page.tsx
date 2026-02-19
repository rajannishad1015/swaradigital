import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import UploadForm from '../../upload/upload-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface PageProps {
    params: { id: string }
}

export default async function EditTrackPage({ params }: PageProps) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { id } = await params

    const { data: track, error } = await supabase
        .from('tracks')
        .select('*, albums(*)')
        .eq('id', id)
        .eq('artist_id', user.id)
        .single()

    if (error) {
        console.error("Error fetching track:", error);
    }

    // Normalize albums if it's returned as an array
    if (track && Array.isArray((track as any).albums)) {
        (track as any).albums = (track as any).albums[0];
    }




    if (error || !track) {
        notFound()
    }

    // Only allow editing if draft or rejected
    if (track.status !== 'draft' && track.status !== 'rejected') {
        return (
            <div className="p-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Cannot Edit Track</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>This track is {track.status} and cannot be edited. Please contact support if you need changes.</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Fetch User Profile for Autofill
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8 text-white">Edit Track: {track.title}</h1>
            <UploadForm initialData={track} userProfile={profile} />
        </div>
    )
}
