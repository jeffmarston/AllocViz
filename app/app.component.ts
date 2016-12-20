import { Component } from '@angular/core';
import { Observable } from "rxjs/Observable";

@Component({
    selector: 'my-app',
    template: `
    <div class="flex-columns">
        <div class="flex-rows">
            <alloc-map></alloc-map>
        </div>
    </div>
    `,
    styles: [` 
        .flex-rows { 
            display: flex;
            height: 100%;
        }
    `]
})
export class AppComponent {
    private connectionState$: Observable<string>;
}
