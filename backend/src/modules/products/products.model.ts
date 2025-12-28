import { Column, Entity, Index } from 'typeorm';
import BaseModel from '../../../commons/models/base.model';

@Entity('products')
@Index(['name'])
export default class Product extends BaseModel {
  @Column({ name: 'code', type: 'text' })
  code: string;

  @Column({ name: 'name', type: 'text' })
  name: string;

  @Column({ name: 'description', type: 'text' })
  description: string;

  @Column({ name: 'image_url', type: 'text' })
  imageUrl: string;
}
