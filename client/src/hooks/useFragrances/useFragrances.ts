import { useState, useEffect } from "react";
import { fragranceApi } from "../../services/api";
import { FragranceData } from "@/components/Order/OrderForm/types";
import { Category } from "@/components/FragranceManager/types";

const useFragrances = (transformForDropdown = false) => {
  const [data, setData] = useState<FragranceData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [nextIds, setNextIds] = useState<{ id: string; fragrance_id: string }>({
    id: "",
    fragrance_id: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFragrances = async () => {
    try {
      setLoading(true);
      const response = await fragranceApi.getAll();
      console.log("RESPONSE", response);
      const fragrances = response.data.data || [];

      setData(fragrances);

      const maxId = Math.max(...fragrances.map((f) => parseInt(f.id)));
      const nextId = String(maxId + 1);
      const paddedId = nextId.padStart(3, "0");
      setNextIds({
        id: nextId,
        fragrance_id: `FRAG-${paddedId}`,
      });

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
    nextIds,
    refetch: fetchFragrances,
  };
};

export default useFragrances;
