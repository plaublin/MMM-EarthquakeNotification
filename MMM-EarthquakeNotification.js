Module.register("MMM-EarthquakeNotification", {

	// defaut configuration values
	defaults: {
		urlUpdateInterval: 30, // url check interval in second
		renderInterval: 5, // change displayed notification interval in second
		url: "https://www.data.jma.go.jp/developer/xml/feed/eqvol.xml",
		place: "東京",
		minShindo: 5,
	},

	// executed when the module is loaded successfully
	start: function () {
		this.notifications = []
		this.currentNotification = 0

		setInterval( () => {
			this.sendSocketNotification("FETCH_FEED_URL", this.config.url)
		}, this.config.urlUpdateInterval*1000)

		setInterval( () => {
			this.updateDom()
		}, this.config.renderInterval*1000)

		this.sendSocketNotification("FETCH_FEED_URL", this.config.url)
	},

	// render the content on MM screen
	// called automatically by MM core when it needs the module output to be refreshed
	getDom: function() {
		var element = document.createElement("div")
		//element.className = "thin large bright"
		element.className = "thin medium bright"

		//var notification = ["No earthquake information available for now...", ""]
		if (this.notifications.length > 0) {
			var notification = this.notifications[this.currentNotification]
			this.currentNotification = (this.currentNotification + 1) % this.notifications.length
			element.innerHTML = notification[0] + "<br />" + notification[1]
		} else {
			element.innerHTML = ""
		}

		return element
	},

	// MM and module communication
	notificationReceived: function() {
	},

	socketNotificationReceived: function(notification, payload) {
		switch(notification) {
			case "RECEIVE_XML_FEED":
				this.notifications = []
				parser = new DOMParser()
				xmlDoc = parser.parseFromString(payload, "text/xml")
				var entries = xmlDoc.getElementsByTagName("id")

				for (i=0; i<entries.length; i++) {
					var link = entries[i].textContent
					if (link.endsWith(".xml")) {
						this.sendSocketNotification("FETCH_SINGLE_EVENT", link)
					}
				}
				break
			case "RECEIVE_SINGLE_EVENT":
				parser = new DOMParser()
				xmlDoc = parser.parseFromString(payload, "text/xml")

				var type = xmlDoc.getElementsByTagName("Control")[0].childNodes[1].textContent
				// This is an earthquake
				if (type.startsWith("震源")) {
					//example of 地震: https://www.data.jma.go.jp/developer/xml/data/20221214020246_0_VXSE53_270000.xml
					// we want: time, location, intensity and tsunami risk
					// Head -> Headline -> Text 何時地震があった
					// Body -> Earthquake -> Hypocenter -> Area -> Name
					// Comments -> ForecastComment -> Text 津波のリスク

					var headline = xmlDoc.getElementsByTagName("Headline")[0].childNodes[1].textContent
					var hypocenter = xmlDoc.getElementsByTagName("Hypocenter")[0].childNodes[1].childNodes[1].textContent
					var shindo = xmlDoc.getElementsByTagName("jmx_eb:Magnitude")[0].textContent
					var comment = xmlDoc.getElementsByTagName("ForecastComment")[0].childNodes[1].textContent

					if (hypocenter.startsWith(this.config.place) || parseFloat(shindo) > this.config.minShindo) {
						this.notifications.push([hypocenter + "に、" + headline + "震度" + shindo, comment])
					}
				}

				//example of 火山: kkhttps://www.data.jma.go.jp/developer/xml/data/20221214050038_0_VFVO53_010000.xml
				//we want: time, location
				//TODO parse volcano events
				//TODO keep only the interesting ones (tokyo, funabashi, narashino)

				break
		}
	},
})
