import { IsNumber, IsString } from "class-validator";
import { Posting } from "src/postings/entities/posting.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Like {
    @PrimaryGeneratedColumn()
    likeIdx: number;
    @Column()
    @IsNumber()
    userIdx: number;
    @Column()
    @IsNumber()
    parentIdx: number;
    @Column()
    @IsString()
    type: string;
    @Column()
    @IsString()
    category: string;

    @ManyToOne(()=>User, user=>user.likes)
    @JoinColumn({
        name: 'userIdx',
        referencedColumnName: 'userIdx',
    })
    user: User;
}
