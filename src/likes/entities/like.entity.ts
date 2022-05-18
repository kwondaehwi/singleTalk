import { IsNumber } from "class-validator";
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
    postingIdx: number;
    @Column()
    @IsNumber()
    type: string;

    @ManyToOne(()=>User, user=>user.likes)
    @JoinColumn({
        name: 'userIdx',
        referencedColumnName: 'userIdx',
    })
    user: User;
    @ManyToOne(()=>Posting, posting=>posting.likes, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({
        name: 'postingIdx',
        referencedColumnName: 'postingIdx',
    })
    posting: Posting;
}
