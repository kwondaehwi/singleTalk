import { BaseSuccessResDto } from "src/commons/response.dto";

export class PostingResDto extends BaseSuccessResDto{
    constructor(result: any){
        super();
        this.result = result
    }
    result: any
}