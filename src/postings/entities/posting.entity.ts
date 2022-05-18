import { IsBoolean, IsNumber, IsString } from "class-validator";
import { Board } from "src/boards/entities/board.entity";
import { Comment } from "src/comments/entities/comment.entity";
import { Common } from "src/commons/entity/common.entity";
import { Like } from "src/likes/entities/like.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Posting extends Common {
    @PrimaryGeneratedColumn()
    postingIdx: number;
    @Column()
    @IsNumber()
    boardIdx: number;
    @Column()
    @IsNumber()
    userIdx: number;
    @Column()
    @IsString()
    title: string;
    @Column()
    @IsString()
    content: string;
    @Column({
        default: false,
    })
    @IsBoolean()
    isAnonymous: boolean;

    @ManyToOne(()=>User, user=>user.postings)
    @JoinColumn({
        name: 'userIdx',
        referencedColumnName: 'userIdx',
    })
    user: User;
    @ManyToOne(()=>Board, board=>board.postings)
    @JoinColumn({
        name: 'boardIdx',
        referencedColumnName: 'boardIdx',
    })
    board: Board;
    @OneToMany(()=>Like, like=>like.posting, {
        cascade: true,
    })
    likes: Like[];
    @OneToMany(()=>Comment, comment=>comment.posting, {
        cascade: true,
    })
    comments: Comment[];
}