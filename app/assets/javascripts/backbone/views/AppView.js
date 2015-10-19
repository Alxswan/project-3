var app = app || {};

app.AppView = Backbone.View.extend({
	el: '#main',

	events: {
		'click canvas' : 'play'
	},

	initialize: function(  ) {
		app.audioContext = new AudioContext()
		app.oscillator = app.audioContext.createOscillator()
		app.oscillator.connect(app.audioContext.destination)	
		app.oscillator.type = 'sine'

// 	if (!navigator.getUserMedia)
//     navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

// 	if (navigator.getUserMedia){
//     navigator.getUserMedia({audio:true}, success, function(e) {
//     alert('Error capturing audio.');
//     });
// 	} else alert('getUserMedia not supported in this browser.');

// 	function success(e){
//     // retrieve the current sample rate to be used for WAV packaging
//     sampleRate = app.audioContext.sampleRate;
 
//     // creates a gain node
//     volume = app.audioContext.createGain();
 
//     // creates an audio node from the microphone incoming stream
//     audioInput = app.audioContext.createMediaStreamSource(e);
 
//     // connect the stream to the gain node
//     audioInput.connect(volume);
 
//     /* From the spec: This value controls how frequently the audioprocess event is 
//     dispatched and how many sample-frames need to be processed each call. 
//     Lower values for buffer size will result in a lower (better) latency. 
//     Higher values will be necessary to avoid audio breakup and glitches */
//     var bufferSize = 2048;
// }
	},

	render: function() {
		
		var appViewTemplate = $('#appViewTemplate').html();
		this.$el.html( appViewTemplate );
		paper.install( window );

		app.paper = new PaperScope();
    app.paper.setup( $("canvas")[0] );
		this.draw()
	},

	play: function(event) {
		event.preventDefault();	
		console.log(event);
		app.oscillator = app.audioContext.createOscillator()
		app.oscillator.connect(app.audioContext.destination)	
		app.oscillator.type = 'triangle'
		app.	oscillator.detune.value = event.pageX
		app.oscillator.start(app.audioContext.currentTime)
		app.oscillator.stop(app.audioContext.currentTime + .5)
	},

	draw: function(){
		// app.paper = new PaperScope();
    // app.paper.setup($("canvas")[0]);
		app.myCircle = new app.paper.Path.Circle(new app.paper.Point(300, 200), 50);
		app.myCircle.fillColor = 'black';
		
		app.paper.view.draw();
	}
});