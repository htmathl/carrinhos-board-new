"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Database } from "@/lib/database.types"
import { CompactTable } from '@table-library/react-table-library/compact'
import { useTheme } from '@table-library/react-table-library/theme'
import { getTheme } from '@table-library/react-table-library/baseline'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import latamLogo from '@/app/assets/latam_logo.svg'
import AzulLogo from '@/app/assets/azul_logo.svg'
import Image from 'next/image'

type DadosLatam = Database['public']['Tables']['dados_latam']['Row']
type DadosAzul = Database['public']['Tables']['dados_azul']['Row']

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82ca9d", "#ffc658", "#ff7c7c", "#8dd1e1", "#a4de6c", "#d0ed57"]

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

  const [tableData, setTableData] = useState<Array<{id: string, despesa: string, categoria: string, valor: string, valorNumerico: number}>>([])
  const [filteredTableData, setFilteredTableData] = useState<Array<{id: string, despesa: string, categoria: string, valor: string, valorNumerico: number}>>([])
  const [pieData, setPieData] = useState<Array<{categoria: string, valor: number}>>([])
  const [lineData, setLineData] = useState<Array<{mes: string, valor: number}>>([])
  const [dadosAnoCompleto, setDadosAnoCompleto] = useState<(DadosLatam | DadosAzul)[]>([])
  const [loading, setLoading] = useState(true)
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("todas")
  const [categorias, setCategorias] = useState<string[]>([])

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

      // Armazenar dados do ano completo
      setDadosAnoCompleto((dadosAno as (DadosLatam | DadosAzul)[]) || [])

      // Processar dados da tabela e ordenar por valor decrescente
      const dadosTabela = (dadosMesAtual as (DadosLatam | DadosAzul)[])?.map((item, index) => ({
        id: `${index}`,
        despesa: item.despesa,
        categoria: item.categoria!,
        valorNumerico: item.valor || 0,
        valor: new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(item.valor || 0)
      })) || []
      
      // Ordenar por valor decrescente
      dadosTabela.sort((a, b) => b.valorNumerico - a.valorNumerico)
      setTableData(dadosTabela)
      setFilteredTableData(dadosTabela)

      // Extrair categorias únicas
      const categoriasUnicas = Array.from(new Set(dadosTabela.map(item => item.categoria))).sort()
      setCategorias(categoriasUnicas)

      // Processar dados para gráfico de pizza (agrupado por categoria)
      const categorias = (dadosMesAtual as (DadosLatam | DadosAzul)[])?.reduce((acc, item) => {
        const categoria = item.categoria!
        const valor = item.valor || 0
        if (!acc[categoria]) {
          acc[categoria] = 0
        }
        acc[categoria] += valor
        return acc
      }, {} as Record<string, number>)

      // Ordenar por valor decrescente e pegar apenas as 10 maiores
      const dadosPizzaOrdenados = Object.entries(categorias || {})
        .map(([categoria, valor]) => ({
          categoria,
          valor
        }))
        .sort((a, b) => b.valor - a.valor)
      
      // Pegar as 10 maiores categorias
      const top10 = dadosPizzaOrdenados.slice(0, 10)
      
      setPieData(top10)

      setLoading(false)
    }

    fetchData()
  }, [cartao, ano, mes, supabase])

  // Efeito para processar dados do gráfico de linha quando categoria filtro mudar
  useEffect(() => {
    const mesesMap: Record<number, string> = {
      1: 'Jan', 2: 'Fev', 3: 'Mar', 4: 'Abr', 5: 'Mai', 6: 'Jun',
      7: 'Jul', 8: 'Ago', 9: 'Set', 10: 'Out', 11: 'Nov', 12: 'Dez'
    }

    // Filtrar dados por categoria se não for "todas"
    const dadosFiltrados = categoriaFiltro === "todas" 
      ? dadosAnoCompleto 
      : dadosAnoCompleto.filter(item => item.categoria === categoriaFiltro)

    const meses = dadosFiltrados.reduce((acc, item) => {
      const mesNum = item.mes || 1
      const valor = item.valor || 0
      if (!acc[mesNum]) {
        acc[mesNum] = 0
      }
      acc[mesNum] += valor
      return acc
    }, {} as Record<number, number>)

    const dadosLinha = Object.entries(meses)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .map(([mesNum, valor]) => ({
        mes: mesesMap[parseInt(mesNum)],
        valor
      }))
    
    setLineData(dadosLinha)
  }, [categoriaFiltro, dadosAnoCompleto])

  // Efeito para filtrar dados quando a categoria mudar
  useEffect(() => {
    if (categoriaFiltro === "todas") {
      setFilteredTableData(tableData)
    } else {
      setFilteredTableData(tableData.filter(item => item.categoria === categoriaFiltro))
    }
  }, [categoriaFiltro, tableData])

  // Calcular o total baseado nos dados filtrados
  const totalDespesas = filteredTableData.reduce((acc, item) => {
    return acc + item.valorNumerico
  }, 0)

  const totalFormatado = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(totalDespesas)

  // Configurar tema da tabela
  const theme = useTheme([
    getTheme(),
    {
      Table: `
        --data-table-library_grid-template-columns: 40% 30% 30%;
        background-color: #18181b !important;
        color: #ffffff !important;
        font-size: 14px;
      `,
      Header: `
        background-color: #27272a !important;
        color: #d4d4d8 !important;
        font-weight: 600;
        font-size: 14px;
      `,
      Body: `
        background-color: #18181b !important;
      `,
      BaseRow: `
        background-color: #18181b !important;
        border-bottom: 1px solid #3f3f46;
        &:hover {
          background-color: #27272a !important;
        }
      `,
      HeaderRow: `
        background-color: #27272a !important;
        border-bottom: 2px solid #52525b;
      `,
      Row: `
        background-color: #18181b !important;
        color: #ffffff !important;
      `,
      BaseCell: `
        padding: 12px 16px;
        color: #ffffff !important;
        &:last-of-type {
          text-align: right;
        }
      `,
      HeaderCell: `
        color: #d4d4d8 !important;
      `,
    },
  ])

  // Definir colunas
  const COLUMNS = [
    { 
      label: 'Despesa', 
      renderCell: (item: typeof tableData[0]) => item.despesa,
      pinLeft: true
    },
    { 
      label: 'Categoria', 
      renderCell: (item: typeof tableData[0]) => (
        <span style={{ color: '#a1a1aa' }}>{item.categoria}</span>
      )
    },
    { 
      label: 'Valor', 
      renderCell: (item: typeof tableData[0]) => item.valor 
    },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-xl">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 lg:py-8 lg:px-[5vw]">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
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
              Top 10 categorias
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
                          fill={COLORS[index]}
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-white text-lg sm:text-xl">
                Detalhamento de Despesas
              </CardTitle>
              <CardDescription className="text-zinc-400 text-sm">
                Lista completa de transações
              </CardDescription>
            </div>
            <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
              <SelectTrigger className="w-[200px] bg-zinc-800 border-zinc-700 text-white">
                <SelectValue placeholder="Filtrar categoria" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                <SelectItem value="todas" className="text-white hover:bg-zinc-700">
                  Todas as categorias
                </SelectItem>
                {categorias.map((cat) => (
                  <SelectItem 
                    key={cat} 
                    value={cat}
                    className="text-white hover:bg-zinc-700"
                  >
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:px-6 flex flex-col">
          <div 
            className="overflow-y-auto" 
            style={{ 
              minHeight: '240px',
              maxHeight: '60vh'
            }}
          >
            <CompactTable 
              columns={COLUMNS} 
              data={{ nodes: filteredTableData }} 
              theme={theme}
              layout={{ custom: true, horizontalScroll: true, fixedHeader: true }}
            />
          </div>
          
          {/* Linha de Total - Fixo no footer */}
          <div className="border-t-2 border-zinc-700 bg-zinc-800/70 p-4 font-bold">
            <div className="grid grid-cols-[40%_30%_30%]">
              <div className="col-span-2 text-white">Total</div>
              <div className="text-white text-right">{totalFormatado}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}