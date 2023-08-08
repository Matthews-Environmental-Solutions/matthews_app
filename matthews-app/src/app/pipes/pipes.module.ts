/* eslint-disable eol-last */
/* eslint-disable @typescript-eslint/quotes */
import { NgModule } from "@angular/core";
import { EnumFormatPipe } from "./enum-format.pipe";
import { CamelCasePipe } from "./camel-case.pipe";

@NgModule({
  declarations: [EnumFormatPipe, CamelCasePipe],
  imports: [],
  exports: [EnumFormatPipe, CamelCasePipe]
})
export class PipesModule {
   static forRoot() {
    return {
        ngModule: PipesModule,
        providers: [],
    };
 }
}
