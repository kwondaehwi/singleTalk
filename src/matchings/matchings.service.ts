import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import { CreateMatchingDto } from './dto/create-matching.dto';

@Injectable()
export class MatchingsService {
    constructor(
        private connection: Connection,
    ){}

    async create(createMatchingDto: CreateMatchingDto, userIdx: number){
        
    }
}
