import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseClient.auth.getUser(token)

    if (!user) {
      throw new Error('No user found')
    }

    const sampleClothing = [
      // Shirts
      { name: "Classic White Dress Shirt", category: "shirts", color: "White", brand: "Brooks Brothers" },
      { name: "Navy Blue Polo Shirt", category: "shirts", color: "Navy", brand: "Ralph Lauren" },
      { name: "Black Cotton T-Shirt", category: "shirts", color: "Black", brand: "Uniqlo" },
      { name: "Red Flannel Shirt", category: "shirts", color: "Red", brand: "L.L.Bean" },
      { name: "Gray Henley Shirt", category: "shirts", color: "Gray", brand: "J.Crew" },
      { name: "Blue Denim Shirt", category: "shirts", color: "Blue", brand: "Levi's" },
      { name: "Green Oxford Shirt", category: "shirts", color: "Green", brand: "Bonobos" },
      { name: "Pink Button-Down Shirt", category: "shirts", color: "Pink", brand: "Charles Tyrwhitt" },
      { name: "Purple Striped Shirt", category: "shirts", color: "Purple", brand: "Hugo Boss" },
      { name: "Yellow Linen Shirt", category: "shirts", color: "Yellow", brand: "Everlane" },

      // Pants
      { name: "Dark Blue Jeans", category: "pants", color: "Blue", brand: "Levi's" },
      { name: "Black Dress Pants", category: "pants", color: "Black", brand: "Hugo Boss" },
      { name: "Khaki Chinos", category: "pants", color: "Khaki", brand: "Dockers" },
      { name: "Gray Wool Trousers", category: "pants", color: "Gray", brand: "Brooks Brothers" },
      { name: "Navy Joggers", category: "pants", color: "Navy", brand: "Adidas" },
      { name: "Brown Corduroys", category: "pants", color: "Brown", brand: "J.Crew" },
      { name: "White Linen Pants", category: "pants", color: "White", brand: "Zara" },
      { name: "Green Cargo Pants", category: "pants", color: "Green", brand: "Carhartt" },
      { name: "Burgundy Dress Pants", category: "pants", color: "Burgundy", brand: "Calvin Klein" },
      { name: "Light Blue Jeans", category: "pants", color: "Light Blue", brand: "Gap" },

      // Shoes
      { name: "Black Leather Oxfords", category: "shoes", color: "Black", brand: "Allen Edmonds" },
      { name: "Brown Loafers", category: "shoes", color: "Brown", brand: "Cole Haan" },
      { name: "White Sneakers", category: "shoes", color: "White", brand: "Adidas" },
      { name: "Navy Canvas Shoes", category: "shoes", color: "Navy", brand: "Converse" },
      { name: "Gray Running Shoes", category: "shoes", color: "Gray", brand: "Nike" },
      { name: "Tan Boots", category: "shoes", color: "Tan", brand: "Timberland" },
      { name: "Black Dress Boots", category: "shoes", color: "Black", brand: "Thursday Boot Company" },
      { name: "Red High-Top Sneakers", category: "shoes", color: "Red", brand: "Vans" },
      { name: "Green Hiking Boots", category: "shoes", color: "Green", brand: "Merrell" },
      { name: "Blue Boat Shoes", category: "shoes", color: "Blue", brand: "Sperry" },

      // Jackets
      { name: "Black Leather Jacket", category: "jackets", color: "Black", brand: "Schott" },
      { name: "Navy Blazer", category: "jackets", color: "Navy", brand: "Brooks Brothers" },
      { name: "Gray Wool Coat", category: "jackets", color: "Gray", brand: "Burberry" },
      { name: "Brown Bomber Jacket", category: "jackets", color: "Brown", brand: "Alpha Industries" },
      { name: "Green Field Jacket", category: "jackets", color: "Green", brand: "Barbour" },
      { name: "Blue Denim Jacket", category: "jackets", color: "Blue", brand: "Levi's" },
      { name: "White Windbreaker", category: "jackets", color: "White", brand: "Patagonia" },
      { name: "Red Puffer Jacket", category: "jackets", color: "Red", brand: "North Face" },
      { name: "Tan Trench Coat", category: "jackets", color: "Tan", brand: "Banana Republic" },
      { name: "Charcoal Suit Jacket", category: "jackets", color: "Charcoal", brand: "Hugo Boss" },

      // Accessories
      { name: "Black Leather Belt", category: "accessories", color: "Black", brand: "Coach" },
      { name: "Brown Leather Wallet", category: "accessories", color: "Brown", brand: "Fossil" },
      { name: "Silver Watch", category: "accessories", color: "Silver", brand: "Seiko" },
      { name: "Navy Tie", category: "accessories", color: "Navy", brand: "Hermès" },
      { name: "Black Sunglasses", category: "accessories", color: "Black", brand: "Ray-Ban" },
      { name: "Gray Beanie", category: "accessories", color: "Gray", brand: "Carhartt" },
      { name: "Red Scarf", category: "accessories", color: "Red", brand: "Burberry" },
      { name: "Blue Baseball Cap", category: "accessories", color: "Blue", brand: "New Era" },
      { name: "Green Backpack", category: "accessories", color: "Green", brand: "Herschel" },
      { name: "White Socks", category: "accessories", color: "White", brand: "Bombas" },
    ]

    // Check if user already has sample data
    const { data: existingItems } = await supabaseClient
      .from('wardrobe_items')
      .select('id')
      .eq('user_id', user.id)
      .eq('name', 'Classic White Dress Shirt')

    if (existingItems && existingItems.length > 0) {
      return new Response(
        JSON.stringify({ message: 'Sample wardrobe already populated' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Insert sample clothing items
    const itemsToInsert = sampleClothing.map(item => ({
      ...item,
      user_id: user.id,
      wear_count: Math.floor(Math.random() * 10),
      purchase_date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }))

    const { error } = await supabaseClient
      .from('wardrobe_items')
      .insert(itemsToInsert)

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ 
        message: 'Sample wardrobe populated successfully',
        itemsAdded: itemsToInsert.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})