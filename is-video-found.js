const ping = require('node-http-ping');
var urlExists = require('url-exists');
var Spinner = require('cli-spinner').Spinner;

const downloadsFolder = require('downloads-folder')
var fetchVideoInfo = require('youtube-info');
const youtubedl = require('youtube-dl')
const fs = require('fs')

exports.is_video_found = function (vidId) {
    link = 'https://www.youtube.com/watch?v='+vidId;
    let nomberoftime = ''; // Value should hold time in ms taken to search video

    ping(link)
    .then(time =>  {
        nomberoftime = time;
    })
    .catch(time => {
        nomberoftime = `${time}ms`;
    })

    var spinnerProccessing = new Spinner('proccessing... %s');
    spinnerProccessing.setSpinnerString('|/-\\');
    spinnerProccessing.start();

    urlExists(link, function(err, exists) {
        (exists)? console.log(`\nVideo link: ${link}\n\nVideo found on YouTube. Search time: ${nomberoftime}`):console.log(`\nVideo link: ${link}\n\nVideo hasn't been found on YouTube. Search time: ${nomberoftime}`)
        // console.log(exists+` ${nomberoftime}`); // true
        spinnerProccessing.stop(); // Stop proccessing
        if (exists) {
            // console.log(downloadsFolder())
            fetchVideoInfo(`${vidId}`, function (err, videoInfo) {
                if (err) throw new Error(err);
                let video_title = videoInfo.title;
                let video_title_underscore = videoInfo.title.replace(/\s/g, '_');

                const output = downloadsFolder()+`/${video_title_underscore}.mp4`
                // console.log(output);
                // process.exit()
 
                let downloaded = 0
                
                if (fs.existsSync(output)) {
                    // downloaded = fs.statSync(output).size
                    console.log(`Video already exist in download folder\n\nPath to video below:\n${output}\n`)
                    spinnerProccessing.stop(true); // Stop proccessing
                    process.exit()
                }
                
                const video = youtubedl(`${link}`,
                
                // Optional arguments passed to youtube-dl.
                ['--format=18'],
                
                // start will be sent as a range header
                { start: downloaded, cwd: __dirname })
                
                var spinner = new Spinner('downloading... %s');
                // Will be called when the download starts.
                video.on('info', function(info) {
                    spinnerProccessing.stop(true); // Stop proccessing

                    spinner.setSpinnerString('|/-\\'); // Start downloading...
                    spinner.start();
                    console.log('Download started')
                    console.log('filename: ' + info._filename)
                    
                    // info.size will be the amount to download, add
                    
                    let total = info.size + downloaded
                    console.log('size total: ' + total)

                    if (downloaded > 0 && downloaded < info.size) {
                        // size will be the amount already downloaded
                        console.log('resuming from: ' + downloaded)
                    
                        // display the remaining bytes to download
                        console.log('remaining bytes: ' + info.size)
                    }
                    if (downloaded == info.size) {
                         // Will be called if download was already completed and there is nothing more to download.
                        video.on('complete', function complete(info) {
                            'use strict'
                            console.log('filename: ' + info._filename + ' already downloaded.')
                        })
                    }
                })
                
                video.pipe(fs.createWriteStream(output, { flags: 'a' }))
                
               
                video.on('end', function() {
                    spinner.stop(true);
                    console.log('finished downloading!')
                })
            });
        }
    });

  };