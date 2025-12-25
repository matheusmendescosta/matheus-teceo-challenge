import { Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import BaseModel from '../../../commons/models/base.model';
import Color from '../colors/colors.model';
import Product from '../products/products.model';
import Sku from '../skus/skus.model';

@Entity('product_colors')
export default class ProductColor extends BaseModel {
  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id', referencedColumnName: 'id' })
  product: Product;

  @ManyToOne(() => Color)
  @JoinColumn({ name: 'color_id', referencedColumnName: 'id' })
  color: Color;

  @OneToMany(() => Sku, (sku) => sku.productColor)
  skus: Sku[];
}
