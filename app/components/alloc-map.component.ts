import { Component, OnInit, Input, OnChanges, SimpleChange } from '@angular/core';
import { CommonModule } from "@angular/common";
import { Http, Response } from "@angular/http";
import { TradeService } from "../services/trade.service"
import { IAllocation, IResizeDelta } from "../types.d"


@Component({
    selector: 'alloc-map',
    templateUrl: 'app/components/alloc-map.component.html',
    styleUrls: ['app/components/alloc-map.component.css'],
    providers: [TradeService]
})
export class AllocMapComponent implements OnInit {
    private showGrid = true;
    private root: IAllocation = {
        name: "root",
        symbol: "C",
        action: "Buy",
        manager: "TM",
        value: 600,
        children: []
    };
    private resizingItem = null;
    private selectedItem = null;
    private aggregationLevels = ["Portfolio", "Custodian", "Strategy"];
    private portfolios: IAllocation[] = [];
    private custodians: IAllocation[] = [];
    private strategies: IAllocation[] = [];

    constructor(private tradeService: TradeService) {
    }

    ngOnInit() {
        this.recalcChildren(this.root);
        this.showGrid = true;
        this.checkReadyToAllocate();
    }

    private checkReadyToAllocate() {
        if (this.root.symbol && this.root.action && this.root.manager && this.root.value > 0) {
            let obs = this.tradeService.getAllocationLots(this.root.symbol, this.root.value, this.root.manager, this.root.action);
            obs.subscribe(lots => {

                let allocations = this.tradeService.createTreeFromLots(lots, this.aggregationLevels);
                this.root.value = allocations.value;
                this.root.children = allocations.children;
                this.fixNumbers(this.root);
                this.assignParents(this.root);
            });
        }
    }

    private saveTrade() {
        this.tradeService.sendCommand(this.root);
    }

    private fixNumbers(trade: IAllocation) {
        this.portfolios = [];
        this.custodians = [];
        this.strategies = [];

        trade.valueStr = trade.value.toFixed(0);
        trade.children.forEach(portfolio => {
            portfolio.valueStr = portfolio.value.toFixed(0);
            this.portfolios.push(portfolio);

            portfolio.children.forEach(custodian => {
                custodian.valueStr = custodian.value.toFixed(0);
                this.custodians.push(custodian);

                custodian.children.forEach(strategy => {
                    strategy.valueStr = strategy.value.toFixed(0);
                    this.strategies.push(strategy);
                });
            });
        });
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

            this.fixNumbers(this.root);
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
    private assignParents(parent: IAllocation) {
        if (parent.children && parent.children.length > 0) {
            for (var j = 0; j < parent.children.length; j++) {
                let alloc = parent.children[j];
                alloc.parent = parent;
                this.assignParents(alloc);
            }
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
