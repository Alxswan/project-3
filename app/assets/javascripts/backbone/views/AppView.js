var app = app || {};

window.requestAnimFrame = (function(){ 
    return (
        window.requestAnimationFrame       || 
        window.webkitRequestAnimationFrame || 
        window.mozRequestAnimationFrame    || 
        window.oRequestAnimationFrame      || 
        window.msRequestAnimationFrame     || 
        function(/* function */ callback){
            window.setTimeout(callback, 1000 / 60);
        }
    );
})();

app.AppView = Backbone.View.extend({
	el: '#main',

	events: {
		'mouseover canvas' : 'play'
	},

	initialize: function(  ) {
		app.audioContext = new AudioContext()
	},

	render: function() {
		
		var appViewTemplate = $('#appViewTemplate').html();
		this.$el.html( appViewTemplate );
		paper.install( window );

		app.paper = new PaperScope();
    app.paper.setup( $("canvas")[0] );
    // this.frameLooper();
		this.draw()

	},

	// frameLooper: function() {
	// 	window.requestAnimFrame( this.frameLooper.bind(this) );
 //    app.paper.view.on({
 //      frame: this.draw()
 //    });
 //  },

	play: function(event) {
		event.preventDefault();	
		app.oscillator = app.audioContext.createOscillator()
		app.oscillator.connect(app.audioContext.destination)	
		app.oscillator.type = 'sine'

		// var input = app.audioContext.createGain()
		var feedback = app.audioContext.createGain()
		var delay = app.audioContext.createDelay()

		var output = app.audioContext.createGain()
		output.connect(app.audioContext.destination)

		delay.delayTime.value = 0.3
		feedback.gain.value = 0.8 // dangerous when > 1 ;-)
		// dry path
		app.oscillator.connect(output)
		// wet path
		app.oscillator.connect(delay)

		// feedback loop
		delay.connect(feedback)
		feedback.connect(delay)
		feedback.connect(output)

		var note;
		var click = event.pageX
		console.log(event.pageX)
		if (click < 50) {
			note = -1700
		} else if (click < 100) {
			note = -1500
		}else if (click < 150) {
			note = -1200
		}else if (click < 200) {
			note = -1000
		}else if (click < 250) {
			note = -700
		}else if (click < 300) {
			note = -500
		} else if (click < 350) {
			note = -300
		} else if (click < 400) {
			note = 0
		} else if (click < 450) {
			note = 200
		} else if (click < 500) {
			note = 500
		} else if (click < 550) {
			note = 700
		} else if (click < 600 ) {
			note = 900
		} else if (click < 650 ) {
			note = 1200
		} else if (click < 700) {
			note = 1400
		} else if (click < 750) {
			note = 1700
		} else if (click < 800) {
			note = 1900
		} else if (click < 850) {
			note = 2100
		} else if (click < 900) {
			note = 2400
		} else 	{
			note = 2600
		} 


		app.oscillator.detune.value = note
		app.oscillator.start(app.audioContext.currentTime)
		app.oscillator.stop(app.audioContext.currentTime + .5)
	},

	draw: function(){
		app.myCircle = new app.paper.Path.Circle(new app.paper.Point(300, 200), 20);
		app.myCircle.fillColor = 'gold';
		app.paper.view.draw();

		app.canvasHeight = $('canvas').height()
    app.canvasWidth = $('canvas').width()

		for (var i = 0; i < canvas.width; i += 50) {
			 app.newPath = new app.paper.Path.Line({
	      from: [i, 0],
	      to: [i, app.canvasHeight],
	      strokeColor: 'black',
	      strokeWidth: 1,
	      fillColor: 'black',
	      opacity: 0.1,
	      closed: true
	    });
		}

		var tool = new Tool();

		tool.onMouseDrag = function (event) {
		if (app.myCircle) {
			console.log('drag')
			app.myCircle.position = event.point;
			}
		}
	}

});