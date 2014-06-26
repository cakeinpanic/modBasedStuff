var LOG = false;

var BaseSlider = Mod.extend({
	slides: [],
	animating: null,
	idle: null,
	animationLenght: .7,
	slideshowLength: 1,
	resetAimationLenght: .35,
	preloader: null,
	globalpreloader: null,
	currentSlide: {
		value: 0,
		change: function(value){
			this.currentSlide= value%this.slides.length;
			if (this.working){
				this.slideState="loading";
			}
		}
	},
	next: function(){
		this.currentSlide++;
	},
	toStart: function(){
		this.currentSlide= 0;
	},
	stop: function(){
		this.working=false;
	},
	start: function(){
		this.working=true;
	},
	created:function(){
		this.slideState="hidden";
	},

	slideState:{
		value: "init",
		values: {
			init: {
				before: function(){
					this.firstTime=true;
					this._slideshowTimeout = undefined;
					this._animateTimeout = undefined;
					this._resetTimeout = undefined;
					this._mouseOn= false;
					this.working= false;
					this.loaded= null;
					this.$preloader= null;
					this.$globalPreloader= null;

					this.loaded=new Array(this.slides.length);

					if (this.animating) this.animationLenght= this.animating;
					this.slideshowLength= this.idle || this.slideshowLength;


					if (this.preloader && this.slides.length>1 ){
						this.$preloader=document.createElement("div");
						this.$preloader.className=this.preloader;

						this.$globalPreloader=document.createElement("div");
						this.$globalPreloader.className=this.globalpreloader;

						this.$globalPreloader.appendChild(this.$preloader);
						this.appendChild(this.$globalPreloader);

						this.$preloader.style.transition="all "+this.animationLenght+"s";
						this.$preloader.style.width=""+100/this.slides.length+"%";
					}
				}
			},

			hidden:{
				before: function(){
					fire(window,"scroll");
				},
				'window scroll': function(){
					var window_top = $(window).scrollTop();
					var window_height = $(window).height();
					var offset = $(this).offset();
					var top = offset.top;

					if (top + $(this).height() >= window_top && top <= window_top + window_height) {
						this.loaded[0]=true;
						this.style.backgroundImage="url('"+this.slides[0]+"')";
						this.style.opacity=1;
		
						this.slideState="visible";
					}
				},
				after: function(){
				}
			},

			visible:{
				before: function(){
	
					if (this.slides.length>1){
						this.slideState="ready";
					}
				}
			},

			ready: {
				before: function(){
	
					clearTimeout(this._postponeStartTimeout);
					clearTimeout(this._slideshowTimeout);
					clearTimeout(this._animateTimeout);
					clearTimeout(this._resetTimeout);

					this.toStart();
					this.stop();
					if (this._mouseOn) {
		
						this._postponeStartTimeout= setTimeout(function() {this.start();this.next();}.bind(this), this.slideshowLength*500);
					}

				},

				mouseleave: function(){
					this._mouseOn= false;
	
				},
				mouseenter: function(){
	
					this._mouseOn= true;

					this.firstInit();

					this.start();
					this.next();
				},
				after: function(){
					clearTimeout(this._postponeStartTimeout);

				}
			},

			loading: {
				before: function(){
					clearTimeout(this._slideshowTimeout);
					var imgLoaded = function(){
		
						this.$nextSlide.style.opacity="0";
						this.$nextSlide.style.backgroundImage="url('"+this.slides[this.currentSlide]+"')";
						this.slides[this.currentSlide].loaded=true;

						this.movePreloader();
						this.slideState="animating";

					}.bind(this);

					if (this.$currentSlide.style.backgroundImage==this.slides[this.currentSlide]) {
						this.slideState="ready"; return;
					}

					if (!this.loaded[this.currentSlide]){
						var image = new Image();

						image.onload = function () {
							this.loaded[this.currentSlide]=true;
							imgLoaded();
						}.bind(this);
						image.src = this.slides[this.currentSlide];
					}
					else
					{
						imgLoaded();
					}
				},
				mouseleave: function(){
					this._mouseOn= false;
					this.slideState="resetting";
				},
				mouseenter: function(){
					this._mouseOn= true;
				}

			},

			animating:{
				before: function(){
	
					this.$nextSlide.style.opacity="1";
					this._animateTimeout= setTimeout(function() {this.slideState="idle"}.bind(this), this.animationLenght*1000);
				},
				mouseleave: function(){
					this._mouseOn= false;
					this.slideState="resetting";
				},
				mouseenter: function(){
					this._mouseOn= true;
				}
			},

			idle:{
				before: function(){
	
					clearTimeout(this._animateTimeout);
					this._slideshowTimeout= setTimeout(this.next.bind(this), this.slideshowLength*1000);

					this.$currentSlide.style.backgroundImage=this.$nextSlide.style.backgroundImage;

					this.$nextSlide.style.opacity="0";

					if (!this.working) {
						this.slideState="ready";
					}
				},
				mouseleave: function(){
					this._mouseOn= false;
					this.slideState="resetting";
				},
				mouseenter: function(){
					this._mouseOn= true;
				}
			},

			resetting:{
				before: function(){
	
					clearTimeout(this._animateTimeout);
					curD=new Date().getTime();

					this.stop();
					this.toStart();

					if (this.$currentSlide.style.backgroundImage==this.slides[0]){
						this.$nextSlide.style.opacity=0;
						this.$currentSlide.style.opacity=1;
					}
					else
					if (this.$nextSlide.style.backgroundImage==this.slides[0]){
						this.$currentSlide.style.opacity=0;
						this.$nextSlide.style.opacity=1;
					}
					else {
						this.$currentSlide.style.opacity=0;
						this.$nextSlide.style.opacity=0;
					}

					this.$currentSlide.style.transition=this.resetAimationLenght+"s opacity";
					this.$nextSlide.style.transition=this.resetAimationLenght+"s opacity";
					if (this.$preloader){
						this.$preloader.style.transition="all "+this.resetAimationLenght+"s";
					}
					this._resetTimeout= setTimeout(this.recoverAfterReset.bind(this), this.resetAimationLenght*1000);

					this.movePreloader(0);
				},
				mouseleave: function(){
					this._mouseOn= false;
				},
				mouseenter: function(){
					this._mouseOn= true;
				}
			}
		}
	},
	firstInit: function(){
		if (this.firstTime){
			this.$nextSlide = document.createElement("div");
			this.$currentSlide = document.createElement("div");

			this.$currentSlide.className+="inside-pic";
			this.$nextSlide.className+="inside-pic";

			this.$currentSlide.style.transition=this.animationLenght+"s opacity";
			this.$nextSlide.style.transition=this.animationLenght+"s opacity";

			this.$nextSlide.style.opacity="0";

			this.$currentSlide.style.backgroundImage="url('"+this.slides[this.currentSlide]+"')";
			this.$currentSlide.style.opacity="1";

			this.appendChild(this.$currentSlide);
			this.appendChild(this.$nextSlide);

			if (this.$globalPreloader)
				this.appendChild(this.$globalPreloader);

			this.firstTime=false;
		}
	},
	movePreloader: function(){
		if (this.$preloader){
			this.$preloader.style.left=(100/this.slides.length*this.currentSlide)+"%";
		}
	},
	recoverAfterReset: function(){
		this.$currentSlide.style.transition="";

		this.$currentSlide.style.backgroundImage="url('"+this.slides[0]+"')";
		this.$nextSlide.style.backgroundImage="";
		this.$currentSlide.style.opacity="1";
		this.$nextSlide.style.opacity="0";

		this.$currentSlide.style.transition=this.animationLenght+"s opacity";
		this.$nextSlide.style.transition=this.animationLenght+"s opacity";
		this.$preloader.style.transition="all "+this.animationLenght+"s";

		this.slideState="ready";
	}
});

var MapSlider = BaseSlider.extend({
	datamap: null,
	showLast: function(){
		if (this.datamap){
			this.stopping = true;
			if (this.slideState!="resetting")
			{
				this.stopOnLast();
			}
		}
	},
	stopOnLast: function(){
	    this._tempIdleLength=this.slideshowLength;
		this.slideshowLength=this.stopLength;

		this.firstInit();
		this.start();
		this.currentSlide=this.slides.length-1;
	},
	resetToNormal: function(){
		if (this.datamap){
			this.stopping = false;
			this.slideshowLength=this._tempIdleLength;
			this.next();
			this.stop();
		}
	},
	recoverAfterReset: function(){
		this.$currentSlide.style.transition="";

		this.$nextSlide.style.backgroundImage="";
		this.$currentSlide.style.backgroundImage="url('"+this.slides[0]+"')";
		this.$currentSlide.style.opacity="1";
		this.$nextSlide.style.opacity="0";

		this.$currentSlide.style.transition=this.animationLenght+"s opacity";
		this.$nextSlide.style.transition=this.animationLenght+"s opacity";
		this.$preloader.style.transition="all "+this.animationLenght+"s";

		if (this.stopping)
			this.stopOnLast();
		else
			this.slideState="ready";

	},

	slideState: {
		value: "init",
		values: {
			init: {
				before: function(){
					BaseSlider.properties.slideState.values.init.before.value.apply(this);

					this._tempIdleLength=null;
					this.stopLength= 10;
					this.stopping = false;

					if (this.datamap) {
						this.slides.push(this.datamap);
						if (this.$preloader)
							this.$preloader.style.width=""+100/this.slides.length+"%";
						else if (this.preloader && this.slides.length>1 ) {
							this.$preloader=document.createElement("div");
							this.$preloader.className=this.preloader;

							this.$globalPreloader=document.createElement("div");
							this.$globalPreloader.className=this.globalpreloader;

							this.$globalPreloader.appendChild(this.$preloader);
							this.appendChild(this.$globalPreloader);

							this.$preloader.style.transition="all "+this.animationLenght+"s";
							this.$preloader.style.width=""+100/this.slides.length+"%";
						}
					}
				}
			}
		}
	}

})

MapSlider.register("slider",{selector: ".slider"});