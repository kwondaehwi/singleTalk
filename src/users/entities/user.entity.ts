import { IsEmail, IsString } from "class-validator";
import { Posting } from "src/postings/entities/posting.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    userIdx: number;
    @Column()
    @IsString()
    userID: string;
    @Column()
    @IsString()
    password: string;
    @Column()
    @IsString()
    nickname: string;
    @Column()
    @IsString()
    region: string;
    @Column()
    @IsEmail()
    email: string;
    @Column({
        nullable: true,
    })
    @IsString()
    description: string

    @OneToMany(()=>Posting, posting=>posting.user)
    postings: Posting[];
}