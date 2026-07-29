"use client";
import ProductForm from "@/components/admin/products/ProductForm";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function EditProductPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/admin/products" className="text-blue-600 hover:underline">
          &larr; Back to Products
        </Link>
        <h1 className="text-2xl font-bold mt-2">Edit Product</h1>
      </div>
      <ProductForm productId={id} />
    </div>
  );
}
