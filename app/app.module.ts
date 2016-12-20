import { NgModule, Provider } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';

import { AppComponent } from "./app.component";
import { AllocMapComponent } from "./components/alloc-map.component"; 
import { DimensionBlockComponent } from "./components/dimension-block.component"; 
import { TradeService } from "./services/trade.service";

@NgModule({
    imports: [
        BrowserModule,
        HttpModule,
        FormsModule
    ],
    declarations: [
        AppComponent,
        AllocMapComponent,
        DimensionBlockComponent
    ],
    providers: [ TradeService ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
