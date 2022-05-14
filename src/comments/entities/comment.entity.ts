import { IsBoolean, IsNumber, IsString } from "class-validator";
import { Common } from "src/commons/entity/common.entity";
import { Posting } from "src/postings/entities/posting.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Comment extends Common {
    @PrimaryGeneratedColumn()
    commentIdx: number;
    @Column()
    @IsNumber()
    userIdx: number;
    @Column()
    @IsNumber()
    postingIdx: number;
    @Column()
    @IsString()
    content: string;
    @Column()
    @IsBoolean()
    isAnonymous: number;

    @ManyToOne(()=>User, user=>user.comments)
    @JoinColumn({
        name: 'userIdx',
        referencedColumnName: 'userIdx',
    })
    user: User;
    @ManyToOne(()=>Posting, posting=>posting.comments)
    @JoinColumn({
        name: 'postingIdx',
        referencedColumnName: 'postingIdx',
    })
    posting: Posting;
}