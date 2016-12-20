import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IAllocation, IResizeDelta } from "../types.d"


@Component({
    selector: 'dimension-block',
    template: `
    <div (mousemove)="resizing($event)"
         (mouseup)="resizingFinish()"
         (mouseleave)="resizingFinish()" >
        <div class="level-bounds"        
                *ngFor="let alloc of allocs; let k = index;" >
            <div class="resizable"
                    [ngClass]="{'selected': alloc.selected, 'level3': !alloc.selected }"
                    [style.height]="alloc.value + 'px'">
                <div (click)="setSelectedItem(alloc)" class="clickable">{{alloc.name}} ({{ alloc.value | number: '1.0-0' }})</div>
        
                <div class="resizer" (mousedown)="resizingStart($event, alloc)" ></div>
            </div>
            
            <div class="overlay" 
                 [style.height]="alloc.value + alloc.next.value + 'px'" 
                 [style.width]="200 * overlayMult + 'px'" 
                 style="margin-left: 200px; overflow: hidden;" 
                 *ngIf="alloc.isResizing">
                <img *ngIf="alloc.isAllocating" src="http://gifyu.com/images/squares.gif"/>
            </div>

        </div>
    </div>

    `,
    styleUrls: ['app/components/dimension-block.component.css']
})

export class DimensionBlockComponent {
    private allocs: IAllocation[];
    private resizingItem = null;
    private selectedItem = null;

    @Output() onResizing = new EventEmitter<IResizeDelta>();
    @Input() overlayMult: number;

    @Input()
    set allocations(allocations: IAllocation[]) {
        this.allocs = allocations;
        this.assignSiblings(this.allocs);
    }

    private setSelectedItem(alloc) {
        if (this.selectedItem) {
            this.selectedItem.selected = false;
        }
        this.selectedItem = alloc;
        this.selectedItem.selected = true;
    }

    private resizing($event) {
        if (this.resizingItem && this.resizingItem.next) {
            let delta = $event.clientY - this.resizingItem.clientY;

            this.resizingItem.value += delta;
            this.resizingItem.next.value -= delta;
            
            this.resizingItem.clientY = $event.clientY;
            this.resizingItem.isResizing = true;
            this.onResizing.emit({ delta: delta, item: this.resizingItem} );
        }
    }

    private resizingStart($event, alloc) {
        this.resizingItem = alloc;
        this.resizingItem.clientY = $event.clientY;
    }

    private resizingFinish() {
        let alloc = this.resizingItem;
        if (alloc) {
            alloc.isAllocating = true;
            setTimeout(() => {
                alloc.isAllocating = false;
                alloc.isResizing = false;
                //this.fixNumbers(this.alloc);
            }, 400);
        }
        this.resizingItem = null;
    }

    private assignSiblings(allocs: IAllocation[]) {
        if (allocs && allocs.length > 1) {
            for (var j = 0; j < allocs.length-1; j++) {
                allocs[j].next = allocs[j+1];
            }
        }
    }
}
