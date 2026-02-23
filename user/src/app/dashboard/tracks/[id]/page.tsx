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

    if (error || !track) {
        notFound()
    }

    // Normalize albums if it's returned as an array
    if (track && Array.isArray((track as any).albums)) {
        (track as any).albums = (track as any).albums[0];
    }

    // If this track is part of an album, fetch all tracks in that album
    if (track.album_id) {
        const { data: albumTracks } = await supabase
            .from('tracks')
            .select('*')
            .eq('album_id', track.album_id)
            .order('created_at', { ascending: true })
        
        if (albumTracks) {
            track.tracks = albumTracks
        }
    }


    // Only allow editing if draft, rejected, or archived
    if (track.status !== 'draft' && track.status !== 'rejected' && track.status !== 'archived') {
        return (
            <div className="p-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Cannot Edit Track</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>This track is currently {track.status} and cannot be edited. Only Drafts, Rejected, or Archived tracks can be modified.</p>
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
