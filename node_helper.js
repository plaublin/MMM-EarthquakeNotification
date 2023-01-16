var NodeHelper = require("node_helper")
const fetch = require("node-fetch");

module.exports = NodeHelper.create({
	start: function() {
	},

	socketNotificationReceived: function(notification, payload) {
		const nodeVersion = Number(process.version.match(/^v(\d+\.\d+)/)[1]);
		const headers = {
			"User-Agent": "Mozilla/5.0 (Node.js " + nodeVersion + ") MagicMirror/" + global.version + " (https://github.com/MichMich/MagicMirror/)",
			"Cache-Control": "max-age=0, no-cache, no-store, must-revalidate",
			Pragma: "no-cache"
		};

		switch(notification) {
			case "FETCH_FEED_URL":
				//console.log("Need to fetch the feed")
				fetch(payload, { headers: headers })
					.then(response => response.text())
					.then(xmlString => {
						this.sendSocketNotification("RECEIVE_XML_FEED", xmlString)
				})
				break
			case "FETCH_SINGLE_EVENT":
				//console.log("Need to fetch a single event")
				fetch(payload, { headers: headers })
					.then(response => response.text())
					.then(xmlString => {
						this.sendSocketNotification("RECEIVE_SINGLE_EVENT", xmlString)
				})
				break
		}
	},
})
