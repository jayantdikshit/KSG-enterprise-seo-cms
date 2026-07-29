import ProductsSection from '@/components/public/ProductsSection';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';

export const metadata = {
  title: "Products - KSG Energy",
  description: "Browse our innovative solar energy products and sustainable solutions.",
};

export default async function ProductsPage() {
  let productsList = [];

  try {
    await connectDB();
    const docs = await Product.find({ status: 'PUBLISHED' }).sort({ order: 1 }).lean();
    productsList = JSON.parse(JSON.stringify(docs));
  } catch (error) {
    console.error("Error fetching products:", error);
  }

  return (
    <main style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <ProductsSection products={productsList} />
    </main>
  );
}
