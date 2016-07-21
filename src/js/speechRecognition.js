fluid.defaults("floe.speechRecognition", {
    gradeNames: ["fluid.component"],
    listeners: {
        "onCreate.initSpeechRecognition": {
            funcName: "floe.speechRecognition.initSpeechRecognition",
            args: ["{that}"]
        }
    },
    events: {
        onSpeechRecognitionStart: null,
        onSpeechRecognitionResult: null,
        onSpeechRecognitionError: null,
        onSpeechRecognitionEnd: null
    },
    recognitionConfig: {
        continuous: false,
        interimResults: false,
        lang: "en-US"
    }
});

floe.speechRecognition.initSpeechRecognition = function (that) {
    console.log("floe.speechRecognitionConsoleLogger.initSpeechRecognition");
    var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;

    var recognition = new SpeechRecognition();

    recognition.continuous = that.options.recognitionConfig.continuous;
    recognition.interimResults = that.options.recognitionConfig.interimResults;
    recognition.lang = that.options.recognitionConfig.lang;

    recognition.onstart = function() {
        that.events.onSpeechRecognitionStart.fire(that);
    }

    recognition.onresult = function(event) {
        that.events.onSpeechRecognitionResult.fire(that, event);
    }

    recognition.onerror = function(event) {
        that.events.onSpeechRecognitionError.fire(that, event);
    }

    recognition.onend = function() {
        that.events.onSpeechRecognitionEnd.fire(that);
    }

    recognition.start();
};

fluid.defaults("floe.speechRecognitionConsoleLogger", {
    gradeNames: ["floe.speechRecognition"],
    listeners: {
        "onSpeechRecognitionStart.logToConsole": {
            funcName: "floe.speechRecognitionConsoleLogger.logEventArgsToConsole",
            args: ["onSpeechRecognitionStart", "{arguments}"]
        },
        "onSpeechRecognitionResult.logToConsole": {
            funcName: "floe.speechRecognitionConsoleLogger.logEventArgsToConsole",
            args: ["onSpeechRecognitionResult", "{arguments}"]
        },
        "onSpeechRecognitionError.logToConsole": {
            funcName: "floe.speechRecognitionConsoleLogger.logEventArgsToConsole",
            args: ["onSpeechRecognitionError", "{arguments}"]
        },
        "onSpeechRecognitionEnd.logToConsole": {
            funcName: "floe.speechRecognitionConsoleLogger.logEventArgsToConsole",
            args: ["onSpeechRecognitionEnd", "{arguments}"]
        }
    }
});

floe.speechRecognitionConsoleLogger.logEventArgsToConsole = function(eventName, eventArguments) {
    console.log(eventName, eventArguments);
}

fluid.defaults("floe.speechRecognitionPageLogger", {
    gradeNames: ["floe.speechRecognitionConsoleLogger", "fluid.viewComponent"],
    model: {
        transcript: ""
    },
    selectors: {
        loggingArea: ".floe-speechLog-logArea"
    },
    listeners: {
        "onSpeechRecognitionResult.logResultToPage": {
            funcName: "floe.speechRecognitionPageLogger.logResultToPage"
        }
    },
    modelListeners: {
        "transcript": {
            this: "{that}.dom.loggingArea",
            method: "text",
            args: "{that}.model.transcript"
        }
    }
});

floe.speechRecognitionPageLogger.logResultToPage = function(that, event) {
    var loggingArea = that.locate("loggingArea");
    var transcript = fluid.get(that.model, "transcript");
    fluid.each(event.results, function (result) {
        if(result[0]) {
            transcript = transcript + result[0].transcript;
            that.applier.change("transcript", transcript)
        }
    });
}
