/*
The MIT License (MIT)

Copyright (c) 2014-2023 Ichiro Maruta

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

/*Sound Effect by kave msri from Pixabay*/
/*Sound Effect by freesound_community from Pixabay*/
/*Sound Effect by Kalpesh Ajugia from Pixabay*/

$(function() {
	let nletters = 1, last_nletters = 1;
	let time_str = "5";
	let time_inner = 5 * 1000;
	var loadedcss = '';
	$('#seconds').val('5');
	$('#info').html("Clash of Statisticians");

	function getHashParams() {
		var hashParams = {};
		var e,
			a = /\+/g, // Regex for replacing addition symbol with a space
			r = /([^&;=]+)=?([^&;]*)/g,
			d = function(s) {
				return decodeURIComponent(s.replace(a, " "));
			},
			q = window.location.hash.substring(1);

		while (e = r.exec(q))
			hashParams[d(e[1])] = d(e[2]);
		return hashParams;
	}

	function parseHashParams() {
		params = getHashParams();
		if (params.s !== undefined) $('#seconds').val(params.s > 0 ? params.s : 5);
		if (params.m !== undefined) $('#info').html(DOMPurify.sanitize(params.m));
		if (loadedcss !== '') {
			location.reload();
		}
		if (params.th !== undefined && /^[a-zA-Z0-9\-]+$/.test(params.th)) {
			loadedcss = params.th;
		} else {
			loadedcss = 'default';
		}
		$('head').append('<link rel="stylesheet" type="text/css" href="theme/' + loadedcss + '.css">');
	}

	function updateHash() {
		let seconds_val = parseInt($('#seconds').val(), 10);
		if (isNaN(seconds_val) || seconds_val < 0) {
			seconds_val = 5;
		}
		var hashstr = '#s=' + seconds_val
			+ '&m=' + encodeURIComponent($('#info').html());
		if (loadedcss !== 'default') {
			hashstr = hashstr + '&th=' + encodeURIComponent(loadedcss);
		}
		$('#seturl').attr("href", hashstr);
		try {
			history.replaceState(undefined, undefined, hashstr);
		} catch (e) {
		}
	};

	$(window).on('hashchange', function() {
		parseHashParams();
		updateHash();
	});

	parseHashParams();
	updateHash();

	$('#seconds,#info').change(function() {
		updateHash();
	});

	$('#seconds').blur(function() {
		let seconds_val = parseInt($('#seconds').val(), 10);
		if (isNaN(seconds_val) || seconds_val < 0) {
			seconds_val = 5;
		}
		$('#seconds').val(seconds_val);
	});

	var infoline = $('#info').html();
	$('#info').blur(function() {
		if (infoline != $(this).html()) {
			infoline = $(this).html();
			updateHash();
		}
	});

	var audio_chime1;
	var audio_ticks;
	audio_chime1 = new Audio("./wav/chime1.mp3");
	// audio_ticks = new Audio("./wav/timer-ticks-314055.mp3");
	// audio_ticks = new Audio("./wav/time-ticker-slow-313807.mp3");
	// audio_ticks = new Audio("./wav/wall-clock-ticks-quartz-clock-25480.mp3");
	// audio_ticks = new Audio("./wav/watch-ticking-69213.mp3");
	audio_ticks = new Audio("./wav/watch-ticking-69213-2.mp3");
	audio_ticks.loop = true;

	function changeStateClass(s) {
		$('body').removeClass(function(index, className) {
			return (className.match(/\bstate-\S+/g) || []).join(' ');
		});
		$('body').addClass('state-' + s);
	};

	function changePhaseClass(s) {
		$('body').removeClass(function(index, className) {
			return (className.match(/\bphase-\S+/g) || []).join(' ');
		});
		$('body').addClass('phase-' + s);
	};

	function standby() {
		if (isPlaying(audio_ticks)) {
			audio_ticks.pause();
			audio_ticks.currentTime = 0;
		}
		$('.nav li').removeClass('active');
		$('.nav li#standby').addClass('active');
		$('#state').html('STANDBY');
		changeStateClass('standby');
		changePhaseClass('0');
		time_inner = parse_seconds($('#seconds').val());
		show_time();
	}

	function start() {
		if ($('.nav li#start').hasClass('active')) {
			return;
		}
		$('.nav li').removeClass('active');
		$('.nav li#start').addClass('active');
		$('#state').html('');
		changeStateClass('start');
		start_time = new Date((new Date()).getTime() + time_inner);
		last_time = 0;
		audio_ticks.load();
		audio_ticks.currentTime = 0;
		audio_ticks.play();
		audio_chime1.load();
	}

	$('.nav #standby').click(function(event) {
		event.preventDefault();
		standby();
	});

	standby();
	var start_time = new Date((new Date()).getTime() + time_inner);
	var last_time = 0;

	$('.nav #start').click(function(event) {
		event.preventDefault();
		start();
	});

	$('#time').dblclick(function(event) {
		event.preventDefault();
		let new_time = prompt('Force the time to', parse_time(time_str) / 1000);
		if (new_time !== null) {
			if (isNaN(new_time) || new_time < 0) {
				new_time = 5;
			}
			set_time(new_time);
		}
	});

	function pause() {
		if (isPlaying(audio_ticks)) {
			audio_ticks.pause();
			audio_ticks.currentTime = 0;
		}

		if ($('.nav li#standby').hasClass('active')) {
			return;
		}

		if ($('.nav li#pause').hasClass('active')) {
			return;
		}

		$('.nav li').removeClass('active');
		$('.nav li#pause').addClass('active');
		update_time();
		$('#state').html('PAUSED');
		changeStateClass('paused');
	}

	$('.nav #pause').click(function(event) {
		event.preventDefault();
		pause();
	});

	function resize_display() {
		var height = $('body').height();
		var width = $('body').width();
		var theight = Math.min(height * 3 / 5, width * 1.95 / nletters);
		$('#time').css('top', (height - theight) / 2 * 1.1);
		$('#time').css('font-size', theight + 'px');
		$('#time').css('line-height', theight + 'px');
		var sheight = theight / 6;
		$('#state').css('top', height / 2 - theight / 2 - sheight / 2);
		$('#state').css('font-size', sheight + 'px');
		$('#state').css('line-height', sheight + 'px');
		var iheight = sheight;
		$('#info').css('top', height / 2 + theight / 2);
		$('#info').css('font-size', iheight + 'px');
		$('#info').css('line-height', iheight + 'px');
	}
	$(window).bind("resize", resize_display);
	$(window).bind("orientationchange", resize_display);

	$('#soundcheck').click(function(event) {
		event.preventDefault();
		audio_chime1.load();
		audio_chime1.currentTime = 0;
		audio_chime1.play();
	});

	function format_time(t) {
		// if (t < 0) {
		// 	return '−' + format_time(-t + 999);
		// }
		var h = Math.floor(t / 3600000);
		var m = Math.floor((t - h * 3600000) / 60000);
		var s = Math.floor((t - h * 3600000 - m * 60000) / 1000);
		if (h > 0) {
			return h + ':' + ('00' + m).slice(-2) + ':' + ('00' + s).slice(-2);
		} else if (m > 0) {
			return m + ':' + ('00' + s).slice(-2);
		} else {
			return s.toString();
		}
	}
	function show_time() {
		time_str = format_time(time_inner + 999);
		nletters = time_str.length;
		if (nletters != last_nletters) {
			resize_display();
			last_nletters = nletters;
		}
		$('#time').html(time_str);
	}

	function set_time(t_str) {
		start_time = new Date((new Date()).getTime() + parse_seconds(t_str));
		update_time();
	}

	window.set_time = set_time;

	function update_time() {
		var cur_time = new Date();
		var e = start_time - cur_time;
		time_inner = e;
		show_time();
	}

	function parse_time(tstr) {
		// if (tstr.charAt(0) === '-' || tstr.charAt(0) === '−') {
		// 	return (-parse_time(tstr.slice(1)));
		// }
		const parts = tstr.split(/[:∶]/).reverse();
		let time = 0;

		// seconds
		if (parts[0]) time += parseInt(parts[0], 10) * 1000;
		// minutes
		if (parts[1]) time += parseInt(parts[1], 10) * 60 * 1000;
		// hours
		if (parts[2]) time += parseInt(parts[2], 10) * 60 * 60 * 1000;

		return time;
	}

	function parse_seconds(tstr) {
		const time = parseInt(tstr, 10) * 1000
		return time;
	}

	function isPlaying(audio) {
		return !audio.paused && !audio.ended && audio.currentTime > 0;
	}

	$('[data-toggle="tooltip"]').tooltip();
	$.timer(100, function(timer) {
		resize_display();
		if ($('.nav li#start').hasClass('active')) {
			update_time();

			if (time_inner <= last_time) {
				changePhaseClass('1');
				audio_ticks.pause();
				audio_ticks.currentTime = 0;
				audio_chime1.currentTime = 0;
				audio_chime1.play();
				// console.log('chime1');
				standby();
			}
		}
	});

	function obs_scene_change(name) {
		if (name.indexOf(':standby') != -1) {
			standby();
		}
		if (name.indexOf(':start') != -1) {
			start();
		}
		if (name.indexOf(':pause') != -1) {
			pause();
		}
	}

	if (window.obsstudio) {
		window.obsstudio.getCurrentScene(function(scene) {
			obs_scene_change(scene.name);
		});
		window.addEventListener('obsSceneChanged', function(event) {
			obs_scene_change(event.detail.name);
		})
	}
	show_time();
});

// Keyboard shortcut
$(document).keydown(function(event) {
	if (event.key === " ") {
		event.preventDefault();
		if ($('.nav li#start').hasClass('active')) {
			$('.nav #standby').trigger("click");
		} else {
			$('.nav #start').trigger("click");
		}
	}

	if (event.key.toLowerCase() === "p") {
		event.preventDefault();
		$('.nav #pause').trigger("click");
	}
});

