import { useState, useEffect } from "react";
import { fragranceApi } from "../../services/api";
import { FragranceData } from "@/components/Order/OrderForm/types";
import { Category } from "@/components/FragranceManager/types";

const useFragrances = (transformForDropdown = false) => {
  const [data, setData] = useState<FragranceData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFragrances = async () => {
    try {
      setLoading(true);
      const response = await fragranceApi.getAll();
      const fragrances = response.data.data || [];

      setData(fragrances);

      if (transformForDropdown) {
        const uniqueCategories = fragrances.map(
          (f: FragranceData) => f.category
        );
        const transformed = [...new Set(uniqueCategories)].map(
          (category: string): Category => ({
            id: category,
            value: category,
            label: category,
            category: category,
          })
        );
        setCategories(transformed);
      }
    } catch (err) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFragrances();
  }, [transformForDropdown]);

  return {
    data,
    categories,
    loading,
    error,
    refetch: fetchFragrances,
  };
};

export default useFragrances;
