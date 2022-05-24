import { IsBoolean, IsNumber, IsString } from "class-validator";
import { Board } from "src/boards/entities/board.entity";
import { Comment } from "src/comments/entities/comment.entity";
import { Common } from "src/commons/entity/common.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Matching extends Common {
    constructor(
        title: string,
        content: string,
        user: User,
        link: string,
        maxPeople: number,
    ){
        super();
        this.title = title;
        this.content = content;
        this.user = user;
        this.link = link;
        this.maxPeople = maxPeople;
        this.Done = false;
    }

    @PrimaryGeneratedColumn()
    matchingIdx: number;
    @Column()
    @IsString()
    title: string;
    @Column()
    @IsString()
    content: string;
    @Column()
    @IsNumber()
    userIdx: number;
    @Column()
    @IsNumber()
    maxPeople: number;
    @Column()
    @IsString()
    link: string;
    @Column({
        default: false,
    })
    @IsBoolean()
    Done: boolean;

    @ManyToOne(()=>User, user=>user.matchings)
    @JoinColumn({
        name: 'userIdx',
        referencedColumnName: 'userIdx',
    })
    user: User;
    @OneToMany(()=>UserMatching, userMatching=>userMatching.matching, {
        cascade: true,
    })
    userMatchings: UserMatching[];
}

@Entity()
export class UserMatching {
    @PrimaryGeneratedColumn()
    userMatchingIdx: number;
    @Column()
    @IsNumber()
    userIdx: number;
    @Column()
    @IsNumber()
    matchingIdx: number;

    @ManyToOne(()=>Matching, matching=>matching.userMatchings)
    @JoinColumn({
        name: 'matchingIdx',
        referencedColumnName: 'matchingIdx',
    })
    matching: Matching;
    @ManyToOne(()=>User, user=>user.userMatchings)
    @JoinColumn({
        name: 'userIdx',
        referencedColumnName: 'userIdx',
    })
    user: User;
}