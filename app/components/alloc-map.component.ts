import { Component, OnInit, Input, OnChanges, SimpleChange } from '@angular/core';
import { CommonModule } from "@angular/common";
import { Http, Response } from "@angular/http";
import { TradeService } from "../services/trade.service"
import { IAllocation, IResizeDelta, IDimentionBasket } from "../types.d"


@Component({
    selector: 'alloc-map',
    templateUrl: 'app/components/alloc-map.component.html',
    styleUrls: ['app/components/alloc-map.component.css'],
    providers: [TradeService]
})
export class AllocMapComponent implements OnInit {
    private root: IAllocation = null;

    private dummyData = [
        { "Amount": 33.0,  "Symbol": "T", "Strategy2": "Heads", "Custodian": "EARTH", "Strategy": "GOOSE", "Portfolio": "Eze Credit Fund", "Action": "Buy", "Manager": "TM" },
        { "Amount": 15.0,  "Symbol": "T", "Strategy2": "Heads", "Custodian": "FIRE",  "Strategy": "GOOSE", "Portfolio": "Eze Credit Fund", "Action": "Buy", "Manager": "TM" },
        { "Amount": 15.0,  "Symbol": "T", "Strategy2": "Heads", "Custodian": "FIRE",  "Strategy": "DUCK",  "Portfolio": "Eze Credit Fund", "Action": "Buy", "Manager": "TM" },
        { "Amount": 105.0, "Symbol": "T", "Strategy2": "Heads", "Custodian": "EARTH", "Strategy": "GOOSE", "Portfolio": "Eze Master Fund", "Action": "Buy", "Manager": "TM" },
        { "Amount": 210.0, "Symbol": "T", "Strategy2": "Heads", "Custodian": "FIRE",  "Strategy": "GOOSE", "Portfolio": "Eze Master Fund", "Action": "Buy", "Manager": "TM" },
        { "Amount": 105.0, "Symbol": "T", "Strategy2": "Tails", "Custodian": "FIRE",  "Strategy": "DUCK",  "Portfolio": "Eze Master Fund", "Action": "Buy", "Manager": "TM" },
        { "Amount": 30.0,  "Symbol": "T", "Strategy2": "Tails", "Custodian": "EARTH", "Strategy": "GOOSE", "Portfolio": "Eze Global Macro Fund", "Action": "Buy", "Manager": "TM" },
        { "Amount": 30.0,  "Symbol": "T", "Strategy2": "Tails", "Custodian": "FIRE",  "Strategy": "GOOSE", "Portfolio": "Eze Global Macro Fund", "Action": "Buy", "Manager": "TM" },
        { "Amount": 60.0,  "Symbol": "T", "Strategy2": "Tails", "Custodian": "FIRE",  "Strategy": "DUCK",  "Portfolio": "Eze Global Macro Fund", "Action": "Buy", "Manager": "TM" }]

    private selectedItem = null;
    private aggregationLevels = ["Portfolio", "Custodian", "Strategy"];
    private buckets;

    constructor(private tradeService: TradeService) {
    }

    ngOnInit() {
        this.checkReadyToAllocate();
    }

    private checkReadyToAllocate() {
        let result = this.tradeService.buildTree(this.dummyData, this.aggregationLevels);
        this.buckets = result.buckets;
        this.root = result.root;
    }

    private saveTrade() {
        this.tradeService.sendCommand(this.root);
    }

    private setSelectedItem(alloc: IAllocation) {
        if (this.selectedItem) {
            this.selectedItem.selected = false;
        }
        this.selectedItem = alloc;
        this.selectedItem.selected = true;
    }

    private switchLevel(level) {
        if (level != this.aggregationLevels[0]) {
            let index = this.aggregationLevels.indexOf(level);
            if (index > -1) {
                this.aggregationLevels.splice(index, 1);
            }
            this.aggregationLevels.splice(0, 0, level);
            this.checkReadyToAllocate();
        }
    }

    private resizing(delta: IResizeDelta) {

        delta.item.isAllocating = true;
        this.recalcParents(delta.item);
        this.recalcParents(delta.item.next);

        setTimeout(() => {
            this.recalcChildren(delta.item);
            this.recalcChildren(delta.item.next);

            delta.item.isAllocating = false;
            delta.item.next.isAllocating = false;
        }, 1000);

        delta.item.isAllocating = true;
        delta.item.next.isAllocating = true;
    }

    private recalcParents(alloc: IAllocation) {
        if (alloc.parent) {
            let sum = 0;
            for (var j = 0; j < alloc.parent.children.length; j++) {
                sum += alloc.parent.children[j].value;
            }
            alloc.parent.value = sum;
            this.recalcParents(alloc.parent);
        }
    }

    // This gets replaced with a service call.
    private recalcChildren(parent: IAllocation) {
        if (parent && parent.children && parent.children.length > 0) {
            for (var j = 0; j < parent.children.length; j++) {
                let alloc = parent.children[j];
                alloc.value = parent.value / parent.children.length;
                this.recalcChildren(alloc);
            }
        }
    }
}
