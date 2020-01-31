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
        (exists)? console.log(`\nVideo link: ${link}\n\nVideo found on YouTube. Search time: ${nomberoftime}`):console.log(`\nVideo link: ${link}\n\nVideo hasn't been found on YouTube. Search time: ${nomberoftime}`);

        if (exists) {
            // console.log(downloadsFolder())
            fetchVideoInfo(`${vidId}`, function (err, videoInfo) {
                if (err) throw new Error(err);
                let video_title = videoInfo.title;
                let video_title_underscore = videoInfo.title.replace(/\s/g, '_');

                const output = downloadsFolder()+`/${video_title_underscore}.mp4`;
 
                let downloaded = 0;
                let downloadedOld = 0;
                
                if (fs.existsSync(output)) {
                    downloadedOld= fs.statSync(output).size;
                }
                
                const video = youtubedl(`${link}`,
                
                // Optional arguments passed to youtube-dl.
                ['--format=18'],
                
                // start will be sent as a range header
                { start: downloaded, cwd: __dirname });
                
                var spinner = new Spinner('downloading... %s');
                // Will be called when the download starts.
                video.on('info', function(info) {
                    spinnerProccessing.stop(true); // Stop proccessing
                    spinner.setSpinnerString('|/-\\');
                    console.log('Download started');
                    spinner.start(); // Start downloading...
                    
                    console.log('filename: ' + info._filename);
                    
                    console.log(`size of video downloaded ${info.size}bit`);
                    
                    if (downloadedOld > 0 && downloadedOld < info.size) {
                        fs.unlink(output, function (err) {
                            if (err) throw err;
                            // if no error, file has been deleted successfully
                            console.log('old file deleted successfully!');
                        });
                        // size will be the amount already downloaded
                        // console.log('resuming from: ' + downloaded);
                    
                        // display the remaining bytes to download
                        // console.log('remaining bytes: ' +(info.size-downloaded));
                    }
                    if(downloadedOld == info.size || downloadedOld > info.size) {
                        console.log(`Video already exist in download folder\n\nPath to video below:\n${output}\n`);
                        spinner.stop(true);
                        process.exit();
                    }
                })
                
                video.pipe(fs.createWriteStream(output, { flags: 'a' }))
                
                // Will be called if download was already completed and there is nothing more to download.
                video.on('complete', function complete(info) {
                    'use strict'
                    console.log('filename: ' + video_title_underscore + '.mp4 already downloaded.')
                })

                video.on('end', function() {
                    spinner.stop(true);
                    console.log('finished downloading!')
                })
            });
        }
    });

  };