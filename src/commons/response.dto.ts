import { IsBoolean, IsNumber, IsString } from "class-validator";

export class BaseResponseDto{
    constructor(){}
    @IsString()
    msg: string;
    result: any;
}

export class BaseSuccessResDto extends BaseResponseDto{
    constructor(){
        super();
        this.result = true;
    }
}


export class BaseFailResDto extends BaseResponseDto{
    constructor(){
        super();
        this.result = false;
    }
}

export class BaseFailMsgResDto extends BaseResponseDto{
    constructor(msg: string){
        super();
        this.result = false;
        this.msg = msg;
    }
}