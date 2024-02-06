/* eslint-disable no-bitwise */
/* eslint-disable eol-last */
/* eslint-disable no-trailing-spaces */
/* eslint-disable @typescript-eslint/quotes */
import { Pipe, PipeTransform } from "@angular/core";
import { Observable } from "rxjs";
import { Case } from "../case/case";
import { map } from "rxjs/operators";

@Pipe({ name: 'sort' })
export class SortPipe implements PipeTransform {
    transform(cases: Case[]) {
        return cases.sort((a,b) => new Date(a.scheduledStartTime).getTime() - new Date(b.scheduledStartTime).getTime());  
    }
}