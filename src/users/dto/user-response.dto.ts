import { BaseSuccessResDto } from "src/commons/response.dto";

export class UserResDto extends BaseSuccessResDto{
    constructor(result: any){
        super();
        this.result = result
    }
    result: any
}