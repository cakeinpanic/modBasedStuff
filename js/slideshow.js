var Slideshow= Mod.extend({
	imgArray: [],
	loaded:[],
	placeholder: null,
	currentImg: {
		value: 0,
		change: function(value){
			if (value == -1) this.currentImg=this.imgArray.length-1;
			else
				this.currentImg= value%this.imgArray.length;
			if (this.working){
				this.slideshowState="loading";
			}
		}
	},
	addQueue:function(){
		this.queue++;
	},
	removeQueue:function(){
		this.queue--;
	},
	queue: {
		value: null,
		change: function(value){
			if (value!=0 && this.working) {
				if (this.slideshowState =="ready") {
					if (value>0)
						this.next();
					else
						this.prev();
				}
			}
		}
	},
	next: function(){
		clearTimeout(this._nextTimeout);
		this.currentImg=this.currentImg+1;
		this.queue--;
	},
	prev: function(){
		clearTimeout(this._nextTimeout);
		this.currentImg--;
		this.queue++;
	},
	toggleFullscreen: function(){

			if (!this._fsMode){
				this.$fsMode=document.createElement("div");
				this.$fsMode.appendChild(this.$preloader);
				this.$fsMode.appendChild(this.$fsButton);
				this.$fsMode.appendChild(this.$firstImg);
				this.$fsMode.appendChild(this.$secondImg);
				this.$fsMode.appendChild(this.$rightArrow);
				this.$fsMode.appendChild(this.$leftArrow);
				document.body.appendChild(this.$fsMode);
				this.$fsMode.classList.add("fs-slideshow");
			}
			else
			{
				document.body.removeChild(this.$fsMode);
				this.appendChild(this.$preloader);
				this.appendChild(this.$fsButton);
				this.appendChild(this.$firstImg);
				this.appendChild(this.$secondImg);
				this.appendChild(this.$rightArrow);
				this.appendChild(this.$leftArrow);
			}
			this._fsMode=!this._fsMode;

	},

	'document click:delegate(.left-arrow)': function(){this.removeQueue()},
	'document click:delegate(.right-arrow)': function(){this.addQueue()},
	'document click:delegate(.fs-button)': function(){this.toggleFullscreen()},

	slideshowState:{
		value:"init",
		values:{
			init: {
				before: function(){
					this._fsMode=false;
					this._animationLength=1;
					console.log("init");
					this._animateTimeout=null;
					this._nextTimeout=null;
					this._navCounter=0;

					this.$preloader=document.createElement("div");
					this.$preloader.setAttribute("class", "preloader");
					this.appendChild(this.$preloader);
					this.$preloader.style.opacity=0;

					this.$fsButton=document.createElement("div");
					this.$fsButton.setAttribute("class", "fs-button");
					this.appendChild(this.$fsButton);

					this.$secondImg=document.createElement("div");
					this.$secondImg.setAttribute("class", "slideshow-image second");
					this.appendChild(this.$secondImg);

					this.$firstImg=document.createElement("div");
					this.$firstImg.setAttribute("class", "slideshow-image first");
					this.appendChild(this.$firstImg);

					this.$rightArrow=document.createElement("div");
					this.$rightArrow.setAttribute("class", "arrow right-arrow");
					this.appendChild(this.$rightArrow);

					this.$leftArrow=document.createElement("div");
					this.$leftArrow.setAttribute("class", "arrow left-arrow");
					this.appendChild(this.$leftArrow);


					this.slideshowState="loading";
					this.loaded[0]=true;
				},
			},
			ready: {
				before:function(){
					console.log("ready");
					this.working=true;
					clearTimeout(this._animateTimeout);

					this.$firstImg.style.opacity=0;
					this.$firstImg.style.backgroundImage="";


					if (this._fsMode)
						this.$fsMode.insertBefore(this.$firstImg, this.$secondImg);
					else
						this.insertBefore(this.$firstImg, this.$secondImg);

					temp=this.$firstImg;
					this.$firstImg=this.$secondImg;
					this.$secondImg=temp;

					if (this.queue > 0) {
						this._nextTimeout= setTimeout(function() {this.next()}.bind(this), .2*1000);
					}

					if (this.queue < 0) {
						this._nextTimeout= setTimeout(function() {this.prev()}.bind(this), .2*1000);
					}
				}
			},
			loading: {
				before: function(){
					console.log("loading", this.$secondImg.style.opacity);
					this.$firstImg.style.opacity=0;
					this.$secondImg.style.opacity=0;

					console.log(document.body.clientWidth, document.body.clientHeight);
					var imgLoaded = function(){
						this.$preloader.style.opacity=0;
					/*	if (this.loaded[this.currentImg][0]<document.body.clientWidth){
							this.$secondImg.style.width=this.loaded[this.currentImg][0]+"px";
							//this.$secondImg.style.height="auto";
						}
						if (this.loaded[this.currentImg][1]<document.body.clientHeight){
							//this.$secondImg.style.width="auto";
							this.$secondImg.style.height=this.loaded[this.currentImg][1]+"px";
						}
*/
						this.$secondImg.style.backgroundImage="url('"+this.imgArray[this.currentImg]+"')";
						this.slideshowState="animating";
					}.bind(this);

					if (this.loaded[this.currentImg]==null){
						this.$preloader.style.opacity=1;
						var image = new Image();

						image.onload = function () {
							this.loaded[this.currentImg]=[image.width, image.height];
							console.log(this.loaded[this.currentImg], "gg")
							imgLoaded();
						}.bind(this);

						image.src = this.imgArray[this.currentImg];
					}
					else
					{
						imgLoaded();
					}

				}
			},
			animating:{
				before: function(){
					console.log("animating");
					this.$secondImg.style.opacity="1";
					this._animateTimeout= setTimeout(function() {this.slideshowState="ready"}.bind(this),
					 this._animationLength*1000);
				}
			}

		}
	}

});

Slideshow.register('slideshow',{selector: ".slideshow"});