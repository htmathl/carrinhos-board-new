"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Database } from "@/lib/database.types"

import latamLogo from '@/app/assets/latam_logo.svg'
import AzulLogo from '@/app/assets/azul_logo.svg'
import Image from 'next/image'

type DadosLatam = Database['public']['Tables']['dados_latam']['Row']
type DadosAzul = Database['public']['Tables']['dados_azul']['Row']

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

const mapMesNumero = (mesNome: string): number => {
  const meses: Record<string, number> = {
    'Janeiro': 1, 'Fevereiro': 2, 'Março': 3, 'Abril': 4,
    'Maio': 5, 'Junho': 6, 'Julho': 7, 'Agosto': 8,
    'Setembro': 9, 'Outubro': 10, 'Novembro': 11, 'Dezembro': 12
  }
  return meses[mesNome] || 1
}

export default function ReportPage() {
  const params = useParams()
  const cartao = params?.cartao as string
  const ano = params?.ano as string
  const mes = params?.mes as string

  const router = useRouter()
  const supabase = createClient()

  const [tableData, setTableData] = useState<Array<{despesa: string, categoria: string, valor: string}>>([])
  const [pieData, setPieData] = useState<Array<{categoria: string, valor: number}>>([])
  const [lineData, setLineData] = useState<Array<{mes: string, valor: number}>>([])
  const [loading, setLoading] = useState(true)

  const lineColor = cartao === "azul" ? "#026CB6" : "#E8114B"

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const tabela = cartao === "latam" ? "dados_latam" : "dados_azul"
      const mesNumero = mapMesNumero(mes)

      // Buscar dados do mês atual
      const { data: dadosMesAtual, error: errorMesAtual } = await supabase
        .from(tabela)
        .select('*')
        .eq('ano', parseInt(ano))
        .eq('mes', mesNumero)

      if (errorMesAtual) {
        console.error('Erro ao buscar dados do mês:', errorMesAtual)
        setLoading(false)
        return
      }

      // Buscar dados do ano para gráfico de linha
      const { data: dadosAno, error: errorAno } = await supabase
        .from(tabela)
        .select('*')
        .eq('ano', parseInt(ano))

      if (errorAno) {
        console.error('Erro ao buscar dados do ano:', errorAno)
      }

      // Processar dados da tabela
      const dadosTabela = (dadosMesAtual as (DadosLatam | DadosAzul)[])?.map(item => ({
        despesa: item.despesa,
        categoria: item.categoria || 'Outros',
        valor: new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(item.valor || 0)
      })) || []
      setTableData(dadosTabela)

      // Processar dados para gráfico de pizza (agrupado por categoria)
      const categorias = (dadosMesAtual as (DadosLatam | DadosAzul)[])?.reduce((acc, item) => {
        const categoria = item.categoria || 'Outros'
        const valor = item.valor || 0
        if (!acc[categoria]) {
          acc[categoria] = 0
        }
        acc[categoria] += valor
        return acc
      }, {} as Record<string, number>)

      const dadosPizza = Object.entries(categorias || {}).map(([categoria, valor]) => ({
        categoria,
        valor
      }))
      setPieData(dadosPizza)

      // Processar dados para gráfico de linha (agrupado por mês)
      const mesesMap: Record<number, string> = {
        1: 'Jan', 2: 'Fev', 3: 'Mar', 4: 'Abr', 5: 'Mai', 6: 'Jun',
        7: 'Jul', 8: 'Ago', 9: 'Set', 10: 'Out', 11: 'Nov', 12: 'Dez'
      }

      const meses = (dadosAno as (DadosLatam | DadosAzul)[])?.reduce((acc, item) => {
        const mesNum = item.mes || 1
        const valor = item.valor || 0
        if (!acc[mesNum]) {
          acc[mesNum] = 0
        }
        acc[mesNum] += valor
        return acc
      }, {} as Record<number, number>)

      const dadosLinha = Object.entries(meses || {})
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([mesNum, valor]) => ({
          mes: mesesMap[parseInt(mesNum)],
          valor
        }))
      setLineData(dadosLinha)

      setLoading(false)
    }

    fetchData()
  }, [cartao, ano, mes, supabase])

  // Calcular o total
  const totalDespesas = tableData.reduce((acc, item) => {
    // Remove R$, espaços, pontos (milhares) e troca vírgula por ponto
    const valorLimpo = item.valor
      .replace('R$', '')
      .trim()
      .replace(/\./g, '')
      .replace(',', '.')
    
    const valor = parseFloat(valorLimpo)
    
    // Verifica se é um número válido antes de somar
    return acc + (isNaN(valor) ? 0 : valor)
  }, 0)

  const totalFormatado = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(totalDespesas)

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-xl">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 lg:py-8 lg:px-[5vw]">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 lg:mb-6">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold flex items-center gap-2">
          <Image 
            src={cartao === "latam" ? latamLogo : AzulLogo} 
            alt={cartao === "latam" ? "LATAM" : "Azul"}
            style={{transform: `scale(${cartao === "latam" ? 1 : 0.7})`}}
            className="object-contain"
          />
          {mes} de {ano}
        </h1>
        <Button onClick={() => router.push("/dashboard")}>Voltar</Button>
      </header>

      {/* Gráficos em linha */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        {/* Gráfico de Linha */}
        <Card className="bg-zinc-900 border-zinc-800 w-full overflow-hidden">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-white text-lg sm:text-xl">
              Despesas por Mês
            </CardTitle>
            <CardDescription className="text-zinc-400 text-sm">
              Evolução mensal dos gastos
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="w-full overflow-hidden">
              <ChartContainer
                config={{
                  valor: {
                    label: "Valor",
                    color: lineColor,
                  },
                }}
                className="h-[250px] sm:h-[300px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={lineData}
                    margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="mes"
                      stroke="#9CA3AF"
                      tick={{ fontSize: 12 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      stroke="#9CA3AF"
                      tick={{ fontSize: 12 }}
                      width={60}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="valor"
                      stroke={lineColor}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Pizza */}
        <Card className="bg-zinc-900 border-zinc-800 w-full overflow-hidden">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-white text-lg sm:text-xl">
              Despesas por Categoria
            </CardTitle>
            <CardDescription className="text-zinc-400 text-sm">
              Distribuição de gastos
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="w-full overflow-hidden">
              <ChartContainer
                config={{
                  valor: {
                    label: "Valor",
                    color: "#0088FE",
                  },
                }}
                className="h-[250px] sm:h-[300px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => {
                        if (typeof window !== 'undefined' && window.innerWidth < 640) {
                          return `${(percent * 100).toFixed(0)}%`
                        }
                        return `${name} ${(percent * 100).toFixed(0)}%`
                      }}
                      outerRadius={typeof window !== 'undefined' && window.innerWidth < 640 ? 60 : 80}
                      fill="#8884d8"
                      dataKey="valor"
                      nameKey="categoria"
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <ChartTooltip 
                      content={<ChartTooltipContent 
                        formatter={(value) => {
                          return new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(value as number)
                        }}
                      />} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela */}
      <Card className="bg-zinc-900 border-zinc-800 w-full overflow-hidden">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-white text-lg sm:text-xl">
            Detalhamento de Despesas
          </CardTitle>
          <CardDescription className="text-zinc-400 text-sm">
            Lista completa de transações
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="max-h-[300px] overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableHead className="text-zinc-300 text-sm sm:text-base whitespace-nowrap">
                    Despesa
                  </TableHead>
                  <TableHead className="text-zinc-300 text-sm sm:text-base whitespace-nowrap">
                    Categoria
                  </TableHead>
                  <TableHead className="text-zinc-300 text-right text-sm sm:text-base whitespace-nowrap">
                    Valor
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData.map((item, index) => (
                  <TableRow
                    key={index}
                    className="border-zinc-800 hover:bg-zinc-800/50"
                  >
                    <TableCell className="text-white text-sm sm:text-base">
                      {item.despesa}
                    </TableCell>
                    <TableCell className="text-zinc-400 text-sm sm:text-base">
                      {item.categoria}
                    </TableCell>
                    <TableCell className="text-white text-right text-sm sm:text-base whitespace-nowrap">
                      {item.valor}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="border-t-2 border-zinc-700 bg-zinc-800/70 font-bold">
                  <TableCell className="text-white text-sm sm:text-base" colSpan={2}>
                    Total
                  </TableCell>
                  <TableCell className="text-white text-right text-sm sm:text-base whitespace-nowrap">
                    {totalFormatado}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}