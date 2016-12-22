
export interface IAllocation {
    name: string,
    value: number,
    children: IAllocation[],
    symbol?: string,
    action?: string,
    manager?: string,
    next?: IAllocation,
    parent?: IAllocation,
    isResizing? : boolean,
    isAllocating? :boolean,
    originalLots?: IServerAllocationLot[]
}

export interface IDimentionBasket {
    title: string,
    lots: IAllocation[]
}

export interface IResizeDelta {
    delta: number,
    item: IAllocation
}

export interface IServerAllocationLot {
    Amount: number,
    Symbol: string,
    Custodian: string,
    Strategy: string,
    Strategy2: string,
    Portfolio: string,
    Action: string,
    Manager: string
}