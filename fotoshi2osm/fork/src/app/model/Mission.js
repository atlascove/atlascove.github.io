import Hash from 'object-hash';
import P4C from 'pic4carto';

const TYPES = [ "improve", "fix", "integrate" ];
const STATUSES = [ "online", "draft", "canceled", "deleted" ];

/**
 * A mission is a task on which user can work. It concerns a given set of {@link Feature}, over a given area.
 * A mission is also categorized by its type (improve, fix, integrate) and its theme.
 * 
 * @param {int} id The mission unique ID
 * @param {string} type The kind of mission (one of improve, fix, integrate)
 * @param {string} theme The mission theme
 * @param {Object} area The mission area
 * @param {string} area.name The area name (for example "Rennes, France, Europe")
 * @param {LatLngBounds} [area.bbox] The area bounding box (see {@link https://framagit.org/Pic4Carto/Pic4Carto.js/blob/master/doc/API.md#latlngbounds|LatLngBounds in Pic4Carto documentation})
 * @param {Object} description The mission details
 * @param {string} description.short The mission goal in a few words
 * @param {string} [description.full] The mission goal detailled (what to do, how...)
 * @param {string} [status] The mission status (online, draft, canceled, deleted), defaults to draft
 * @param {Feature[]} [features] The list of features (can be set later)
 * @param {Object} [options] Mission options
 * 
 * @property {int} id An unique ID representing this mission
 * @property {string} type The kind of mission (one of improve, fix, integrate)
 * @property {string} theme The mission theme
 * @property {Object} area The mission area
 * @property {string} area.name The area name (for example "Rennes, France, Europe")
 * @property {LatLngBounds} area.bbox The area bounding box
 * @property {string} status The mission status (online, draft, canceled)
 */
class Mission {
	constructor(id, type, theme, area, description, status, features, options) {
		if(type === null || type === undefined || TYPES.indexOf(type) < 0) {
			throw new TypeError("Mission type must be one of "+TYPES.join(", "));
		}
		else if(theme === null || theme === undefined || theme.length < 3) {
			throw new TypeError("Mission theme must be defined");
		}
		else if(!area || !area.name) {
			throw new TypeError("Mission area is unknown");
		}
		else if(area.bbox && !area.bbox.toBBoxString) {
			throw new TypeError("Mission area is not correctly defined");
		}
		else if(!description || !description.short || description.short.trim().length < 10) {
			throw new TypeError("Mission name and description must be defined. Name must be at least 10 characters long.");
		}
		else if(status && STATUSES.indexOf(status) < 0) {
			throw new TypeError("Mission status should be one of "+STATUSES.join(", "));
		}
		
		this.id = id;
		this._type = type;
		this._theme = theme;
		this._area = area;
		this._description = description;
		this._status = status || "draft";
		this.features = features || null;
		this._options = options || {};
	}
	
	/**
	 * Create Mission object from API response
	 * @param {Object} options The API response for one mission
	 * @return {Mission} The corresponding mission
	 */
	static CreateFromAPI(options) {
		let bbox = null;
		let opts = {};
		
		if(options.geom) {
			const c = options.geom.coordinates[0];
			bbox = new P4C.LatLngBounds(new P4C.LatLng(c[0][1], c[0][0]), new P4C.LatLng(c[2][1], c[2][0]));
		}
		
		if(options.total) {
			opts.stats = {
				"new": options.new,
				completed: options.completed,
				reviewed: options.seen,
				total: options.total,
				nopics: options.nopics,
				seen: options.seen
			};
		}
		
		if(options.datatype || options.dataoptions) {
			opts.data = { source: options.datatype, options: options.dataoptions };
		}
		
		if(options.contributors) {
			opts.contributors = parseInt(options.contributors);
		}
		else {
			opts.contributors = null;
		}
		
		const optsToCopy = {
			lastedit: "date",
			created: "dateCreation",
			illustration: "illustration",
			template: "template",
			layers: "layers",
			username: "username",
			userid: "userid"
		};
		
		Object.entries(optsToCopy).forEach(e => {
			if(options[e[0]]) {
				opts[e[1]] = options[e[0]];
			}
		});
		
		opts.canEdit = options.canEdit || options.editor || false;
		
		return new Mission(
			options.id,
			options.type,
			options.theme,
			{ name: options.areaname, bbox: bbox },
			{ short: options.shortdesc, full: options.fulldesc },
			options.status || "draft",
			null,
			opts
		);
	}

//ACCESSORS
	get type() {
		return this._type;
	}
	
	get theme() {
		return this._theme;
	}
	
	get area() {
		return this._area;
	}
	
	get status() {
		return this._status;
	}
	
	get description() {
		return this._description;
	}
	
	get options() {
		return this._options;
	}

//MODIFIERS
	set status(s) {
		if(STATUSES.indexOf(s) >= 0) {
			this._status = s;
		}
		else {
			throw new TypeError("Invalid status", s);
		}
	}

//OTHER METHODS
	/**
	 * Is this mission meeting criterias defined by given filters ?
	 * @param {Object} filters The list of filters (type, theme)
	 * @return {boolean} True if mission meets criterias
	 */
	passFilter(filters) {
		for(const k in filters) {
			const v = filters[k] || null;
			
			switch(k) {
				case "type":
					if(v && this._type !== v) { return false; }
					break;
				
				case "theme":
					if(v && this._theme !== v) { return false; }
					break;
			}
		}
		
		return true;
	}
}

export default Mission;
