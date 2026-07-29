"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/admin/ui/Toast";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (e) {
      showToast("Failed to fetch products", "error");
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showToast("Product deleted", "success");
        fetchProducts();
      } else {
        showToast(data.error, "error");
      }
    } catch (e) {
      showToast("Failed to delete product", "error");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link href="/admin/products/create" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Add New Product
        </Link>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Slug</th>
                <th className="p-4">Category</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod) => (
                <tr key={prod._id} className="border-b">
                  <td className="p-4">{prod.name}</td>
                  <td className="p-4 text-gray-500">{prod.slug}</td>
                  <td className="p-4">{prod.category || "-"}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${prod.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {prod.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <Link href={`/admin/products/${prod._id}`} className="text-blue-600 hover:underline">
                      Edit
                    </Link>
                    <button onClick={() => deleteProduct(prod._id)} className="text-red-600 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500">No products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
