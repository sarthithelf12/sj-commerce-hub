import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getProducts, type Product } from "@/utils/productStorage";

interface ProductSelectProps {
  value: string;
  onValueChange: (productId: string) => void;
  onProductSelect?: (product: Product) => void;
  className?: string;
  placeholder?: string;
}

export const ProductSelect = ({ value, onValueChange, onProductSelect, className, placeholder = "Select product" }: ProductSelectProps) => {
  const products = getProducts();

  const handleChange = (productId: string) => {
    onValueChange(productId);
    if (onProductSelect) {
      const product = products.find(p => p.id === productId);
      if (product) onProductSelect(product);
    }
  };

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {products.map(p => (
          <SelectItem key={p.id} value={p.id}>
            <span className="font-medium">{p.name}</span>
            <span className="text-muted-foreground ml-2 text-xs">({p.productCode})</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
