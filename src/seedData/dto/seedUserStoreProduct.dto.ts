import { Type } from 'class-transformer';
import { IsNotEmpty, ValidateNested } from 'class-validator';

export class SeedUserStoreProductDto {
  @IsNotEmpty()
  location: string;
  @IsNotEmpty()
  storeName: string;
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => Product)
  products: Product[];
}

class Product {
  @IsNotEmpty()
  productName: string;
  @IsNotEmpty()
  star: number;
  @IsNotEmpty()
  category: string;
  @IsNotEmpty()
  price: string;

  @IsNotEmpty()
  description: string;
  @IsNotEmpty()
  productImage: string[];
}
