import { BaseSuccessResDto } from "src/commons/response.dto";

export class MatchingResDto extends BaseSuccessResDto{
  constructor(result: any){
      super();
      this.result = result
  }
  result: any
}