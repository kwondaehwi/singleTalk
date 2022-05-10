import { IsBoolean, IsEmail, IsNumber, IsString } from "class-validator";
import { Posting } from "src/postings/entities/posting.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Board {
    @PrimaryGeneratedColumn()
    boardIdx: number;
    @Column()
    @IsString()
    type: string;
    @Column()
    @IsString()
    category: string;

    @OneToMany(() => Posting, posting => posting.board)
    postings: Posting[];
}