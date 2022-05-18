import { Exclude } from "class-transformer";
import { IsString } from "class-validator";
import { Comment, Reply } from "src/comments/entities/comment.entity";
import { Like } from "src/likes/entities/like.entity";
import { Posting } from "src/postings/entities/posting.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity("user")
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
    @Column({ nullable: true })
    @Exclude()
    currentToken?: string;
    // @Column()
    // @IsString()
    // region: string;
    // @Column()
    // @IsEmail()
    // email: string;
    // @Column({
    //     nullable: true,
    // })
    // @IsString()
    // description: string

    @OneToMany(()=>Posting, posting=>posting.user)
    postings: Posting[];
    @OneToMany(()=>Like, like=>like.user)
    likes: Like[];
    @OneToMany(()=>Comment, comment=>comment.user)
    comments: Comment[];
    @OneToMany(()=>Reply, reply=>reply.user)
    replies: Reply[];

}