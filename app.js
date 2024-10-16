URL = window.URL || window.webkitURL; // Ensures compatibility with older browsers that use webkitURL.

var gumStream;  // This will store the audio stream from the microphone.
var rec;  // This is the recorder object that handles the actual audio recording.
var input;  // This is the audio input from the microphone, which will be connected to the recorder.

var AudioContext = window.AudioContext || window.webkitAudioContext; // Ensures compatibility with older browsers.
var audioContext;  // The main audio context for handling the audio processing in the browser.

var recordButton = document.getElementById("recordButton");  // The button to start recording.
var stopButton = document.getElementById("stopButton");  // The button to stop recording.
var pauseButton = document.getElementById("pauseButton");  // The button to pause/resume recording.

// Event listeners for the buttons
recordButton.addEventListener("click", startRecording);  // Start recording when the user clicks the record button.
stopButton.addEventListener("click", stopRecording);  // Stop recording when the user clicks the stop button.
pauseButton.addEventListener("click", pauseRecording);  // Pause or resume recording when the pause button is clicked.

// This function starts the recording process
function startRecording() {
	console.log("recordButton clicked");

	// Set the audio constraints: we're asking for only audio, no video.
	var constraints = { audio: true, video: false };

	// Disable the record button to prevent multiple recordings and enable the stop and pause buttons.
	recordButton.disabled = true;
	stopButton.disabled = false;
	pauseButton.disabled = false;

	// Request permission to access the microphone using the browser's mediaDevices API.
	navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
		console.log("getUserMedia() success, stream created, initializing Recorder.js ...");

		// Create an audio context. This is like a virtual space where audio can be processed.
		audioContext = new AudioContext();

		// Display the audio format (1 channel, PCM, and the sample rate) to the user.
		document.getElementById("formats").innerHTML = "Format: 1 channel pcm @ " + audioContext.sampleRate / 1000 + "kHz";

		// Save the audio stream for later use (like when stopping the recording).
		gumStream = stream;

		// Create an audio input source from the microphone stream.
		input = audioContext.createMediaStreamSource(stream);

		// Initialize the recorder object. We configure it to record in mono (1 channel).
		rec = new Recorder(input, { numChannels: 1 });

		// Start recording!
		rec.record();
		console.log("Recording started");

	}).catch(function (err) {
		// If there's an error (like the user denies microphone access), re-enable the record button and disable the others.
		recordButton.disabled = false;
		stopButton.disabled = true;
		pauseButton.disabled = true;
	});
}

// This function pauses and resumes recording
function pauseRecording() {
	console.log("pauseButton clicked rec.recording=", rec.recording);
	if (rec.recording) {
		// If it's recording, stop the recording (pausing it).
		rec.stop();
		pauseButton.innerHTML = "Resume";  // Change the button text to "Resume".
	} else {
		// If it's paused, start recording again (resume).
		rec.record();
		pauseButton.innerHTML = "Pause";  // Change the button text back to "Pause".
	}
}

// This function stops the recording
function stopRecording() {
	console.log("stopButton clicked");

	// Disable the stop button and enable the record button so the user can make another recording.
	stopButton.disabled = true;
	recordButton.disabled = false;
	pauseButton.disabled = true;

	// Reset the pause button text just in case it was paused when the stop button was clicked.
	pauseButton.innerHTML = "Pause";

	// Stop the recorder from recording.
	rec.stop();

	// Stop the microphone from capturing more audio.
	gumStream.getAudioTracks()[0].stop();

	// Export the recorded audio as a .wav file and create a download link for it.
	rec.exportWAV(createDownloadLink);
}

// This function creates the download link for the recorded audio
function createDownloadLink(blob) {
	var url = URL.createObjectURL(blob);  // Create a URL for the audio file.
	var au = document.createElement('audio');  // Create an audio element to play the recording.
	var li = document.createElement('li');  // Create a list item to hold the recording.
	var link = document.createElement('a');  // Create a download link for the file.

	// Use the current date and time as the filename.
	var filename = new Date().toISOString();

	// Add controls to the audio element (play/pause/volume).
	au.controls = true;
	au.src = url;

	// Set up the download link with the filename.
	link.href = url;
	link.download = filename + ".wav";  // The file will be saved as a .wav file.
	link.innerHTML = "Save to disk";  // Text that will appear on the download link.

	// Add the audio element and the download link to the list item.
	li.appendChild(au);
	li.appendChild(document.createTextNode(filename + ".wav "));  // Display the filename.
	li.appendChild(link);

	// Append the list item to the recordings list (a pre-existing element in your HTML).
	recordingsList.appendChild(li);
}
