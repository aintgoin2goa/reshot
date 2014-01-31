interface IConfig{

    urls: {[url: string]: IUrlOptions};

    widths: number[];

    dest: string;

    defaultOptions: IUrlOptions;

    settings: IConfigSettings

}

interface IUrlOptions {

    waitTime: number;

    crawl: boolean;

    script : string;

}

interface IConfigValidationResult{
	
	result: boolean;

	message: string;
}

interface IConfigSettings{

    maxInstances : number;

    template : string;

}
