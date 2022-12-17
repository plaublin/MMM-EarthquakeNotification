var NodeHelper = require("node_helper")
const fetch = require("fetch");

module.exports = NodeHelper.create({
	start: function() {
		this.countDown = 10000000
	},

	socketNotificationReceived: function(notification, payload) {
		switch(notification) {
			case "FETCH_FEED_URL":
				fetch(payload)
					.then(response => response.text())
					.then(xmlString => {
						this.sendSocketNotification("RECEIVE_XML_FEED", xmlString)
				})
				break
			case "FETCH_SINGLE_EVENT":
				fetch(payload)
					.then(response => response.text())
					.then(xmlString => {
						this.sendSocketNotification("RECEIVE_SINGLE_EVENT", xmlString)
				})
				break
		}
	},
})
