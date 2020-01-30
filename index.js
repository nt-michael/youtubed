// Include prompt module.
var prompt = require('prompt');
var validVid = require('./is-video-found.js')

if(process.argv[2] === undefined){
    // This json object is used to configure what data will be retrieved from command line.
    var prompt_attributes = [
        {
            // The fist input text is assigned to username variable.
            name: 'YouTube Video Id',
            // The username must match below regular expression.
            validator: /^[a-zA-Z0-9-_]{11}$/,
            // If username is not valid then prompt below message.
            warning: 'Video Id is not valid, it must be of length 11 ex: wnHW6o8WMas'
        }
    ];
    // Start the prompt to read user input.
    prompt.start();

    // Prompt and get user input then display those data in console.
    prompt.get(prompt_attributes, (err, result) => {
        if (err) {
            console.log(err);
            return 1;
        }else {
            // Get user input from result object.
            let ylink = result['YouTube Video Id'];
            console.log(`Youtube Id: ${ylink}`);
            validVid.is_video_found(ylink)
        }
    });
} else {
    if(/^[a-zA-Z0-9-_]{11}$/.test(process.argv[2])) {
        validVid.is_video_found(process.argv[2])
    }else {
        console.log ("\nIncorrect parameter entered\nHere's how to download a YouTube Video; there are two options:\n\n1. npm youtubed\nThis will prompt you for the YouTube video Id\n\n2. node index.js wnHW6o8WMas\nwhere wnHW6o8WMas is your YouTube Video Id\n\n")
        process.exit()
    }
}
