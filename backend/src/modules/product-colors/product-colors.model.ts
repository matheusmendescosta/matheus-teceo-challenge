import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';
import BaseModel from '../../../commons/models/base.model';
import Color from '../colors/colors.model';
import Product from '../products/products.model';
import Sku from '../skus/skus.model';

@Entity('product_colors')
@Index(['product_id'])
@Index(['color_id'])
@Index(['product_id', 'color_id'])
export default class ProductColor extends BaseModel {
  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id', referencedColumnName: 'id' })
  product: Product;

  @Column({ name: 'product_id', type: 'uuid' })
  product_id: string;

  @ManyToOne(() => Color)
  @JoinColumn({ name: 'color_id', referencedColumnName: 'id' })
  color: Color;

  @Column({ name: 'color_id', type: 'uuid' })
  color_id: string;

  @OneToMany(() => Sku, (sku) => sku.productColor)
  skus: Sku[];
}
