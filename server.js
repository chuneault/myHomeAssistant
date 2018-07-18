const bodyParser = require('body-parser'),
      express = require('express'),
      morgan = require('morgan'),
      session = require('express-session'),
      fs = require('fs'),
      https = require('https');

// internal app deps
let authProvider = require('./auth-provider');

let app = express();

let options = {
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem'),
    passphrase: 'Hintendo45'
};

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.set('trust proxy', 1); // trust first proxy
app.use(session({
  genid: function (req) {
    return authProvider.genRandomString()
  },
  secret: 'xyzsecret',
  resave: false,
  saveUninitialized: true,
  cookie: {secure: false}
}));

const appPort = process.env.PORT || "3000";


app.post('/', function (request, response){
	console.log(request.body);
	
	let actions = request.body.inputs[0];
	if (actions.payload)
		console.log(actions.payload);
	
	let requestId = request.body.requestId;
    let result;

	if (actions.intent == 'action.devices.SYNC') 
		result = {
          "requestId": requestId,
          "payload": {
            "agentUserId": "1836.15267389",
            "devices": [{
              "id": "123",
              "type": "action.devices.types.OUTLET",
              "traits": [
                "action.devices.traits.OnOff"
              ],
              "name": {
                "defaultNames": ["My Outlet 1234"],
                "name": "Night light",
                "nicknames": ["wall plug"]
              },
              "willReportState": false,
              "roomHint": "kitchen",
              "deviceInfo": {
                "manufacturer": "lights-out-inc",
                "model": "hs1234",
                "hwVersion": "3.2",
                "swVersion": "11.4"
              },
              "customData": {
                "fooValue": 74,
                "barValue": true,
                "bazValue": "foo"
              }
            },{
              "id": "456",
              "type": "action.devices.types.LIGHT",
                "traits": [
                  "action.devices.traits.OnOff", "action.devices.traits.Brightness",
                  "action.devices.traits.ColorTemperature",
                  "action.devices.traits.ColorSpectrum"
                ],
                "name": {
                  "defaultNames": ["lights out inc. bulb A19 color hyperglow"],
                  "name": "lamp1",
                  "nicknames": ["reading lamp"]
                },
                "willReportState": false,
                "roomHint": "office",
                "attributes": {
                  "temperatureMinK": 2000,
                  "temperatureMaxK": 6500
                },
                "deviceInfo": {
                  "manufacturer": "lights out inc.",
                  "model": "hg11",
                  "hwVersion": "1.2",
                  "swVersion": "5.4"
                },
                "customData": {
                  "fooValue": 12,
                  "barValue": false,
                  "bazValue": "bar"
                }
              }]
          }
        };
	
	if (actions.intent == 'action.devices.EXECUTE') 
		result = {
          "requestId": requestId,
          "payload": {
            "commands": [{
              "ids": ["123"],
              "status": "SUCCESS",
              "states": {
                "on": true,
                "online": true
              }
            },{
              "ids": ["456"],
              "status": "SUCCESS",
              "errorCode": "deviceTurnedOff"
            }]
          }
        };
	
	response.json(result);
});

let server = https.createServer(options, app).listen(appPort, function(){
    console.log("Express server listening on port " + appPort);
    authProvider.registerAuth(app);
});

