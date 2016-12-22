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


    public buildTree(serverLots: IServerAllocationLot[], aggregationLevels: string[]) {
        let buckets = {};
        let rootAlloc: IAllocation = { name: "root", value: 0, children: [] };
        let tree = this.recursiveTreeBuilder(serverLots, 0, buckets, aggregationLevels);
        rootAlloc.children = tree;
        rootAlloc.value = this.totalChildAmounts(rootAlloc);

        console.log(buckets);

        return { root: rootAlloc, buckets: buckets };
    }

    private totalChildAmounts(alloc: IAllocation) {
        if (!alloc.children || alloc.children.length == 0) {
            // a leaf node will have no children, but could have multiple lots.  So sum the lot Amounts.
            let sumOfLots = 0;
            alloc.originalLots.forEach(lot => { sumOfLots += lot.Amount; });
            return sumOfLots;
        }
        let total = 0;
        alloc.children.forEach(suballoc => {
            suballoc.value = this.totalChildAmounts(suballoc);
            suballoc.parent = alloc;
            total += suballoc.value;
        });
        return total;
    }

    public recursiveTreeBuilder(serverLots: IServerAllocationLot[], aggregationLevel, buckets, aggregationLevels: string[]) {
        let aggregationDim = null;
        let tree: IAllocation[] = [];
        let total = 0;

        if (aggregationLevel >= aggregationLevels.length) {
            return null;
        } else {
            aggregationDim = aggregationLevels[aggregationLevel];
        }

        // Assemble a collection that aggregates by the current level
        serverLots.forEach(serverLot => {
            let agg = tree.find(x => { return x.name == serverLot[aggregationDim] });
            if (!agg) {
                // create agg 
                agg = { name: serverLot[aggregationDim], value: 0, originalLots: [], children: [] };
                tree.push(agg);
            }
            agg.originalLots.push(serverLot);
        });

        // recursively build out children from the relevant set of lots
        tree.forEach(item => {
            let result = this.recursiveTreeBuilder(item.originalLots, aggregationLevel + 1, buckets, aggregationLevels);
            item.children = result;

            if (!buckets[aggregationDim]) {
                buckets[aggregationDim] = [];
            }
            buckets[aggregationDim].push(item);
        });

        return tree;
    }
}

