import { IsNumber } from "class-validator";
import { Posting } from "src/postings/entities/posting.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Joyful {
    @PrimaryGeneratedColumn()
    joyfulIdx: number;
    @Column()
    @IsNumber()
    userIdx: number;
    @Column()
    @IsNumber()
    postingIdx: number;

    @ManyToOne(()=>User, user=>user.joyfuls)
    @JoinColumn({
        name: 'userIdx',
        referencedColumnName: 'userIdx',
    })
    user: User;
    @ManyToOne(()=>Posting, posting=>posting.joyfuls)
    @JoinColumn({
        name: 'postingIdx',
        referencedColumnName: 'postingIdx',
    })
    posting: Posting;
}