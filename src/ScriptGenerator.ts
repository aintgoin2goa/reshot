/// <reference path="./IScriptGenerator.ts" />
/// <reference path="./ITempDir.ts" />
/// <reference path="d/node.d.ts" />
/// <reference path="d/handlebars.d.ts" />
/// <reference path="./IConfig.ts" />

import path = require("path");
import fs = require("fs");
import Handlebars = require("handlebars");
import _ = require("underscore");
import config = require("./Config");

class ScriptGenerator implements IScriptGenerator{

	private templatesFolderPath: string = this.installLocation() + "tmpl" + path.sep;

	private templateExtension: string = ".tmpl";

	private compiledTemplate : Function;

	private config: IConfig;

	constructor(){
		this.config = config.getCurrentConfig();
	}

	public generate(context : Object, userScript?: string) : string {
		if(!this.compiledTemplate){
			var template = this.loadTemplate();
			this.compiledTemplate = this.compileTemplate(template);
		}
		
		this.addUserScript(userScript);

		return this.generateScript(context);
	}

	public save(script: string, tempDir : ITempDir) : string {
		var filename = this.generateUniqueFileName()
		var pth = path.resolve(tempDir.dir, filename);
		fs.writeFileSync(pth, script, {encoding : "utf8"});
		return pth;
	}

	private loadTemplate() : string {
		var pth = path.resolve(this.templatesFolderPath, this.config.settings.template + this.templateExtension);
		return fs.readFileSync(pth, {encoding : "utf8"});
	} 

	private compileTemplate(template: string) : Function {
		return  Handlebars.compile(template);
	}

	private generateScript(context : any) : string {
		return this.compiledTemplate(context);
	}

	private generateUniqueFileName() : string {
		var filename = "";
		for(var i=0; i < 32; i++){
			filename += this.generateHexChar();
		}
		return filename + ".js";
	}

	private generateHexChar() : string {
		return _.random(0, 15).toString(16);
	}

	private installLocation(): string{
		var location: string;
		try{
			location = require.resolve("recap");
			location = location.split("recap")[0] + "recap" + path.sep;
		}catch(e){
			var qPath = require.resolve("q");
			location = qPath.split("node_modules")[0];
		}
		return location;
	}

	private loadUserScript(userScriptPath: string): string {
		var pth = path.resolve(userScriptPath);
		return fs.readFileSync(pth, {encoding : "utf8"});
	}

	private addUserScript(script?: string): void {
		if(!script){
			Handlebars.registerPartial("userscript","");
			return
		}
		
		var partial = this.compileTemplate(this.loadUserScript(script) );
		Handlebars.registerPartial("userscript",partial);
	}

}

var instance: IScriptGenerator;

export function getInstance() : IScriptGenerator {
	if(!instance){
		instance = new ScriptGenerator();
	}

	return instance;
}

export function reset(): void {
	instance = null;
}