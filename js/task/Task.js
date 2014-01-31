var TaskStatus = require("./TaskStatus");
var ScriptGenerator = require("../ScriptGenerator");
var fs = require("fs");

var Task = (function () {
    function Task(url, widths, options) {
        this.url = url;
        this.widths = widths;
        this.options = options;
        this.scriptTemplate = this.options.script;
        this.status = TaskStatus.UNKNOWN;
    }
    Task.prototype.generateScript = function (tempDir) {
        var generator = ScriptGenerator.getInstance();
        var widthsString = JSON.stringify(this.widths);
        var optionsString = JSON.stringify(this.options);
        var context = {
            url: this.url,
            widths: widthsString,
            options: optionsString
        };
        generator.generate(this.scriptTemplate, context);
        this.generatedScript = generator.save(tempDir);
    };

    Task.prototype.removeScript = function () {
        fs.unlinkSync(this.generatedScript);
    };
    return Task;
})();


module.exports = Task;

