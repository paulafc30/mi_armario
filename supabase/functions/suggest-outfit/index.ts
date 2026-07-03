import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const OCCASIONS: Record<string, string> = {
  casual: 'casual del dia a dia',
  trabajo: 'oficina o trabajo profesional',
  cena: 'cena o salida nocturna',
  gym: 'deporte o gimnasio',
  evento: 'evento especial o celebracion',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { occasion, lat, lon } = await req.json()

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return new Response(JSON.stringify({ error: 'No auth' }), { status: 401, headers: corsHeaders })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (authError || !user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })

    // Fetch armario (excluir prendas en venta, vendidas y archivadas)
    const { data: clothes, error: dbError } = await supabase
      .from('clothes')
      .select('id, name, brand, category_id, colors, tags, size, image_url')
      .eq('user_id', user.id)
      .not('status', 'in', '("en_venta","vendida","archivada")')
      .limit(120)

    if (dbError) throw new Error(dbError.message)
    if (!clothes || clothes.length < 3) {
      return new Response(
        JSON.stringify({ error: 'Pocas prendas en el armario para sugerir outfits.' }),
        { status: 400, headers: corsHeaders }
      )
    }

    // Clima via Open-Meteo (gratis, sin API key)
    let weatherDesc = 'clima desconocido'
    if (lat && lon) {
      try {
        const wRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode&timezone=auto`
        )
        const wData = await wRes.json()
        const tempC = Math.round(wData.current?.temperature_2m)
        const wLabel = weatherCodeToLabel(wData.current?.weathercode)
        weatherDesc = `${tempC}C, ${wLabel}`
      } catch { /* opcional */ }
    }

    const inventory = clothes.map((c) => ({
      id: c.id,
      nombre: c.name,
      marca: c.brand || null,
      colores: c.colors || [],
      talla: c.size || null,
    }))

    const occasionLabel = OCCASIONS[occasion] || occasion

    const prompt = `Eres un estilista personal. El usuario tiene este armario (JSON):
${JSON.stringify(inventory)}

Condiciones: ocasion=${occasionLabel}, clima=${weatherDesc}

Sugiere exactamente 3 outfits usando SOLO IDs de prendas de la lista. Cada outfit: 3-5 prendas. Responde UNICAMENTE con JSON valido, sin texto extra:
[{"name":"nombre creativo","item_ids":["uuid1","uuid2","uuid3"],"reason":"explicacion max 50 palabras"}]`

    // Llamada a Groq API (OpenAI-compatible)
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('GROQ_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1024,
        temperature: 0.7,
      }),
    })

    if (!groqRes.ok) {
      const err = await groqRes.text()
      throw new Error(`Groq API error: ${err}`)
    }

    const groqData = await groqRes.json()
    const rawText = groqData.choices?.[0]?.message?.content ?? '[]'

    const jsonMatch = rawText.match(/\[[\s\S]*\]/)
    if (!jsonMatch) throw new Error('La IA no devolvio JSON valido')
    const outfits = JSON.parse(jsonMatch[0])

    // Enriquecer con datos reales de las prendas
    const clothesMap = Object.fromEntries(clothes.map((c) => [c.id, c]))
    const enriched = outfits.map((outfit: any) => ({
      name: outfit.name,
      reason: outfit.reason,
      items: (outfit.item_ids || []).map((id: string) => clothesMap[id]).filter(Boolean),
      weather: weatherDesc,
    }))

    return new Response(JSON.stringify({ outfits: enriched }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

function weatherCodeToLabel(code: number): string {
  if (code === 0) return 'despejado'
  if (code <= 3) return 'parcialmente nublado'
  if (code <= 49) return 'niebla'
  if (code <= 59) return 'llovizna'
  if (code <= 69) return 'lluvia'
  if (code <= 79) return 'nieve'
  if (code <= 99) return 'tormenta'
  return 'variable'
}
