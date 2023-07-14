/* eslint-disable no-bitwise */
/* eslint-disable eol-last */
/* eslint-disable no-trailing-spaces */
/* eslint-disable @typescript-eslint/quotes */
import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: 'enumFormat' })
export class EnumFormatPipe implements PipeTransform{
    transform(value: string) {
        const re = /_/g;
        let text = value.replace(re, ' ');
        text = text.toLowerCase();
        return text;
    }  
}