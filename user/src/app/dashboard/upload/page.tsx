import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import UploadForm from './upload-form'

export default async function UploadPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  // Fetch metrics for first upload check
  const { count } = await supabase
    .from('tracks')
    .select('*', { count: 'exact', head: true })
    .eq('artist_id', user.id)

  // Fetch User Profile for Autofill
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const isFirstUpload = (count || 0) === 0

  // Check for pending releases if on Solo plan
  if (profile?.plan_type === 'solo') {
    const { data: pendingTrack } = await supabase
      .from('tracks')
      .select('title')
      .eq('artist_id', user.id)
      .eq('status', 'pending')
      .maybeSingle()

    if (pendingTrack) {
      return (
        <div className="max-w-4xl mx-auto py-12 px-4 text-center space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 md:p-12 space-y-6">
            <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto">
              <span className="text-4xl">⏳</span>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Upload Locked</h2>
              <p className="text-zinc-400 max-w-md mx-auto">
                You currently have a release <strong>"{pendingTrack.title}"</strong> pending approval. 
                On the Single Artist plan, you can only have one active release at a time.
              </p>
            </div>
            <div className="pt-4">
              <a 
                href="/dashboard" 
                className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-semibold transition-all"
              >
                Go to Dashboard
              </a>
            </div>
          </div>
        </div>
      )
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">
          {isFirstUpload ? 'Your First Release' : 'Upload Music'}
        </h1>
      </div>
      <UploadForm isFirstUpload={isFirstUpload} userProfile={profile} />
    </div>
  )
}
