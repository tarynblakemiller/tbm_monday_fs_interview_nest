import { Button, TextField, Dropdown } from "monday-ui-react-core";
import type { ComponentProps } from "react";

export interface Fragrance {
  id: string;
  fragrance_id: string;
  name: string;
  description: string;
  category: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  value: string;
  label: string;
  category: string;
}

export type DropdownOption = {
  value: string | number;
  label: string;
};

export interface FormData {
  id: string;
  fragrance_id: string;
  name: string;
  category: string;
  description: string;
}

export interface UseFragrancesReturn {
  data: Fragrance[];
  loading: boolean;
  categories: Category[];
  refetch: () => Promise<void>;
  error: Error | null;
}

export interface FragranceManagerProps {
  onClose?: () => void;
}

export interface FormErrors {
  invalid: boolean;
  duplicate: boolean;
}

export type FragranceTextFieldProps = ComponentProps<typeof TextField> & {
  name: keyof FormData;
};

export type FragranceDropdownProps = Omit<
  ComponentProps<typeof Dropdown>,
  "onChange"
> & {
  onChange: (value: DropdownOption | null) => void;
};

export type FragranceButtonProps = Omit<
  ComponentProps<typeof Button>,
  "onClick"
> & {
  onClick?: () => void;
};
