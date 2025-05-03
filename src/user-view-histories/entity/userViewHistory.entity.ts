import { Entity, Column, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm"
import { User } from "../../users/entity/user.entity"
import { Product } from "../../products/entity/product.entity"
@Entity()
export class UserViewHistory {
    @PrimaryGeneratedColumn()
    userViewHistoryId: string

    @Column()
    userId: string

    @Column()
    productId: string

    @ManyToOne(() => User, (user) => user.userViewHistories)
    user: User

    @ManyToOne(() => Product, (product) => product.userViewHistories)
    product: Product

    @CreateDateColumn()
    createdAt: Date
}