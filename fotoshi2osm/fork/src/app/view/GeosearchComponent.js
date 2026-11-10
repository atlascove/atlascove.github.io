import React, { Component } from 'react';
import { LatLngBounds } from 'leaflet';
import MapMarker from 'mdi-material-ui/MapMarker';
import Nominatim from 'nominatim-browser';
import SelectList from './SelectListComponent';
import TextField from 'material-ui/TextField';
import Wait from './WaitComponent';

/**
 * GeosearchComponent allows to search places and select the most appropriate one.
 */
class GeosearchComponent extends Component {
	constructor() {
		super();

		this.state = {
			waitForResult: false,
			results: null,
			text: null
		};

		this.delaySearch = null;
	}

	_onTextChange(t) {
		if(t.trim() !== this.state.text) {
			this.setState({ text: t.trim(), waitForResult: true, results: null });

			//Delay start of search request
			if(this.delaySearch) {
				clearTimeout(this.delaySearch);
				this.delaySearch = null;
			}

			this.delaySearch = setTimeout(() => this._search(), 1500);
		}
	}

	_search() {
		if(this.state.text && this.state.text.length > 3) {
			Nominatim.geocode({
				q: this.state.text
			})
			.then(results => {
				const filteredResults = results || [];

				if(filteredResults.length > 0) {
					let entries = filteredResults.map(r => {
						const names = r.display_name.split(', ');
						const coords = r.boundingbox.map(parseFloat); //Format : minlat, maxlat, minlon, maxlon
						return {
							title: names[0],
							subtitle: names.length > 1 ? names.slice(1).join(', ') : '',
							icon: <MapMarker />,
							names: names,
							bbox: new LatLngBounds([ coords[0], coords[2] ], [ coords[1], coords[3] ])
						};
					});
					entries = entries.filter((e,i) => i === 0 || !(e.title === entries[i-1].title && e.subtitle === entries[i-1].subtitle));

					this.setState({ waitForResult: false, results: entries });
				}
				else {
					this.setState({ waitForResult: false, results: null });
					PubSub.publish("UI.MESSAGE.BASIC", { type: "alert", message: I18n.t("Can't find any results for this place name. Can you try writing it in another way ?") });
				}
			})
			.catch(e => {
				this.setState({ waitForResult: false, results: null });
				PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Oops ! Address search service seems unavailable for now"), details: e.message });
			});
		}
	}

	render() {
		return <div>
			<TextField
				id="geosearch"
				label={I18n.t("Search place")}
				helperText={I18n.t("Type the name of your city, county... to start search")}
				style={{width: "100%", marginBottom: 10}}
				onChange={e => this._onTextChange(e.target.value)}
			/>

			{this.state.waitForResult && <Wait />}

			{this.state.results && <SelectList
				entries={this.state.results}
				onSelect={this.props.onSelect}
			/>}
		</div>;
	}
}

export default GeosearchComponent;
