/// <reference path="d/node.d.ts" />
/// <reference path="d/q.d.ts" />
/// <reference path="./Iconfig.ts" />
/// <reference path="browsers/IBrowserSwarm.ts" />
/// <reference path="task/ITask" />
/// <reference path="destinations/IDestination" />
/// <reference path="d/rimraf.d.ts" />

import Q = require("q");
import fs = require("fs");
import BrowserSwarm = require("browsers/BrowserSwarm");
import Config = require("./Config");
import TempDir = require("./TempDir");
import TaskQueue = require("task/TaskQueue");
import Task = require("task/Task");
//import console = require("./Console");
import DestinationResolver = require("destinations/DestinationResolver");
import transport = require("transports/transportFactory");
import rimraf = require("rimraf");

var fail = function fail(message: string, dfd:Q.Deferred<any>): void {
	throw new Error("Not implemented");
}

var success = function success(message: string, dfd:Q.Deferred<any>): void {
	throw new Error("Not Implemented");
}

function setupFail(isConsole:boolean) : void{
	if(isConsole){
		fail = function fail(message: string, dfd:Q.Deferred<any>): void {
			console.error(message);
			process.exit(1);
		}
	}else{
		fail = function fail(message: string, dfd?:Q.Deferred<any>): void {
			dfd.reject(message);
		}
	}
}

function setupSuccess(isConsole:boolean): void {
	if(isConsole){
		success = function succeed(message:string, dfd:Q.Deferred<any>): void {
			//console.success(message);
			process.exit(0);
		}
	}else{
		success = function succeed(message:string, dfd:Q.Deferred<any>): void {
			dfd.resolve(message);
		}
	}
}

function createTasks(config:IConfig): ITask[] {
	var urls = Object.keys(config.urls);
	var tasks = [];
	urls.forEach(function(url){
		tasks.push(new Task(url, config.widths, config.urls[url]));
	});
	return tasks;
}

function copyFiles(config:IConfig, tempDir: ITempDir) : Q.IPromise<any> {
	var dfd = Q.defer<any>();
	var destination: IDestination = DestinationResolver.resolve(config.dest);
	destination.setup().then(function(){
		transport(tempDir).to(destination).then(
			function(){
				dfd.resolve(true);
			},
			function(){
				dfd.reject(false);
			}
		);
	});
	return dfd.promise;
}

function setup(config:IConfig, dfd:Q.Deferred<any>): void {
	var swarm = new BrowserSwarm(config.settings.maxInstances);
	var tempDir = new TempDir();
	var taskQueue = new TaskQueue(swarm, tempDir);
	var tasks = createTasks(config);
	tasks.forEach(function(task){
		taskQueue.addTask(task);
	});
	begin(config, taskQueue, tempDir, dfd);
}

function begin(config:IConfig, queue: ITaskQueue, tempDir: ITempDir, dfd:Q.Deferred<any>): void{
	queue.on("complete", function(){
		copyFiles(config, tempDir).then(
			function(){
				console.log("Files copied, removing temporary directory");
				rimraf(tempDir.dir, function(err){
					if(err){
						console.error("Failed to remove temporary directory");	
					}
					
					success("Operation complete!", dfd);
				});
			},
			function(){
				fail("Failed to copy files to destination " + config.dest, dfd);
			}
		);
	});
	queue.process();
}


export function run(cfg:string, isConsole?:boolean): Q.IPromise<any>
export function run(cfg:IConfig, isConsole?:boolean): Q.IPromise<any> 
export function run(cfg:any, isConsole?:boolean): Q.IPromise<any>
{
	var dfd = Q.defer();
	isConsole = isConsole || false;
	setupFail(isConsole);
	setupSuccess(isConsole);
	var config = Config.load(cfg);
	setup(config, dfd);
	return dfd.promise;
}
