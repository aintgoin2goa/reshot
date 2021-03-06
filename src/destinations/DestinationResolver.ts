/// <reference path="IDestination.ts" />
/// <reference path="./FileSystemDestination.ts" />

module DestinationResolver{
    export function resolve(uri: string): IDestination {
        var moduleName: string = "./FileSystemDestination";

        var Destination = require(moduleName);
        var destination: IDestination = new Destination(uri);
        return destination;
    }
}

export = DestinationResolver;