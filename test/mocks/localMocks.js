﻿var Q = require('q');

exports.getTempDirMock = function() {

    return {
        createRecord: function() {

        },

        saveRecords: function() {

        },

        remove: function() {

        },

        listFiles: function() {

        },

        dir: "dir"
    };
};

exports.getDestDirMock = function () {

    var isLocked = false;
    var isLockedCount = 0;
    var isLockedMax = 0;

    var callTracker = {
        isLocked: [],
        lock: [],
        unlock: [],
        getFilename: []
    };

    var filename;


    return {
        setIsLocked: function(v,c) {
            isLocked = v;
            isLockedMax = c;
        },
        
        reset: function() {
            isLockedCount = 0;
            for (var f in callTracker) {
                callTracker[f] = [];
            }
        },
        
        lastInvocationOf: function(fn) {
            if (callTracker[fn] && callTracker[fn].length) {
                var c = callTracker[fn];
                return c[c.length - 1];
            }
        },
        
        firstInvocationOf: function (fn) {
            if (callTracker[fn] && callTracker[fn].length) {
                return callTracker[fn][0];
            }
        },

        uri: function() {

        },

        type: function() {

        },
        
        setFilename: function(f) {
            filename = f;
        },

        getFilename: (function () {
            return jasmine.createSpy("getFilename").andCallFake(function (tempFile) {
                setImmediate(function() {
                    callTracker.getFilename.push(new Date().getTime() + 10);
                });
                return filename;
            });
        }()),

        isLocked: (function() {
            return jasmine.createSpy("isLocked").andCallFake(function () {
                callTracker.isLocked.push(new Date().getTime());
                var result = isLockedCount >= isLockedMax ? false : isLocked;
                isLockedCount++;
                return result;
            });
        }()),
        
        lock: (function () {
            return jasmine.createSpy("lock").andCallFake(function () {
                callTracker.lock.push(new Date().getTime());
                var dfd = Q.defer();
                setImmediate(function () {
                    dfd.resolve();
                });
                return dfd.promise;
            });
        }()),

        unlock: (function() {
            return jasmine.createSpy("unlock").andCallFake(function () {
                callTracker.unlock.push(new Date().getTime());
                var dfd = Q.defer();
                setImmediate(function() {
                    dfd.resolve();
                });
                return dfd.promise;
            });
        }()),

        updateData: jasmine.createSpy("updateData"),

        writeData: jasmine.createSpy("writeData").andCallFake(function(){
             var dfd = Q.defer();
            setImmediate(function() {
                dfd.resolve();
            });
            return dfd.promise;
        }),

        dataFile : "data.json"
    };
};

exports.getMockConfig = function () {

    var config = { urls: [], widths: [], dest: '', options: { waitTime: 1000, crawl: false} };

    return {
        load: (function() {
            return jasmine.createSpy("load");
        }()),
        getCurrentConfig : function() {
            return config;
        }
    };

}

var mockBrowserInstances = [];

exports.getMockBrowser = function(){

    var MockBrowser = jasmine.createSpy("MockBrowser").andCallFake(function(index){
        this.index = index;
         this.events ={};
         mockBrowserInstances.push(this);
    });

    MockBrowser.prototype = {
        status : 0,
        execute : jasmine.createSpy("execute").andCallFake(function(s){
            this.status = 1;
        }),
        close : jasmine.createSpy("close"),
        on : jasmine.createSpy("on").andCallFake(function(ev, fn){
            this.events[ev] ? this.events[ev].push(fn) : this.events[ev] = [fn];
        }),
        fire : function(ev, err, data){
            if(!this.events[ev]){
                return;
            }
            this.events[ev].forEach(function(fn){
                fn(err, data);
            });
        }
    }

    return MockBrowser;
}

exports.getMockBrowserInstance = function(i){
    return mockBrowserInstances[i];
}

exports.resetMockBrowserInstances = function(){
    mockBrowserInstances = [];
}

exports.getBrowserSwarmMock = function(){

    var events ={};

    return {
        size : 1,
        on : jasmine.createSpy("on").andCallFake(function(ev, fn){
            events[ev] ? events[ev].push(fn) : events[ev] = [fn];
        }),
        fire : function(ev, err, data){
            if(!events[ev]){
                return;
            }
            events[ev].forEach(function(fn){
                fn(err, data);
            });
        },
        reset : function(){
            events = {};
        },
        execute : jasmine.createSpy("execute")
    }
}

exports.getBrowserSwarmMockConstructor = function(){
    var BrowserSwarmMock = jasmine.createSpy("BrowserSwarmMock").andCallFake(function(size){
        this.size = size;
    });

    BrowserSwarmMock.prototype = exports.getBrowserSwarmMock();

    return BrowserSwarmMock;
}

exports.getMockConsole = function(){

    return {
        log : jasmine.createSpy("console.log"),
        warn : jasmine.createSpy("console.warn"),
        error : jasmine.createSpy("console.error"),
        info : jasmine.createSpy("console.info"),
    }
}

exports.getTaskMock = function(){
    
    var Task = jasmine.createSpy("Task").andCallFake(function(url, widths, options){
        this.url = url;
        this.widths = widths;
        this.options = options;
        this.scriptTemplate = this.options.script;
        this.status = 0;
    });

    Task.prototype.generateScript = jasmine.createSpy("generateScript");

    return Task;
}