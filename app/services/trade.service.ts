import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { IAllocation, IServerAllocationLot } from "../types.d"

@Injectable()
export class TradeService {
    private baseurl = "/api/Allocation";

    constructor(private http: Http) {
        // JMarston - this is a weird hack. If I don't call it like this, I get a runtime failure because it doesn't understand the http result.
        Observable;
    }

    public getAllocationLots(symbol, amount, manager, action): Observable<any> {

        let params: URLSearchParams = new URLSearchParams();
        params.set('symbol', symbol);
        params.set('amount', amount);
        params.set('manager', manager);
        params.set('action', action);

        return this.http.get(this.baseurl, { search: params }).map(res => res.json());
    }

    public sendCommand(trade: IAllocation) {
        //    alert("send trade: " + trade);
        var allots = [];
        trade.children.forEach(portfolio => {
            portfolio.children.forEach(custodian => {
                custodian.children.forEach(strategy => {
                    allots.push({
                        Amount: strategy.value,
                        Symbol: trade.symbol,
                        Custodian: custodian.name,
                        Strategy: strategy.name,
                        Portfolio: portfolio.name,
                        Action: trade.action,
                        Manager: trade.manager
                    });
                });
            });
        });
        var allotsJson = JSON.stringify(allots);
        let headers = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
        let options = new RequestOptions({ headers: headers }); // Create a request option

        //      let url = "`${this.baseurl}/${svcId}?action=${action}`";
        this.http.post(this.baseurl, allotsJson, options)
            .subscribe(o => {
                console.log(o);
            });
    }

    private contains(array, str) {
        for (var i = 0; i < array.length; i++) {
            if (array[i].name === str) {
                return i;
            }
        }
        return -1;
    }

    public createTreeFromLots(allots: IServerAllocationLot[], aggregationLevels) {

        let root = { value: 0, children: [] };
        var tree = [];
        if (allots != null) {
            allots.forEach(element => {
                root.value += element.Amount;
                let portIndex = this.contains(tree, element[aggregationLevels[0]]);
                if (portIndex > -1) {
                    tree[portIndex].value += element.Amount;
                    let custIndex = this.contains(tree[portIndex].children, element[aggregationLevels[1]]);
                    if (custIndex > -1) {
                        tree[portIndex].children[custIndex].value += element.Amount;
                        tree[portIndex].children[custIndex].children.push(
                            {
                                name: element[aggregationLevels[2]],
                                value: element.Amount
                            }
                        );

                    } else {
                        tree[portIndex].children.push(
                            {
                                name: element[aggregationLevels[1]],
                                value: element.Amount,
                                children: [{
                                    name: element[aggregationLevels[2]],
                                    value: element.Amount
                                }]
                            }
                        );
                    }
                } else {
                    tree.push({
                        name: element[aggregationLevels[0]],
                        value: element.Amount,
                        children: [
                            {
                                name: element[aggregationLevels[1]],
                                value: element.Amount,
                                children: [{
                                    name: element[aggregationLevels[2]],
                                    value: element.Amount
                                }]
                            }
                        ]
                    });
                }


            });
        }
        root.children = tree;
        return root;
    }
}

