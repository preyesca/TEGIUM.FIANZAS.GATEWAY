import { Type } from "@nestjs/common";

export class GeneralValidator {
   
     public static collection_archivos_distinct(data:any[], props: any[]) {
        data = data.sort((a,b) => {
            return  a.version - b.version ;
        })
        return [...new Map(data.map(entry => [props.map(k => entry[k]).join('|'), entry])).values()];
     }
}
