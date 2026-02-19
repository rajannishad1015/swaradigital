import { createClient } from '@/utils/supabase/server'
import UploadForm from './upload-form'

export default async function UploadPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

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
