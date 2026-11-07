import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Category } from './category.entity';

@Entity('listings')
export class Listing {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column('int')
  price: number;

  @Index()
  @Column()
  city: string;

  @Column('text', { nullable: true })
  imageUrl: string | null;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Category, (category) => category.listings, { eager: true })
  @JoinColumn()
  category: Category;

  @ManyToOne(() => User, (user) => user.listings, { eager: true })
  @JoinColumn()
  author: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
