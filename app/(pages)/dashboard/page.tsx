"use client"

import { Database } from '@/lib/database.types'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import latamLogo from '../../assets/latam_logo.svg'
import AzulLogo from '../../assets/azul_logo.svg'
import Image from 'next/image'

type User = Database['public']['Tables']['user']['Row']['nome']

export default function DashboardPage() {
    const router = useRouter()
    const supabase = createClient()
    const [user, setUser] = useState<User | null>(null)

    const anoAtual = new Date().getFullYear()
    const [anos] = useState<number[]>(
        Array.from({ length: anoAtual - 2024 + 1 }, (_, i) => 2024 + i)
    )
    const [anoSelecionado, setAnoSelecionado] = useState<number>(anoAtual)

    const [latamMeses, setLatamMeses] = useState<string[]>([])

    const [azulMeses, setAzulMeses] = useState<string[]>([])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
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
        const buscarUser = async () => {
            const { data: userData } = await supabase.auth.getUser()
            const email = userData.user?.email

            if (!email) {
                console.error('Usuário não autenticado')
                return
            }

            const { data, error } = await supabase
                .from('user')
                .select('nome')
                .eq('email', email)

            if (error) {
                console.error('Erro ao buscar usuário:', error)
                return null
            }
            setUser(data[0]?.nome || null)
        }

        const fetchLatamData = async () => {
            const { data, error } = await supabase
                .from('dados_latam')
                .select('mes')
                .eq('ano', anoSelecionado)

            if (error) {
                console.error('Erro ao buscar dados LATAM:', error)
                return
            }

            const mesesUnicos = Array.from(new Set(data?.map(item => item.mes))).sort((a, b) => (a as number) - (b as number))
            const mesesNomes = mesesUnicos.map(mes => mapMeses(mes as number)).filter(Boolean) as string[]
            setLatamMeses(mesesNomes)
        }

        const fetchAzulData = async () => {
            const { data, error } = await supabase
                .from('dados_azul')
                .select('mes')
                .eq('ano', anoSelecionado)

            if (error) {
                console.error('Erro ao buscar dados AZUL:', error)
                return
            }

            const mesesUnicos = Array.from(new Set(data?.map(item => item.mes))).sort((a, b) => (a as number) - (b as number))
            const mesesNomes = mesesUnicos.map(mes => mapMeses(mes as number)).filter(Boolean) as string[]
            setAzulMeses(mesesNomes)
        }

        fetchLatamData()
        fetchAzulData()
        buscarUser()
    }, [anoSelecionado, supabase])

    return (
        <div className="bg-black h-screen flex-row items-center justify-center">
            <header className="flex flex-col justify-between items-center gap-2">
                <h1 className="text-white text-3xl mb-8">Bem-vindo ❤️ {user}</h1>
                <div className="flex gap-2 mb-8">
                    {anos.map((ano) => (
                        <Button
                            key={ano}
                            variant={ano === anoSelecionado ? 'outline' : 'default'}
                            onClick={() => setAnoSelecionado(ano)}
                        >
                            {ano}
                        </Button>
                    ))}
                </div>
            </header>
            <div className="text-center">

                <div className="flex flex-wrap gap-6 h-72 w-full justify-center mb-8">
                    <Card className="w-[300px] p-6 bg-[#E8114B] text-white border-0">
                        <div className="h-12 mb-6">
                            <Image src={latamLogo} alt="LATAM" style={{ transform: "scale(1.5)", margin: "auto" }} />
                        </div>
                        <div className="flex flex-col gap-3 items-center">
                            {latamMeses.length > 0 ? (
                                latamMeses.map((mes) => (
                                    <Button
                                        key={mes}
                                        className="bg-transparent border-2 border-white text-white hover:bg-white/10 hover:border-white w-[160px]"
                                        onClick={() => router.push(`/report/[cartao]/[ano]/[mes]`.replace('[cartao]', 'latam').replace('[ano]', anoSelecionado.toString()).replace('[mes]', mes))}
                                    >
                                        {mes?.toString().padStart(2, '0')}
                                    </Button>
                                ))
                                ) : (
                                <div>Nenhum dado disponível</div>
                            )}
                        </div>
                    </Card>

                    <Card className="w-[300px] p-6 bg-[#026CB6] text-white border-0">
                        <div className="h-12 mb-6">
                            <Image src={AzulLogo} alt="AZUL" style={{ transform: "scale(1)", margin: "auto" }} />
                        </div>
                        <div className="flex flex-col gap-3 items-center">
                            {azulMeses.length > 0 ? (
                                azulMeses.map((mes) => (
                                    <Button
                                        key={mes}
                                        className="bg-transparent border-2 border-white text-white hover:bg-white/10 hover:border-white w-[160px]"
                                        onClick={() => router.push(`/report/azul/${anoSelecionado}/${mes}`)}
                                    >
                                        {mes}
                                    </Button>
                                ))
                            ) : (
                                <div>Nenhum dado disponível</div>
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
        </div>
    )
}