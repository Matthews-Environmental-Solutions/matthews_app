/* eslint-disable eol-last */
/* eslint-disable @typescript-eslint/quotes */
import { NgModule } from "@angular/core";
import { EnumFormatPipe } from "./enum-format.pipe";

@NgModule({
  declarations: [EnumFormatPipe],
  imports: [],
  exports: [EnumFormatPipe]
})
export class PipesModule {
   static forRoot() {
    return {
        ngModule: PipesModule,
        providers: [],
    };
 }
}
