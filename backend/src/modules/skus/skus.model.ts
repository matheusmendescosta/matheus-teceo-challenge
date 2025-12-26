import { Column, Entity, JoinColumn, ManyToOne, Index } from 'typeorm';
import BaseModel from '../../../commons/models/base.model';
import Color from '../colors/colors.model';
import ProductColor from '../product-colors/product-colors.model';

@Entity('skus')
@Index(['product_color_id'])
@Index(['product_size_id'])
export default class Sku extends BaseModel {
  @ManyToOne(() => ProductColor)
  @JoinColumn({ name: 'product_color_id', referencedColumnName: 'id' })
  productColor: ProductColor;

  @Column({ name: 'product_color_id', type: 'uuid' })
  product_color_id: string;

  @ManyToOne(() => Color)
  @JoinColumn({ name: 'product_size_id', referencedColumnName: 'id' })
  productSize: Color;

  @Column({ name: 'product_size_id', type: 'uuid' })
  product_size_id: string;

  @Column({ name: 'price', type: 'numeric' })
  price: number;
}
