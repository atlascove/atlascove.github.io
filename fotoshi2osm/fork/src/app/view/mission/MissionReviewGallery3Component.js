import React, { Component } from 'react';
import "react-image-gallery/styles/css/image-gallery.css";
import withWidth from 'material-ui/utils/withWidth';
import ImageGallery from 'react-image-gallery';
import { ArrowLeft, MapMarkerRadius, MagnifyPlusOutline, PlusCircle, Star, StarOutline, TagHeart } from 'mdi-material-ui';
import IconButton from 'material-ui/IconButton';
import { Link } from 'react-router-dom';
import Magnifier from 'react-magnifier';
import Tooltip from 'material-ui/Tooltip';

/**
 * Mission review gallery component displays a serie of pictures for a given feature.
 */
class MissionReviewGallery3Component extends Component {
	constructor() {
		super();
		this.centerPic = 0;
	}

	_isMobile() {
		return ["xs","sm"].includes(this.props.width);
	}

	_mapillaryEmbedUrl(detailsUrl) {
		try {
			const pKey = new URL(detailsUrl).searchParams.get("pKey");
			return pKey ? "https://www.mapillary.com/embed?image_key=" + pKey : null;
		} catch(e) {
			return null;
		}
	}

	_panoramaxIds(detailsUrl) {
		try {
			const url = new URL(detailsUrl);
			const pictureId = url.searchParams.get("pic");
			const sequenceId = url.searchParams.get("seq");
			return sequenceId && pictureId ? { sequenceId, pictureId } : null;
		} catch(e) {
			return null;
		}
	}

	render() {
		if(this.props.pictures && this.props.pictures.length > 0) {
			const allowUpdateAssociation = this.props.pictures.filter(p => p.featured).length > 0;
			const images = this.props.pictures.map((p,i) => Object.assign({}, p, { id: i, original: p.pictureUrl, thumbnail: p.thumbUrl || p.pictureUrl }));
			if(this.props.showMore) { images.push({ more: true, thumbnail: "./images/more.png" }); }

			return <ImageGallery
				ref="gallery"
				items={images}
				infinite={false}
				lazyLoad={true}
				showPlayButton={false}
				showFullscreenButton={false}
				showThumbnails={!this._isMobile() && (this.props.pictures.length > 1 || this.props.showMore)}
				thumbnailPosition="top"
				showBullets={this._isMobile() && this.props.pictures.length > 1}
				useBrowserFullscreen={false}
				slideDuration={0}
				useTranslate3D={false}
				disableThumbnailScroll={true}
				startIndex={parseInt(this.props.currentPictureId)}
				onThumbnailClick={(ev, id) => {
					this._preventScroll = true;
					if(this.props.showMore && id === images.length - 1) {
						this.props.onShowMore();
					}
				}}
				renderItem={item => {
					return item.more ?
					<div
						style={{width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column"}}
						onClick={() => this.props.onShowMore()}
					>
						<PlusCircle style={{height: 128, width: 128, color: "#3849aa"}}/>
						<p>{I18n.t("Click to load more pictures")}</p>
					</div>
					: <div className='image-gallery-image'>
						<span className='image-gallery-description'>
							<span>
								{this._isMobile() &&
									<Tooltip title={I18n.t("Go back to mission description")}>
										<IconButton
											style={{ color: "white" }}
											component={Link}
											to={'/mission/'+this.props.missionId}
										>
											<ArrowLeft />
										</IconButton>
									</Tooltip>
								}

								{item.featured &&
									<Tooltip title={I18n.t("This picture is already associated to this feature")}>
										<IconButton style={{ color: "white" }}>
											<TagHeart />
										</IconButton>
									</Tooltip>
								}

								{allowUpdateAssociation && !item.featured && this.props.picMarked !== item.id &&
									<Tooltip title={I18n.t("Mark this picture as best one")}>
										<IconButton
											style={{ color: "white" }}
											onClick={() => this.props.onPicMarked(item.id)}
										>
											<StarOutline />
										</IconButton>
									</Tooltip>
								}

								{allowUpdateAssociation && !item.featured && this.props.picMarked === item.id &&
									<Tooltip title={I18n.t("Unmark this picture")}>
										<IconButton
											style={{ color: "white" }}
											onClick={() => this.props.onPicUnmarked(item.id)}
										>
											<Star />
										</IconButton>
									</Tooltip>
								}
							</span>

							<span>{(new Date(item.date)).toLocaleDateString() + " - " + item.author + " - " + item.provider}</span>

							<span>
								{!this._isMobile() &&
									<Tooltip title={I18n.t("Picture details (and other pictures around)")}>
										<IconButton
											href={item.detailsUrl}
											target="_blank"
											style={{ color: "white" }}
											onClick={() => this.props.onPicDetails(item.id)}
										>
											<MapMarkerRadius />
										</IconButton>
									</Tooltip>
								}
								<Tooltip title={I18n.t("Zoom in (opens in new tab)")}>
									<IconButton
										href={item.pictureUrl}
										target="_blank"
										style={{ color: "white" }}
										onClick={() => this.props.onPicSelected(item.id)}
									>
										<MagnifyPlusOutline />
									</IconButton>
								</Tooltip>
							</span>
						</span>

						{item.provider === "Mapillary" && this._mapillaryEmbedUrl(item.detailsUrl) ?
							<iframe
								src={this._mapillaryEmbedUrl(item.detailsUrl)}
								style={{width: "100%", height: "100%", minHeight: 400, border: "none"}}
								allowFullScreen
							/>
							: item.provider === "Panoramax" && this._panoramaxIds(item.detailsUrl) ?
							<pnx-photo-viewer
								endpoint="https://api.panoramax.xyz/api"
								sequence={this._panoramaxIds(item.detailsUrl).sequenceId}
								picture={this._panoramaxIds(item.detailsUrl).pictureId}
								style={{width: "100%", height: "100%", minHeight: 400, display: "block"}}
							/>
							: this._isMobile() ?
							<img
								src={item.thumbUrl || item.pictureUrl}
							/>
							:
							<Magnifier src={item.pictureUrl} zoomFactor={2.5} mgWidth={200} mgHeight={200} />
						}
					</div>;
				}}
			/>;
		}
		else {
			return <div></div>;
		}
	}

	componentDidMount() {
		// Find currently viewed picture
		if(this.props.pictures.length > 1) {
			this.timer = setInterval(() => {
				if(this.refs.gallery) {
					const currentPicId = this.refs.gallery.getCurrentIndex();

					// Notify parent of change
					if(currentPicId >= 0 && currentPicId < this.props.pictures.length && currentPicId !== this.centerPic) {
						this.centerPic = currentPicId;
						this.props.onCenterPicChanged(this.centerPic);

						// Scroll thumbnails
						if(!this._preventScroll && !this._isMobile()) {
							const container = this.refs.gallery._imageGallery.getElementsByClassName("image-gallery-thumbnails-container")[0];
							const currentThumb = container.children[currentPicId];
							container.scrollLeft = currentThumb.offsetLeft;
						}
					}

					this._preventScroll = false;
				}
			}, 100);
		}

		// Horizontal scroll for thumbnails
		if(!this._isMobile() && this.props.pictures.length > 1) {
			const that = this.refs.gallery._imageGallery.getElementsByClassName("image-gallery-thumbnails-container")[0];
			const speed = 2;
			const scrollHorizontally = e => {
				e = window.event || e;
				const delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
				that.scrollLeft -= (delta*40*speed); // Multiplied by 40
				e.preventDefault();
			};

			if(that.addEventListener) {
				that.addEventListener("mousewheel", scrollHorizontally, false);
				that.addEventListener("DOMMouseScroll", scrollHorizontally, false);
			}
			else {
				that.attachEvent("onmousewheel", scrollHorizontally);
			}
		}
	}

	componentDidUpdate() {
		if(this.refs.gallery && this.refs.gallery.getCurrentIndex() !== this.props.currentPictureId) {
			this.refs.gallery.slideToIndex(parseInt(this.props.currentPictureId));
			this.centerPic = this.props.currentPictureId;
		}
	}

	componentWillUnmount() {
		clearInterval(this.timer);
	}
}

export default withWidth()(MissionReviewGallery3Component);
