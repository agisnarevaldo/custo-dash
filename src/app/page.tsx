import { CustomerAccount } from '@/components/CustomerAccount'
import ProductList from './product-list'

export default function ProductsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <CustomerAccount />
      </div>
      <h1 className="text-3xl font-bold mb-6">Our Products</h1>
      <ProductList />
    </div>
  )
}