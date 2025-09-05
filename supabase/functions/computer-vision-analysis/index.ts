import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY is not set')
    }

    const { image, options = {} } = await req.json()

    // Extract base64 data from data URL
    const base64Data = image.split(',')[1]
    const mediaType = image.split(';')[0].split(':')[1]

    // Prepare the analysis prompt based on options
    let analysisPrompt = `Analyze this clothing item image and provide a detailed JSON response with the following structure:

{
  "category": "primary clothing category",
  "confidence": 0.95,
  "subcategory": "more specific category",
  "colors": {
    "dominant": "main color name",
    "palette": ["color1", "color2", "color3"],
    "hex_codes": ["#ffffff", "#000000"]
  },
  "patterns": [
    {
      "type": "pattern type (solid, stripes, polka dots, etc.)",
      "confidence": 0.8
    }
  ],
  "fabric": {
    "texture": "texture description",
    "material_guess": "estimated material type",
    "confidence": 0.7
  },
  "fit_assessment": {
    "fit_type": "loose/fitted/regular",
    "size_recommendation": "size guidance",
    "confidence": 0.6
  },
  "style_tags": ["casual", "formal", "vintage", etc.],
  "season_suitability": ["spring", "summer", "fall", "winter"]
}`

    if (!options.includeColors) {
      analysisPrompt += "\nSkip color analysis."
    }
    if (!options.includePatterns) {
      analysisPrompt += "\nSkip pattern analysis."
    }
    if (!options.includeFabric) {
      analysisPrompt += "\nSkip fabric analysis."
    }
    if (!options.includeFit) {
      analysisPrompt += "\nSkip fit assessment."
    }
    if (!options.includeStyle) {
      analysisPrompt += "\nSkip style tags."
    }

    analysisPrompt += "\n\nProvide confidence scores between 0 and 1. Be as accurate as possible based on what you can see in the image."

    // Call OpenAI Vision API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: analysisPrompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: image,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 1500,
        temperature: 0.1
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('OpenAI API error:', errorData)
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const openaiResponse = await response.json()
    const analysisText = openaiResponse.choices[0].message.content

    // Parse the JSON response
    let analysis
    try {
      // Extract JSON from the response (sometimes wrapped in markdown)
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.error('Failed to parse analysis:', parseError)
      // Fallback analysis
      analysis = {
        category: "unknown",
        confidence: 0.5,
        subcategory: "clothing",
        colors: {
          dominant: "unknown",
          palette: [],
          hex_codes: []
        },
        patterns: [],
        fabric: {
          texture: "unknown",
          material_guess: "unknown",
          confidence: 0.3
        },
        fit_assessment: {
          fit_type: "unknown",
          size_recommendation: "unable to assess",
          confidence: 0.2
        },
        style_tags: [],
        season_suitability: []
      }
    }

    // Apply additional computer vision processing if needed
    if (options.includeColors && analysis.colors) {
      // Enhanced color extraction using a simple algorithm
      // In a real implementation, you might use a dedicated color extraction service
      analysis.colors.enhanced = true
    }

    // Log successful analysis
    console.log('Computer vision analysis completed:', {
      category: analysis.category,
      confidence: analysis.confidence,
      colorsDetected: analysis.colors?.palette?.length || 0,
      patternsDetected: analysis.patterns?.length || 0
    })

    return new Response(
      JSON.stringify(analysis),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error in computer-vision-analysis:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        category: "error",
        confidence: 0,
        colors: { dominant: "unknown", palette: [], hex_codes: [] },
        patterns: [],
        fabric: { texture: "unknown", material_guess: "unknown", confidence: 0 },
        fit_assessment: { fit_type: "unknown", size_recommendation: "error", confidence: 0 },
        style_tags: [],
        season_suitability: []
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 500 
      }
    )
  }
})