import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Listing } from './listing.entity';

@Entity('favorites')
@Unique(['user', 'listing'])
export class Favorite {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @ManyToOne(() => Listing, { onDelete: 'CASCADE' })
  @JoinColumn()
  listing: Listing;

  @CreateDateColumn()
  createdAt: Date;
}
