import { login } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ShieldCheck, ArrowRight, Lock } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 relative overflow-hidden selection:bg-indigo-500/30">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      <div className="absolute top-0 w-full h-full bg-zinc-950/80 pointer-events-none" />
      
      {/* Glowing Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="w-full max-w-md p-8 relative z-10 animate-in fade-in zoom-in-95 duration-700">
        
        {/* Main Card */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
          {/* Subtle top border glow */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-inner ring-1 ring-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20" />
                <ShieldCheck className="w-8 h-8 text-indigo-400 relative z-10" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight text-center mb-2">MusicFlow Admin</h1>
            <p className="text-sm text-zinc-400 font-medium text-center">
              Secure portal for platform administration
            </p>
          </div>

          <form action={login} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">Admin Email</Label>
                <div className="relative">
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      placeholder="admin@musicflow.com" 
                      required 
                      className="pl-4 pr-10 bg-black/40 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-indigo-500/50 h-12 rounded-xl transition-all font-mono text-sm"
                    />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password" className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Password</Label>
                </div>
                <div className="relative">
                    <Input 
                      id="password" 
                      name="password" 
                      type="password" 
                      placeholder="••••••••"
                      required 
                      className="pl-4 pr-10 bg-black/40 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-indigo-500/50 h-12 rounded-xl transition-all font-mono text-xl tracking-widest"
                    />
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                </div>
              </div>
            </div>

            <Button 
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white border-0 rounded-xl font-bold uppercase tracking-wider transition-all relative overflow-hidden group/btn shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] mt-4" 
              type="submit"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]" />
              <span className="flex items-center justify-center gap-2 relative z-10">
                Authenticate <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </span>
            </Button>
          </form>
        </div>
        
        {/* Footer info */}
        <p className="text-center text-xs text-zinc-600 font-mono mt-8 uppercase tracking-widest">
            MusicFlow Internal Systems &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
