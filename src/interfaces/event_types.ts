import { EventEmitter as EV } from "eventemitter3"

export class FwEvent<ArgsT> {
    _emitter: EV

    _eventName: string

    constructor() {
        this._emitter = new EV()
        this._eventName = "eventName"
    }

    $on(listener: (args: ArgsT) => void) {
        this._emitter.on(this._eventName, listener)
    }

    $once(listener: (args: ArgsT) => void) {
        this._emitter.once(this._eventName, listener)
    }

    $off(listener: (args: ArgsT) => void) {
        this._emitter.off(this._eventName, listener)
    }

    $emit(args: ArgsT) {
        this._emitter.emit(this._eventName, args)
    }
}


export class FwEventEmitter {
    _emitter: EV

    constructor() {
        this._emitter = new EV()
    }

    $on(eventName: string, listener: (args: any) => void) {
        this._emitter.on(eventName, listener)
    }

    $once(eventName: string, listener: (args: any) => void) {
        this._emitter.once(eventName, listener)
    }

    $off(eventName: string, listener: (args: any) => void) {
        this._emitter.off(eventName, listener)
    }

    $emit(eventName: string, args: any) {
        this._emitter.emit(eventName, args)
    }
}
