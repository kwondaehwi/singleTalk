import { BaseSuccessResDto } from "src/commons/response.dto";

export class UserResDto extends BaseSuccessResDto{
    constructor(result: any){
        super();
        this.res.result = result
    }
    result: any
}