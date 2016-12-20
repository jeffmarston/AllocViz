
export interface IAllocation {
    name: string,
    value: number,
    children: IAllocation[],
    symbol?: string,
    action?: string,
    manager?: string,
    valueStr?: string,
    next?: IAllocation,
    parent?: IAllocation,
    isResizing? : boolean,
    isAllocating? :boolean
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
    Portfolio: string,
    Action: string,
    Manager: string
}