import { IsBoolean, IsNumber, IsString } from "class-validator";
import { Board } from "src/boards/entities/board.entity";
import { Comment } from "src/comments/entities/comment.entity";
import { Joyful } from "src/joyfuls/entities/joyful.entity";
import { Useful } from "src/usefuls/entities/useful.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Posting {
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
    @OneToMany(()=>Useful, useful=>useful.posting)
    usefuls: Useful[];
    @OneToMany(()=>Joyful, joyful=>joyful.posting)
    joyfuls: Useful[];
    @OneToMany(()=>Comment, comment=>comment.posting)
    comments: Comment[];
}