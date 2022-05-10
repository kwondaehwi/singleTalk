import { IsBoolean, IsNumber, IsString } from "class-validator";
import { Board } from "src/boards/entities/board.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

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
        referencedColumnName: 'userIdx',
    })
    user: User;
    @ManyToOne(()=>Board, board=>board.postings)
    @JoinColumn({
        referencedColumnName: 'boardIdx',
    })
    board: Board;
}