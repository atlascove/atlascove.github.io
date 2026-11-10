/*
 * Modified from MissionReviewGallery3Component of Pic4Review by Adrien Pavie.
 * Copyright Pic4Review contributors, AGPL-3.0-or-later.
 *
 * Fotoshi is the sole imagery provider in this fork. The original gallery,
 * thumbnails and image navigation stay; Mapillary/Panoramax/Flickr-specific
 * embeds and additional picture fetchers have been removed.
 */
import React, { Component } from 'react';
import withWidth from 'material-ui/utils/withWidth';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';

class MissionReviewGallery3Component extends Component {
  render() {
    const photos = this.props.pictures || [];
    if (!photos.length) {
      return <div className="f2o-blank">No Fotoshi photographs found for this place.</div>;
    }
    const items = photos.map((p, index) => ({
      original: p.pictureUrl,
      thumbnail: p.thumbUrl || p.pictureUrl,
      id: index,
      picture: p
    }));

    return <ImageGallery
      key={this.props.missionId + ':' + photos.length}
      items={items}
      startIndex={Math.max(0, Math.min(Number(this.props.currentPictureId)||0,items.length-1))}
      infinite={false}
      lazyLoad={true}
      showPlayButton={false}
      showFullscreenButton={false}
      showThumbnails={items.length>1}
      thumbnailPosition="top"
      showBullets={false}
      showIndex={false}
      slideDuration={0}
      useTranslate3D={false}
      onSlide={id=>this.props.onCenterPicChanged && this.props.onCenterPicChanged(id)}
      renderItem={item=><div className="image-gallery-image" style={{height:'100%',position:'relative'}}>
        <img src={item.original} alt="Fotoshi photographic evidence"
          onError={e=>{if(e.target.src!==item.thumbnail)e.target.src=item.thumbnail;}}
          style={{width:'100%',height:'100%',objectFit:'contain'}} />
        <div className="image-gallery-description"
          style={{position:'absolute',top:0,bottom:'auto',width:'100%',background:'rgba(0,0,0,.53)',color:'#fff',textAlign:'center',padding:7,fontSize:11}}>
          {item.picture.date ? String(item.picture.date).slice(0,10)+'  ·  ':''}
          {item.picture.author}  ·  Fotoshi
          <a href={item.picture.detailsUrl} target="_blank" rel="noopener noreferrer"
            style={{float:'right',color:'#fff',marginRight:8}}>View photo ↗</a>
        </div>
      </div>}
    />;
  }
}
export default withWidth()(MissionReviewGallery3Component);
