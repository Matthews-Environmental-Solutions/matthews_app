/* eslint-disable eol-last */
/* eslint-disable no-trailing-spaces */
/* eslint-disable @typescript-eslint/quotes */
import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: 'camelCase' })
export class CamelCasePipe implements PipeTransform{
    transform(value: string) {
        if (value !== undefined) {
        value = value.split(/(?=[A-Z])/).join(' ');
        value = value[0].toUpperCase() + value.slice(1);
        }
        return value;
    } 
}