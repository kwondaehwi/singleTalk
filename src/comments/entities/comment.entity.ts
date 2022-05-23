import { IsBoolean, IsNumber, IsString } from "class-validator";
import { Common } from "src/commons/entity/common.entity";
import { Posting } from "src/postings/entities/posting.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

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
    isAnonymous: boolean;
    @Column({
        default: false,
    })
    @IsBoolean()
    isDeleted: boolean;

    @ManyToOne(()=>User, user=>user.comments)
    @JoinColumn({
        name: 'userIdx',
        referencedColumnName: 'userIdx',
    })
    user: User;
    @ManyToOne(()=>Posting, posting=>posting.comments, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({
        name: 'postingIdx',
        referencedColumnName: 'postingIdx',
    })
    posting: Posting;
    @OneToMany(()=>Reply, reply=>reply.comment, {
        cascade: true,
    })
    replies: Reply[];
}

@Entity()
export class Reply extends Common {
    @PrimaryGeneratedColumn()
    replyIdx: number;
    @Column()
    @IsNumber()
    userIdx: number;
    @Column()
    @IsNumber()
    commentIdx: number;
    @Column()
    @IsString()
    content: string;
    @Column()
    @IsBoolean()
    isAnonymous: boolean;
    @Column({
        default: false,
    })
    @IsBoolean()
    isDeleted: boolean;

    @ManyToOne(()=>User, user=>user.replies)
    @JoinColumn({
        name: 'userIdx',
        referencedColumnName: 'userIdx',
    })
    user: User;
    @ManyToOne(()=>Comment, comment=>comment.replies, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({
        name: 'commentIdx',
        referencedColumnName: 'commentIdx',
    })
    comment: Comment;
}