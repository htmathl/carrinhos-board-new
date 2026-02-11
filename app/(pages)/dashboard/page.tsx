"use client"

import { Database } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import latamLogo from '../../assets/latam_logo.svg'
import InterLogo from '../../assets/inter_logo.svg'
import Image from 'next/image'
import GhostLoader from '@/components/loader/GhostLoader'
import { Loader2 } from 'lucide-react'

type User = Database['public']['Tables']['user']['Row']['nome']

export default function DashboardPage() {
    const router = useRouter()
    const supabase = createClient()
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [loadingYear, setLoadingYear] = useState(false)
    const [navigating, setNavigating] = useState(false)
    const [initialLoad, setInitialLoad] = useState(true)

    const anoAtual = new Date().getFullYear()
    const [anos] = useState<number[]>(
        Array.from({ length: anoAtual - 2024 + 1 }, (_, i) => 2024 + i)
    )
    const [anoSelecionado, setAnoSelecionado] = useState<number>(anoAtual)

    const [latamMeses, setLatamMeses] = useState<string[]>([])
    const [interMeses, setInterMeses] = useState<string[]>([])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
    }

    const handleNavigateToReport = (cartao: string, mes: string) => {
        setNavigating(true)
        router.push(`/report/${cartao}/${anoSelecionado}/${mes}`)
    }

    const mapMeses = (mesNumber: number) => {
        return {
            1: 'Janeiro',
            2: 'Fevereiro',
            3: 'Março',
            4: 'Abril',
            5: 'Maio',
            6: 'Junho',
            7: 'Julho',
            8: 'Agosto',
            9: 'Setembro',
            10: 'Outubro',
            11: 'Novembro',
            12: 'Dezembro',
        }[mesNumber]
    }

    useEffect(() => {
        const fetchData = async () => {
            if (initialLoad) {
                setLoading(true)
            } else {
                setLoadingYear(true)
            }
            
            const startTime = Date.now()

            const { data: userData } = await supabase.auth.getUser()
            const email = userData.user?.email

            if (!email) {
                console.error('Usuário não autenticado')
                setLoading(false)
                setLoadingYear(false)
                setInitialLoad(false)
                return
            }

            const { data, error } = await supabase
                .from('user')
                .select('nome')
                .eq('email', email)

            if (error) {
                console.error('Erro ao buscar usuário:', error)
            } else {
                setUser(data[0]?.nome || null)
            }

            const { data: latamData, error: latamError } = await supabase
                .from('dados_latam')
                .select('mes')
                .eq('ano', anoSelecionado)

            if (latamError) {
                console.error('Erro ao buscar dados LATAM:', latamError)
            } else {
                const mesesUnicos = Array.from(new Set(latamData?.map(item => item.mes))).sort((a, b) => (a as number) - (b as number))
                const mesesNomes = mesesUnicos.map(mes => mapMeses(mes as number)).filter(Boolean) as string[]
                setLatamMeses(mesesNomes)
            }

            const { data: interData, error: interError } = await supabase
                .from('dados_azul')
                .select('mes')
                .eq('ano', anoSelecionado)

            if (interError) {
                console.error('Erro ao buscar dados INTER:', interError)
            } else {
                const mesesUnicos = Array.from(new Set(interData?.map(item => item.mes))).sort((a, b) => (a as number) - (b as number))
                const mesesNomes = mesesUnicos.map(mes => mapMeses(mes as number)).filter(Boolean) as string[]
                setInterMeses(mesesNomes)
            }

            // Garantir que o loader apareça por pelo menos 2 segundos apenas no carregamento inicial
            if (initialLoad) {
                const elapsedTime = Date.now() - startTime
                const remainingTime = Math.max(0, 2000 - elapsedTime)
                
                setTimeout(() => {
                    setLoading(false)
                    setInitialLoad(false)
                }, remainingTime)
            } else {
                // Ao trocar de ano, remove o loader imediatamente após carregar
                setLoadingYear(false)
            }
        }

        fetchData()
    }, [anoSelecionado, supabase, initialLoad])

    if (loading || navigating) {
        return <GhostLoader />
    }

    return (
        <div className="bg-black min-h-screen flex flex-col items-center justify-center p-4">
            <header className="flex flex-col justify-between items-center gap-2">
                <h1 className="text-white text-3xl mb-8">Bem-vindo ❤️ {user}</h1>
                <div className="flex gap-2 mb-8">
                    {anos.map((ano) => (
                        <Button
                            key={ano}
                            variant={ano === anoSelecionado ? 'outline' : 'default'}
                            onClick={() => setAnoSelecionado(ano)}
                            disabled={loadingYear}
                        >
                            {ano}
                        </Button>
                    ))}
                </div>
            </header>

            {loadingYear ? (
                <div className="flex items-center justify-center h-72">
                    <Loader2 className="w-12 h-12 text-white animate-spin" />
                </div>
            ) : (
                <div className="text-center w-full">
                    <div className="flex flex-wrap gap-6 h-100 w-full justify-center mb-8">
                        <Card className="w-[300px] min-h-72 p-6 bg-[#E8114B] text-white border-0">
                            <div className="h-12 mb-6">
                                <Image src={latamLogo} alt="LATAM" style={{ transform: "scale(1.5)", margin: "auto" }} />
                            </div>
                            <div className="flex flex-col gap-3 items-center">
                                {latamMeses.length > 0 ? (
                                    latamMeses.map((mes) => (
                                        <Button
                                            key={mes}
                                            className="bg-transparent border-2 border-white text-white hover:bg-white/10 hover:border-white w-[160px]"
                                            onClick={() => handleNavigateToReport('latam', mes)}
                                        >
                                            {mes}
                                        </Button>
                                    ))
                                ) : (
                                    <div>Nenhum dado disponível</div>
                                )}
                            </div>
                        </Card>

                        {/* Old: #026CB6 */}
                        <Card className="w-[300px] p-6 bg-[#ff7a00] text-white border-0">
                            <div className="h-12 mb-6">
                                <Image src={InterLogo} alt="INTER" style={{ transform: "scale(1)", margin: "auto" }} />
                            </div>
                            <div className="flex flex-col gap-3 items-center">
                                {interMeses.length > 0 ? (
                                    interMeses.map((mes) => (
                                        <Button
                                            key={mes}
                                            className="bg-transparent border-2 border-white text-white hover:bg-white/10 hover:border-white w-[160px]"
                                            onClick={() => handleNavigateToReport('inter', mes)}
                                        >
                                            Em breve ;)
                                        </Button>
                                    ))
                                ) : (
                                    <div>Em breve ;)</div>
                                )}
                            </div>
                        </Card>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition"
                    >
                        Sair
                    </button>
                </div>
            )}
        </div>
    )
}