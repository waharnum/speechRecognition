(function ($, fluid) {

    fluid.defaults("floe.speechRecognition", {
        gradeNames: ["fluid.component"],
        listeners: {
            "onCreate.initSpeechRecognition": {
                funcName: "floe.speechRecognition.initSpeechRecognition",
                args: ["{that}"]
            },
            "onSpeechRecognitionInitialized.startSpeechRecognition": {
                funcName: "{that}.startSpeechRecognition"
            }
        },
        events: {
            onSpeechRecognitionStart: null,
            onSpeechRecognitionResult: null,
            onSpeechRecognitionError: null,
            onSpeechRecognitionEnd: null,
            onSpeechRecognitionInitialized: null
        },
        recognitionConfig: {
            continuous: false,
            interimResults: false,
            lang: "en-US"
        },
        invokers: {
            "startSpeechRecognition": {
                "this": "{that}.recognition",
                "method": "start"
            },
            "stopSpeechRecognition": {
                "this": "{that}.recognition",
                "method": "stop"
            }
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
        };

        recognition.onresult = function(event) {
            that.events.onSpeechRecognitionResult.fire(that, event);
        };

        recognition.onerror = function(event) {
            that.events.onSpeechRecognitionError.fire(that, event);
        };

        recognition.onend = function() {
            that.events.onSpeechRecognitionEnd.fire(that);
        };

        that.recognition = recognition;

        that.events.onSpeechRecognitionInitialized.fire();
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
    };

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
                that.applier.change("transcript", transcript);
            }
        });
    };

    fluid.defaults("floe.speechRecognitionEventController", {
        gradeNames: ["floe.speechRecognition"],
        listeners: {
            "onSpeechRecognitionResult.testForSpeechToEvent": {
                funcName: "floe.speechRecognitionEventController.testForSpeechToEvent"
            },
            "onSpeechRecognitionEnd.restart": "{that}.startSpeechRecognition"
            // "onPlaySpoken.log": {
            //     this: "console",
            //     method: "log",
            //     args: "'onPlaySpoken' event was fired!"
            // }
        },
        // A key-value list of strings to be recognized when spoken and
        // their corresponding events to fire
        speechToEvents: {
            // "play": "{that}.events.onPlaySpoken"
        }

    });


    floe.speechRecognitionEventController.testForSpeechToEvent = function (that, event) {
        var spoken = event.results[0][0].transcript.toLowerCase();
        var matchedEvent = fluid.get(that.options.speechToEvents, spoken);
        if(matchedEvent) {
            matchedEvent.fire();
        }
    };
})(jQuery, fluid);
