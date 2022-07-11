
const zlib = require('zlib');
const https = require('https');

const slack_url = 'https://hooks.slack.com/services/.......';
const slack_req_opts = url.parse(slack_url);
slack_req_opts.method = 'POST';
slack_req_opts.headers = {'Content-Type': 'application/json'};

exports.handler = function(event, context) {
    console.log("Event: " + JSON.stringify(event, null, 2))
    var payload = new Buffer.from(event.awslogs.data, 'base64')
    zlib.gunzip(payload, function(e, decodedEvent) {
        if (e) {
            context.fail(e)
        } else {
            console.log("Decoded event: " + decodedEvent)
            decodedEvent = JSON.parse(decodedEvent.toString('ascii'))

            var req = https.request(slack_req_opts, function (res) {
                if (res.statusCode === 200) {
                    context.succeed('posted to slack');
                } else {
                    context.fail('status code: ' + res.statusCode);
                }
            });

            req.on('error', function(e) {
                console.log('problem with request: ' + e.message);
                context.fail(e.message);
            });

            req.write(JSON.stringify({text: JSON.stringify(decodedEvent, null, '  ')}));
            req.end();
        }
    })
}