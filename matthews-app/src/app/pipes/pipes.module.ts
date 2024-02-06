/* eslint-disable eol-last */
/* eslint-disable @typescript-eslint/quotes */
import { NgModule } from "@angular/core";
import { EnumFormatPipe } from "./enum-format.pipe";
import { CamelCasePipe } from "./camel-case.pipe";
import { SortPipe } from "./sort.pipe";

@NgModule({
  declarations: [EnumFormatPipe, CamelCasePipe, SortPipe],
  imports: [],
  exports: [EnumFormatPipe, CamelCasePipe, SortPipe]
})
export class PipesModule {
   static forRoot() {
    return {
        ngModule: PipesModule,
        providers: [],
    };
 }
}
