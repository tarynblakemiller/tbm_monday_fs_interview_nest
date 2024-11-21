interface ColumnValues {
  text: string;
  text6: string;
  numbers: number;
  number?: number;
  dropdown: {
    labels: Label[];
  };
}

interface Label {
  id: string;
  name: string;
}

interface FormData {
  boardId: string;
  itemName: string;
  columnValues: ColumnValues;
}

interface MultiSelectProps {
  value: Label[];
  onChange: (selected: Label[]) => void;
  maxSelections: number;
  label: string;
  options: Label[];
  loading?: boolean;
  error?: Error | null;
}

interface FragranceData {
  id: string;
  name: string;
  category: string;
  description: string;
  image_url?: string;
  createdAt?: string;
  updatedAt?: string;
}

const initialState: FormData = {
  boardId: "7730832838",
  itemName: "",
  columnValues: {
    text: "",
    text6: "",
    numbers: 0,
    dropdown: {
      labels: [],
    },
  },
};

interface ErrorProps {
  message: string;
}

interface OrderButtonProps {
  onClick: (event: React.MouseEvent) => void;
  text: string;
}

export type {
  FormData,
  ColumnValues,
  FragranceData,
  ErrorProps,
  Label,
  OrderButtonProps,
};
export { initialState };

interface UseFragrancesReturn {
  data: FragranceData[];
  categories: Category[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}
