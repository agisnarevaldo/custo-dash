'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Product } from './types'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/products`)
      if (!res.ok) throw new Error('Failed to fetch products')
      const data = await res.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }, [])

  const setupEventSource = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    const eventSource = new EventSource(`${API_URL}/api/sse`)
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      console.log('SSE connection established')
      // Clear any pending reconnection timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log('Received SSE event:', data)

        switch (data.type) {
          case 'CONNECTED':
            console.log('Connected with client ID:', data.id)
            break
          case 'NEW_PRODUCT':
            setProducts(prevProducts => [data.product, ...prevProducts])
            break
          case 'EDIT_PRODUCT':
            setProducts(prevProducts => 
              prevProducts.map(product => 
                product.id === data.product.id ? data.product : product
              )
            )
            break
          case 'DELETE_PRODUCT':
            setProducts(prevProducts => 
              prevProducts.filter(product => product.id !== data.productId)
            )
            break
          default:
            console.warn('Unknown event type:', data.type)
        }
      } catch (error) {
        console.error('Error processing SSE event:', error)
      }
    }

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error)
      eventSource.close()
      eventSourceRef.current = null

      // Attempt to reconnect after 5 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log('Attempting to reconnect...')
        setupEventSource()
      }, 5000)
    }

    return eventSource
  }, [])

  useEffect(() => {
    fetchProducts()
    const eventSource = setupEventSource()

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [fetchProducts, setupEventSource])

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
    //  || (product.category && product.category.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      <div className="max-w-md mx-auto">
        <Label htmlFor="search">Search Products</Label>
        <Input
          id="search"
          type="text"
          placeholder="Search here..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mt-1"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="border rounded-lg p-4 shadow-sm">
            <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
            <p className="text-gray-600 mb-2">{product.description}</p>
            <p className="text-lg font-bold mb-2">${product.price.toFixed(2)}</p>
            <p className="text-sm text-gray-500">In stock: {product.stock}</p>
            {/* {product.category && (
              <p className="text-sm text-blue-500 mt-2">Category: {product.category}</p>
            )} */}
          </div>
        ))}
      </div>
      {filteredProducts.length === 0 && (
        <p className="text-center text-gray-500">No products found matching your search.</p>
      )}
    </div>
  )
}