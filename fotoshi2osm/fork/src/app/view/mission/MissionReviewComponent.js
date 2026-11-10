import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import withWidth from 'material-ui/utils/withWidth';
import { withStyles } from 'material-ui/styles';
import { MapMarkerRadius, ImageMultiple, Information, Pencil, Check, SkipForward, SkipPrevious, EyeOff } from 'mdi-material-ui';
import API from '../../ctrl/API';
import BottomNavigation, { BottomNavigationAction } from 'material-ui/BottomNavigation';
import Button from 'material-ui/Button';
import ConfirmDuplicate from './MissionReviewFeatureDuplicateDialogComponent';
import ConfirmEdit from './MissionReviewFeatureDialogComponent';
import Editors from './MissionReviewEditorsComponent';
import First from './MissionFirstReviewComponent';
import Gallery from './MissionReviewGallery3Component';
import Grid from 'material-ui/Grid';
import Hidden from 'material-ui/Hidden';
import Leaflet from 'leaflet';
import Map from './MissionReviewMapComponent';
import Markdown from 'react-markdown';
import P4C from 'pic4carto';
import Paper from 'material-ui/Paper';
import Question from './MissionReviewQuestionComponent';
import Statistics from './MissionReviewStatisticsComponent';
import Tags from './MissionReviewTagsComponent';
import Tooltip from 'material-ui/Tooltip';

const PICTURE_HEIGHT = { "xs": 400, "sm": 500, "md": 600, "lg": 700, "xl": 800 };
const MAP_HEIGHT = { "xs": 180, "sm": 300, "md": 300, "lg": 250, "xl": 250 };
const NOT_FIRST_REVIEW = "no1st";
const EDITS_COUNT = "edits_count";
const PICS_PER_PAGE = 10;

const styles = theme => ({ root: theme.typography.caption });

/**
 * Mission review component allows to review pictures for a given mission.
 * You can review features one by one.
 */
class MissionReviewComponent extends Component {
	constructor() {
		super();

		this.state = {
			feature: null,
			pictures: null,
			currentPictureId: null,
			clickedPictureId: null,
			prevData: null,
			count: null,
			firstReview: false,
			openEditors: false,
			editorsAnchor: null,
			currentAnswer: null,
			openConfirmEdit: false,
			hideConfirmEdit: false,
			openConfirmDuplicate: false,
			hideConfirmDuplicate: false,
			shownPics: 0,
			noMorePics: false,
			stats: {},
			mapZoom: 18,
			mapBaseLayer: null,
			markedPictureId: -1,
			featureCanMove: false,
			newFeatureGeometry: null,
			similar: null,
			bottomNav: 0
		};

		this.psTokens = {};
		this.picMan = new P4C.PicturesManager({ ignorefetchers: ["flickr"] });
	}

	/**
	 * Start looking for next feature
	 * @private
	 */
	_next(wasSkipped) {
		wasSkipped = wasSkipped || false;
		const prevCoords = !wasSkipped && this.state.feature !== null && !this._isImporter() ? this.state.feature.coordinates : null;
		const prevId = this.state.feature !== null ? this.state.feature.id : null;

		this.setState({
			feature: null,
			pictures: null,
			currentPictureId: null,
			clickedPictureId: null,
			markedPictureId: -1,
			prevData: wasSkipped || !this.state.feature ? null : this.state,
			currentAnswer: null,
			shownPics: 0,
			noMorePics: false,
			count: parseInt(sessionStorage.getItem(EDITS_COUNT+"_"+this.props.mission.id)) || 0,
			featureCanMove: false,
			newFeatureGeometry: null,
			similar: null
		});

		PubSub.publish("UI.MESSAGE.WAIT", { message: I18n.t("Retrieving next feature to review") });

		API.GetMissionNextFeature(this.props.mission.id, prevCoords, this.props.user.id)
		.then(f => {
			if(f !== null) {
				//Handle case where returned feature is same as previous one (API async bug ?)
				if(!prevId || f.id !== prevId) {
					//Find pictures already associated to feature
					const picsFromTags = this.picMan.getPicturesFromTags(f.properties);

					f.pictures.map(p => {
						p.featured = picsFromTags.includes(p.pictureUrl);
						return p;
					});

					f.pictures.sort((a, b) => {
						if(a.featured === b.featured) {
							return b.date - a.date;
						}
						else {
							return a.featured ? -1 : 1;
						}
					});

					// Function when everything is ready for display
					const showFeature = () => {
						//Change state
						this.setState({
							feature: f,
							pictures: f.pictures,
							currentPictureId: (f.pictures && f.pictures.length > 0 ? 0 : null),
							bottomNav: 0,
							shownPics: (f.pictures && f.pictures.length > 0 ? Math.min(f.pictures.length, PICS_PER_PAGE) : 0),
							noMorePics: f.geometry.type !== "Point" && f.pictures.length <= PICS_PER_PAGE
						});

						if(this.refs.container) {
							this.refs.container.scrollIntoView(false);
						}

						//Check if we allow feature geometry editing (must have integrated editor + be a node)
						if(
							this.props.mission.options && this.props.mission.options.data
							&& this.props.mission.options.data.options && this.props.mission.options.data.options.editors
							&& this.props.mission.options.data.options.editors.type !== "disabled"
						) {
							// If editing OSM data
							if(this.props.mission.options.data.options.editors.type !== "importer" && f.properties.id) {
								API.CanOSMFeatureMove(f.properties.id)
								.then(canMove => {
									if(this.state.feature.properties.id === f.properties.id && canMove) {
										this.setState({ featureCanMove: true });
									}
								})
								.catch(e => console.error);
							}
							// If editing external data
							else if(this.props.mission.options.data.options.editors.type === "importer") {
								if(this.state.feature.geometry.type === "Point") {
									this.setState({ featureCanMove: true });
								}
							}
						}

						PubSub.publish("UI.MESSAGE.WAITDONE");

						if(!f.pictures || f.pictures.length === 0) {
							PubSub.publish("UI.MESSAGE.BASIC", { type: "info", message: I18n.t("No pictures available around this feature") });
						}

						//Load user statistics for this mission
						API.GetMissionUserStatistics(this.props.mission.id, this.props.user.id)
						.then(s => {
							this.setState({ stats: s });
						});
					};

					if(this._isImporter()) {
						API.FindSimilarAround(
							this.props.mission.options.data.options.editors.mainTags,
							f.geometry,
							this.props.mission.options.data.options.editors.conflation
						)
						.then(similarFeatures => {
							if(similarFeatures && similarFeatures.features && similarFeatures.features.length > 0) {
								this.setState({ similar: similarFeatures });
							}

							showFeature();
						})
						.catch(e => {
							console.error(e);
							showFeature();
						});
					}
					else {
						showFeature();
					}
				}
				else {
					this._next(wasSkipped);
				}
			}
			else {
				PubSub.publish("UI.MESSAGE.WAITDONE");
				if(this.state.count > 0) {
					PubSub.publish("UI.MESSAGE.BASIC", { type: "info", message: I18n.t("You just reviewed the last available feature, thank you so much ! You can work on another mission if you want to"), smiley: "😊", duration: 7000 });
				}
				else {
					PubSub.publish("UI.MESSAGE.BASIC", { type: "info", message: I18n.t("This mission has already been completed ! But you can check out another mission"), smiley: "😋", duration: 6000 });
				}
				this.props.history.push('/mission/'+this.props.mission.id+'/summary');
			}
		})
		.catch(e => {
			console.error(e);
			PubSub.publish("UI.MESSAGE.WAITDONE");
			PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Oops ! Can't retrieve next feature to review."), details: e.message });
		});
	}

	/**
	 * Go back to previous feature
	 * @private
	 */
	_prev() {
		if(this.state.prevData) {
			this.setState({
				prevData: null,
				feature: this.state.prevData.feature,
				pictures: this.state.prevData.pictures,
				shownPics: this.state.prevData.shownPics,
				noMorePics: this.state.prevData.noMorePics,
				currentPictureId: this.state.prevData.pictures && this.state.prevData.pictures.length > 0 ? 0 : null,
				clickedPictureId: null,
				markedPictureId: -1,
				featureCanMove: this.state.prevData.featureCanMove,
				newFeatureGeometry: null,
				similar: null,
				bottomNav: 0
			});
		}
		else {
			PubSub.publish("UI.MESSAGE.BASIC", { type: "info", message: I18n.t("You can't go back anymore") });
		}
	}

	/**
	 * Is this mission using importer editor ?
	 * @private
	 */
	_isImporter() {
		return this.props.mission.options
			&& this.props.mission.options.data
			&& this.props.mission.options.data.options
			&& this.props.mission.options.data.options.editors
			&& this.props.mission.options.data.options.editors.type === "importer";
	}

	/**
	 * Load more pictures around the feature
	 * @private
	 */
	_loadMorePics() {
		//Pictures left in cache
		if(this.state.shownPics < this.state.pictures.length) {
			const newState = {};
			let newShownPics = Math.min(this.state.shownPics+PICS_PER_PAGE, this.state.pictures.length);

			//Avoid showing no more pics msg
			if(newShownPics === this.state.pictures.length) {
				if(this.state.noMorePics) {
					newShownPics++;
				}

				if(this.state.feature.geometry.type !== "Point") {
					newState.noMorePics = true;
				}
			}

			// Go to next image
			if(newShownPics > this.state.shownPics) {
				newState.currentPictureId = this.state.shownPics;
			}

			newState.shownPics = newShownPics;
			this.setState(newState);
		}
		//Load from Pic4Carto
		else if(!this.state.noMorePics && this.state.feature.geometry.type === "Point") {
			PubSub.publish("UI.MESSAGE.WAIT", { message: I18n.t("Loading more pictures around") });

			this.picMan.startPicsRetrievalAround(
				new P4C.LatLng(this.state.feature.coordinates[0], this.state.feature.coordinates[1]),
				30,
				{ mindate: Date.now() - 1000*3600*24*365*3, towardscenter: false }
			)
			.then(pics => {
				const newPics = this.state.pictures ? this.state.pictures.slice(0) : [];

				//Avoid adding pics we already have
				pics.forEach(p => {
					let dupe = false;
					const json = JSON.stringify(p.osmTags);
					for(let i=0; i < newPics.length; i++) {
						if(json === JSON.stringify(newPics[i].osmTags)) {
							dupe = true;
							break;
						}
					}

					if(!dupe) {
						newPics.push(p);
					}
				});

				this.setState({
					pictures: newPics,
					shownPics: Math.min(this.state.shownPics + PICS_PER_PAGE, newPics.length + 1),
					noMorePics: true,
					currentPictureId: newPics.length > this.state.pictures.length ? this.state.shownPics : this.state.currentPictureId
				});

				PubSub.publish("UI.MESSAGE.WAITDONE");
			})
			.catch(e => {
				PubSub.publish("UI.MESSAGE.WAITDONE");
				PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Oops, can't get more pictures for now."), details: e.message });
			});
		}
		else {
			this.setState({ shownPics: this.state.shownPics + 1 });
			PubSub.publish("UI.MESSAGE.BASIC", { type: "info", message: I18n.t("We don't have more pictures available around this feature") });
		}
	}

	/**
	 * Edit the current feature status, and start retrieving next one
	 * @private
	 */
	_review(status, options) {
		options = options || {};

		if(status !== "skipped" && this.refs.map && this.refs.map.isEditingGeometry()) {
			PubSub.publish("UI.MESSAGE.BASIC", { type: "alert", message: I18n.t("You started editing this feature geometry, please valid or cancel your edits using map buttons before answering the question."), duration: 5000 });
			return false;
		}

		options.externalEditConfirmed = options.externalEditConfirmed || (!this.state.currentAnswer && this.state.hideConfirmEdit);

		//Update feature in DB
		const updateDB = (upData) => {
			PubSub.publish("UI.MESSAGE.WAIT", { message: I18n.t("Updating Pic4Review mission") });

			upData = upData || {};
			this.state.feature.status = status;

			API.UpdateMissionFeature(
				this.props.mission.id,
				this.state.feature,
				this.props.user.name,
				this.props.user.id
			)
			.then(() => {
				PubSub.publish("UI.MESSAGE.WAITDONE");
				if(upData.changesetId) {
					this._setChangesetId(upData.changesetId);
				}

				if(status === "reviewed") {
					this.setState({ count: this.state.count+1, openConfirmEdit: false, openConfirmDuplicate: false });
				}

				this._next(status === "skipped");
			})
			.catch(e => {
				PubSub.publish("UI.MESSAGE.WAITDONE");
				console.error(e);
				PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Can't update feature, please retry"), details: e.message });
			});
		};

		//If editor activated
		if(status === "reviewed" && !options.externalEditConfirmed) {
			// If both answer and feature are valid
			if(
				this.state.currentAnswer
				&& this.props.mission.options && this.props.mission.options.data
				&& this.props.mission.options.data.options && this.props.mission.options.data.options.editors
				&& this.props.mission.options.data.options.editors.type !== "disabled"
				&& this.state.feature && this.state.feature.properties
			) {
				// Editing existing OSM feature
				if(this.props.mission.options.data.options.editors.type !== "importer" && this.state.feature.properties.id) {
					//Update feature
					PubSub.publish("UI.MESSAGE.WAIT", { message: I18n.t("Updating feature in OpenStreetMap") });

					API.UpdateOSMFeature(
						this.state.feature.properties.id,
						this._getTagsToApply(),
						this.props.mission.description.short + " (" + this.props.mission.area.name + ")",
						this._getChangesetId(),
						this.state.newFeatureGeometry ? this.state.newFeatureGeometry.geometry : null
					)
					.then(res => {
						updateDB(res);
					})
					.catch(e => {
						PubSub.publish("UI.MESSAGE.WAITDONE");
						console.error(e);
						PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Can't upload feature to OSM, please retry"), details: e.message });
					});
				}
				// Importing new feature in OSM
				else if(this.props.mission.options.data.options.editors.type === "importer" && this.state.currentAnswer.validated) {
					// Ask for user confirmation if similar features exist around
					if(!options.confirmDuplicate && this.state.similar && this.state.similar.features && this.state.similar.features.length > 0) {
						this.setState({ openConfirmDuplicate: true });
					}
					//Create feature
					else {
						PubSub.publish("UI.MESSAGE.WAIT", { message: I18n.t("Creating feature in OpenStreetMap") });

						API.CreateOSMFeature(
							this.state.newFeatureGeometry ? this.state.newFeatureGeometry.geometry : this.state.feature.geometry,
							this._getTagsToApply({}, this.state.feature.properties),
							this.props.mission.description.short + " (" + this.props.mission.area.name + ")",
							this._getChangesetId()
						)
						.then(res => {
							updateDB(res);
						})
						.catch(e => {
							PubSub.publish("UI.MESSAGE.WAITDONE");
							console.error(e);
							PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Can't upload feature to OSM, please retry"), details: e.message });
						});
					}
				}
				else if(
					this.props.mission.options.data.options.editors.type === "importer"
					&& this.state.currentAnswer.mergeWith
					&& this.state.currentAnswer.mergeWith.properties
					&& this.state.currentAnswer.mergeWith.properties.id
				) {
					//Update feature
					PubSub.publish("UI.MESSAGE.WAIT", { message: I18n.t("Updating feature in OpenStreetMap") });

					const merged = this.state.currentAnswer.mergeWith;

					API.UpdateOSMFeature(
						merged.properties.id,
						this._getTagsToApplyForImporter(merged),
						this.props.mission.description.short + " (" + this.props.mission.area.name + ")",
						this._getChangesetId(),
						this.state.newFeatureGeometry && merged.geometry.type === "Point" ? this.state.newFeatureGeometry.geometry : null
					)
					.then(res => {
						updateDB(res);
					})
					.catch(e => {
						PubSub.publish("UI.MESSAGE.WAITDONE");
						console.error(e);
						PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Can't upload feature to OSM, please retry"), details: e.message });
					});
				}
				// Only skip feature if something missing
				else {
					updateDB();
				}
			}
			else {
				this.setState({ openConfirmEdit: true });
			}
		}
		else {
			updateDB();
		}
	}

	_closeFirstHelp() {
		sessionStorage.setItem(NOT_FIRST_REVIEW, "1");
		this.setState({ firstReview: false });
	}

	/**
	 * Retrieve last changeset ID for this mission from sessionStorage
	 * @private
	 */
	_getChangesetId() {
		return sessionStorage.getItem("cid_"+this.props.match.params.mid);
	}

	/**
	 * Update changeset ID for this mission
	 * @private
	 */
	_setChangesetId(changesetId) {
		sessionStorage.setItem("cid_"+this.props.match.params.mid, changesetId);
	}

	/**
	 * Get the tags to apply on the feature according to feature to merge with + current picture
	 * @private
	 */
	_getTagsToApplyForImporter(merged) {
		let tags = Object.assign({}, this.state.feature.properties);

		//Delete Osmose properties
		delete tags.id;
		delete tags.error_id;
		delete tags.title;
		delete tags.details;

		return this._getTagsToApply(merged.properties, tags);
	}

	/**
	 * Get the tags to apply on the feature according to selected answer + current picture
	 * @private
	 */
	_getTagsToApply(baseTags, newTags) {
		baseTags = baseTags || this.state.feature.properties;
		newTags = newTags || this.state.currentAnswer.tags;
		let tags = Object.assign({}, newTags);

		/*
		 * Add tags related to picture
		 */

		let picId = null;
		let changePic = false;

		//Explicitly marked picture
		if(this.state.markedPictureId !== -1) {
			picId = this.state.markedPictureId;
			changePic = true;
		}
		//Click on picture details
		else if(this.state.clickedPictureId !== null && this.state.clickedPictureId < 0) {
			picId = null;
		}
		//Single picture
		else if(this.state.pictures.length === 1) {
			picId = 0;
		}
		//Picture + click is same
		else if(this.state.currentPictureId === this.state.clickedPictureId || (this.state.currentPictureId !== null && this.state.clickedPictureId === null)) {
			picId = this.state.currentPictureId;
		}
		//Picture centered + clicked is not same
		else {
			console.log("Not sure which picture is the best between", this.state.currentPictureId, "and", this.state.clickedPictureId);
		}

		//Add tags
		if(picId !== null) {
			const pic = this.state.pictures[picId];

			if(pic && pic.osmTags) {
				//If not forcing pic change, only set data if no image is defined
				if(!changePic) {
					Object.entries(pic.osmTags).forEach(e => {
						if(!baseTags[e[0]]) {
							tags[e[0]] = e[1];
						}
					});
				}
				//If forcing, then always change pic tags
				else {
					tags = Object.assign(tags, pic.osmTags);
				}

				const surveyDateObj = new Date(pic.date);
				const surveyDate = surveyDateObj.toISOString().split("T")[0];

				if(baseTags["survey:date"]) {
					try {
						const existingDate = new Date(baseTags["survey:date"]);

						if(existingDate < surveyDateObj) {
							tags["survey:date"] = surveyDate;
						}
					}
					catch(e) {
						tags["survey:date"] = surveyDate;
					}
				}
				else {
					tags["survey:date"] = surveyDate;
				}
			}
		}

		// Remove empty/invalid tags
		Object.keys(tags).forEach(k => {
			if(typeof tags[k] === "number") {
				tags[k] = tags[k].toString();
			}
			if(tags[k] === null || tags[k] === undefined || typeof tags[k] !== "string" || tags[k].trim().length === 0) {
				delete tags[k];
			}
		});

		return tags;
	}

	_hasEditor() {
		return this.state.feature
			&& this.state.feature.properties
			&& this.props.mission.options && this.props.mission.options.data
			&& this.props.mission.options.data.options && this.props.mission.options.data.options.editors
			&& this.props.mission.options.data.options.editors.type !== "disabled";
	}

	render() {
		if(!this.state.feature) {
			const style = Object.assign({}, this.props.style, { textAlign: "center" });
			return <div style={style}></div>;
		}
		else {
			const buttons = {
				prev: { icon: <SkipPrevious />, label: I18n.t("Previous"), tip: I18n.t("Go back to the previously reviewed feature"), click: this._prev.bind(this) },
				next: { icon: <SkipForward />, label: I18n.t("Skip"), tip: I18n.t("Skip this feature if you are not sure of what to do"), click: () => this._review("skipped") },
				edit: { icon: <Pencil />, label: I18n.t("Edit"), tip: I18n.t("Edit this feature with an OpenStreetMap editor"), click: e => this.setState({ openEditors: true, editorsAnchor: e.currentTarget }) },
				done: { color: "primary", icon: <Check />, label: I18n.t("Validate"), tip: I18n.t("Mark the feature as done when you have edited OpenStreetMap"), click: () => this._review("reviewed") }
			};

			const createBtn = (btn, s, text) => {
				const b = buttons[btn];
				text = text === undefined ? true : text;
				return <Grid item xs={s} key={btn}>
					<Tooltip title={b.tip} style={{width:"100%"}}>
						<Button variant="raised" color={b.color || "default"} onClick={b.click} style={{width:"100%", height:"100%" }}>
							{b.icon}
							{text && b.label}
						</Button>
					</Tooltip>
				</Grid>;
			};

			const map = <Map
							ref="map"
							feature={this.state.feature}
							geometry={this.state.newFeatureGeometry ? this.state.newFeatureGeometry.geometry : this.state.feature.geometry}
							similarFeatures={this.state.similar}
							pictures={this.state.pictures ? this.state.pictures.slice(0, this.state.shownPics) : []}
							currentPictureId={this.state.currentPictureId}
							onPicClicked={id => this.setState({ currentPictureId: id })}
							onFeatureClicked={() => this.setState({ bottomNav: ["xs","sm"].includes(this.props.width) ? 2 : 1 })}
							style={{height: "100%"}}
							layers={this.props.mission.options.layers}
							zoom={this.state.mapZoom}
							onZoomChange={z => this.setState({ mapZoom: z })}
							baseLayer={this.state.mapBaseLayer}
							onBaseLayerChange={l => this.setState({ mapBaseLayer: l })}
							featureMove={this.state.featureCanMove}
							onFeatureMove={g => { this.setState({ newFeatureGeometry: g })}}
							width={this.props.width}
						/>;

			const counter = <Statistics count={this.state.count} data={this.state.stats} style={{marginTop: 10}} />;

			const question = <Question
							data={this._hasEditor() && this.props.mission.options.data.options.editors}
							feature={this.state.feature}
							similarFeatures={this.state.similar}
							onOpenEditor={e => this.setState({ openEditors: true, editorsAnchor: e.currentTarget })}
							onAnswerChange={d => { this.setState({ currentAnswer: d }, () => this._review("reviewed")); }}
							skip={buttons.next}
						/>;

			const gallery = this.state.pictures && <Gallery
							pictures={this.state.pictures.slice(0, this.state.shownPics)}
							currentPictureId={this.state.currentPictureId}
							onPicSelected={id => this.setState({ clickedPictureId: id })}
							onCenterPicChanged={id => this.setState({ currentPictureId: id })}
							onPicDetails={id => this.setState({ clickedPictureId: -1-id })}
							onShowMore={() => this._loadMorePics()}
							showMore={this.state.shownPics <= this.state.pictures.length && (this.state.feature.geometry.type === "Point" || !this.state.noMorePics)}
							onPicMarked={id => this.setState({ markedPictureId: id })}
							onPicUnmarked={id => this.setState({ markedPictureId: -1 })}
							picMarked={this.state.markedPictureId}
							missionId={this.props.mission.id}
						/>;

			return <div style={this.props.style} ref="container" className="p4r-review">
				<Grid
					container
					spacing={8}
					hidden={{smDown: true}}
					style={{position: "absolute", width: "unset", margin: 0, top: 127, left: 10, right: 10, bottom: 10}}
				>
					<Grid item sm={4} xl={4} style={{height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between"}}>
						<div style={{flex: 2, maxHeight: "45%", overflowY: "auto", display: "flex", flexDirection: "column", justifyContent: "center", overflowX: "hidden"}}>
							<div style={{minHeight: 0}}>
								{question}

								<Grid container spacing={8} style={{marginTop: 10, marginBottom: 20}}>
									{createBtn("prev", 4)}
									{createBtn(this._hasEditor() ? "edit" : "done", 4)}
									{createBtn("next", 4)}
								</Grid>
							</div>
						</div>

						<div style={{flex: 3, maxHeight: "45%", overflowY: "auto", padding: (this.state.bottomNav === 0 ? 0: "0 5px")}}>
							{this.state.bottomNav === 0 && map}

							{this.state.bottomNav === 1 && <Markdown source={this.props.mission.description.full} />}
							{this.state.bottomNav === 1 && <Tags feature={{properties: this.state.feature.properties}} />}
							{this.state.bottomNav === 1 && counter}
						</div>

						<BottomNavigation
							value={this.state.bottomNav}
							onChange={(ev, val) => this.setState({ bottomNav: val })}
							showLabels
						>
							<BottomNavigationAction label={I18n.t("Map")} icon={<MapMarkerRadius />} />
							<BottomNavigationAction label={I18n.t("Details")} icon={<Information />} />
						</BottomNavigation>
					</Grid>

					<Grid item sm={8} xl={8} style={{height: "100%", display: "flex", flexDirection: "column"}}>
						{gallery}
					</Grid>
				</Grid>

				<Hidden mdUp>
					<div style={{position: "absolute", display: "flex", flexDirection: "column", top: this.props.width === "xs" ? 57 : 65, bottom: 0, right: 0, left: 0}}>
						<div style={{flex: 2, minHeight: this.props.width === "xs" ? "50%" : "40%", maxHeight: this.props.width === "xs" ? "80%" : "70%", overflowY: "auto"}}>
							{this.state.bottomNav === 0 && map}
							{this.state.bottomNav === 1 && gallery}
							{this.state.bottomNav === 2 &&
								<div style={{margin: 10}}>
									<Markdown source={this.props.mission.description.full} />
									<Tags feature={{properties: this.state.feature.properties}} />
								</div>
							}
						</div>

						<BottomNavigation
							value={this.state.bottomNav}
							onChange={(ev, val) => this.setState({ bottomNav: val })}
							showLabels
						>
							<BottomNavigationAction label={I18n.t("Map")} icon={<MapMarkerRadius />} />
							<BottomNavigationAction label={I18n.t("Pictures")} icon={<ImageMultiple />} />
							<BottomNavigationAction label={I18n.t("Details")} icon={<Information />} />
						</BottomNavigation>

						<div style={{overflowY: "auto", padding: 10, paddingTop: 0}}>
							{question}
						</div>
					</div>
				</Hidden>

				<First open={this.state.firstReview} mid={this.props.mission.id} onClose={() => this._closeFirstHelp()} />

				<Editors
					open={this.state.openEditors}
					feature={this.state.feature}
					anchor={this.state.editorsAnchor}
					mission={this.props.mission}
					onClose={() => this.setState({openEditors: false})}
				/>

				<ConfirmEdit
					open={!this.state.hideConfirmEdit && this.state.openConfirmEdit}
					onClose={() => this.setState({ openConfirmEdit: false })}
					onValid={nomore => { this.setState({ hideConfirmEdit: nomore }, () => this._review("reviewed", { externalEditConfirmed: true })); }}
					hasEditor={this._hasEditor()}
				/>

				<ConfirmDuplicate
					open={!this.state.hideConfirmDuplicate && this.state.openConfirmDuplicate}
					onClose={() => this.setState({ openConfirmDuplicate: false })}
					onValid={nomore => { this.setState({ hideConfirmDuplicate: nomore }, () => this._review("reviewed", { confirmDuplicate: true })); }}
				/>
			</div>;
		}
	}

	componentWillMount() {
		this._next();

		if(sessionStorage.getItem(NOT_FIRST_REVIEW) === null) {
			this.setState({ firstReview: true });
		}
	}

	componentWillUpdate(nextProps, nextState) {
		const goMessages = {
			1: { msg: I18n.t("You made you first edit, great !"), sml: "😉" },
			10: { msg: I18n.t("10 edits, keep going !"), sml: "😃" },
			30: { msg: I18n.t("30 edits, not bad"), sml: "👍" },
			42: { msg: I18n.t("42 edits, the answer !"), sml: "😜" },
			60: { msg: I18n.t("60 edit, you're a star !"), sml: "✨" },
			80: { msg: I18n.t("80 edits, not far from 100 !"), sml: "😃" },
			100: { msg: I18n.t("You did it, 100 edits ! Thank you"), sml: "😘" },
			110: { msg: I18n.t("Keep going on ! Now you're a Pic4Review rock star, I will let you alone (for now)"), sml: "😏" }
		};

		if(this.state.count < nextState.count && goMessages[nextState.count]) {
			PubSub.publish("UI.MESSAGE.BASIC", { type: "info", message: goMessages[nextState.count].msg, smiley: goMessages[nextState.count].sml, duration: 6000 });
		}

		sessionStorage.setItem(EDITS_COUNT+"_"+this.props.mission.id, nextState.count);
	}
}

export default withStyles(styles)(withWidth()(withRouter(MissionReviewComponent)));
