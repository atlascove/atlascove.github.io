/*
 * Fotoshi2OSM fork of Pic4Review review interface.
 * Copyright 2026 Fotoshi contributors; original Pic4Review by Adrien Pavie.
 * AGPL-3.0-or-later. Original view modules retained in src/app/view/mission.
 */
import React, { Component } from 'react';
import { render } from 'react-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import createMuiTheme from 'material-ui/styles/createMuiTheme';
import Gallery from './view/mission/MissionReviewGallery3Component';
import ReviewMap from './view/mission/MissionReviewMapComponent';
import Question from './view/mission/MissionReviewQuestionComponent';
import 'leaflet/dist/leaflet.css';
import 'react-image-gallery/styles/css/image-gallery.css';

window.I18n = { t: (value) => String(value || '') };
window.PubSub = { publish: () => {}, subscribe: () => 0, unsubscribe: () => {} };

const FOTOSHI_API = 'https://api.fotoshi.com/v1/places';
const OSM_BASE = 'https://www.openstreetmap.org';
const CDN = 'https://cdn.fotoshi.com';
const REVIEW_EVENTS = '/fotoshi2osm/api/events';
const AREAS = {
  goldau: { name: 'Goldau', lat: 47.05, lon: 8.55, delta: 0.035 },
  lucerne: { name: 'Lucerne', lat: 47.05, lon: 8.306, delta: 0.035 },
  songdo: { name: 'Songdo', lat: 37.494, lon: 126.724, delta: 0.035 }
};
const MISSIONS = {
  unlinked: { title: 'Check possible new OSM places', type: 'unlinked' },
  fotoshi: { title: 'Fotoshi-created places', type: 'fotoshi' },
  overture: { title: 'Overture-sourced places', type: 'overture' },
  linked: { title: 'Verify existing OSM places', type: 'linked' },
  all: { title: 'Review all photographed places', type: 'all' }
};
const TILE_LAYERS = [
  {
    id: 'osm-standard', name: 'OSM map', type: 'tms',
    url: 'https://tile.openstreetmap.org/{zoom}/{x}/{y}.png',
    max_zoom: 19, attribution: { text: '© OpenStreetMap contributors', url: 'https://www.openstreetmap.org/copyright' }
  },
  {
    id: 'satellite-esri', name: 'Satellite (Esri)', type: 'tms',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{zoom}/{y}/{x}',
    max_zoom: 19, attribution: { text: 'Esri and imagery providers', url: 'https://www.esri.com/en-us/legal/terms/full-master-agreement' }
  }
];

const identity = (row) => {
  const osmType = String(row.osm_type || (row.images && row.images[0] && row.images[0].osm_type) || '');
  const osmId = String(row.osm_id || (row.images && row.images[0] && row.images[0].osm_id) || '');
  if (/^[nwr][1-9][0-9]*$/.test(osmId)) return osmId;
  if (/^[1-9][0-9]*$/.test(osmId) && /^[nwr]$/.test(osmType)) return osmType + osmId;
  return '';
};
const placeName = (row) => row.name || row.category || row.basic_category || 'Place';
const origin = (row) => row.created_source === 'user' ? 'fotoshi' : row.created_source === 'overture' ? 'overture' : String(row.created_source || 'unknown');
const displayImage = (p) => {
  const filename = p.filename || (p.oid ? p.oid + '.jpeg' : '');
  if (p.urls && p.urls.display) return CDN + p.urls.display;
  if (!filename) return '';
  const stem = filename.replace(/\.[^.]+$/, '');
  const ext = (filename.match(/\.[^.]+$/) || ['.jpeg'])[0];
  return CDN + '/images/' + stem + '-1280' + ext;
};
const thumbnailImage = (p) => p.urls && p.urls.thumbnail ? CDN + p.urls.thumbnail : CDN + '/thumbnails/' + (p.filename || p.oid + '.jpeg');

function adapt(row) {
  const point = row.geom && Number.isFinite(+row.geom.x) && Number.isFinite(+row.geom.y) ? [+row.geom.x,+row.geom.y] : null;
  if (!point) return null;
  const images = (row.images || []).filter(p => p.oid).map(p => ({
    pictureUrl: displayImage(p), thumbUrl: thumbnailImage(p),
    detailsUrl: p.share_url || (p.share_code ? 'https://fto.sh/i/' + p.share_code : 'https://fotoshi.com/explore'),
    date: p.capture_time || p.source_capture_time || p.upload_time || Date.now(),
    author: p.creator_name || p.username || 'Fotoshi contributor',
    provider: 'Fotoshi', direction: Number(p.compass_angle)||0,
    coordinates: [Number(p.photo_latitude != null ? p.photo_latitude : point[1]), Number(p.photo_longitude != null ? p.photo_longitude : point[0])],
    oid: p.oid
  })).filter(p => p.pictureUrl);
  return {
    fid: row.fid, name: placeName(row), osm: identity(row), source: origin(row),
    gers: row.overture_id || '', category: row.category || '',
    tags: Object.assign({}, row.tags_primary || {}, row.tags_secondary || {}),
    raw: row, images,
    feature: {
      id: row.fid,
      geometry: { type:'Point', coordinates: point },
      coordinates: [point[1],point[0]],
      pictures: images,
      properties: Object.assign({},row.tags_primary || {},row.tags_secondary || {}, { id: identity(row) ? ({n:'node',w:'way',r:'relation'}[identity(row)[0]] + '/' + identity(row).slice(1)) : null })
    }
  };
}
const included = (p, mission) =>
  mission === 'all' || (mission === 'linked' && !!p.osm) ||
  (mission === 'unlinked' && !p.osm) ||
  (mission === 'fotoshi' && !p.osm && p.source === 'fotoshi') ||
  (mission === 'overture' && !p.osm && p.source === 'overture');

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mission: 'unlinked', area: 'goldau', places: [], selected: 0, photo: 0,
      answer: null, osmTags: {}, osmError: '', loading: true, message: '',
      shareActivity: false, reviewed: {}, baseLayer: null
    };
    this.session = 'r' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    this.load = this.load.bind(this);
  }
  componentDidMount() {
    document.body.setAttribute('data-f2o-stage','mounted');
    this.load().catch(error => this.setState({loading:false,message:'Cannot load review: '+String(error && error.message || error)}));
  }
  get current() { return this.state.places[this.state.selected] || null; }
  async load() {
    document.body.setAttribute('data-f2o-stage','load-called');
    const area = AREAS[this.state.area], d = area.delta;
    const bbox = [area.lon-d,area.lat-d,area.lon+d,area.lat+d].map(n=>n.toFixed(6)).join(',');
    this.setState({ loading: true, message: '', osmTags: {}, osmError: '', answer:null,selected:0,photo:0 });
    try {
      document.body.setAttribute('data-f2o-stage','fetch-start');
      const url = FOTOSHI_API + '?bbox=' + encodeURIComponent(bbox) + '&limit=12';
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      let json;
      try {
        const response = await fetch(url, { signal: controller.signal });
        document.body.setAttribute('data-f2o-stage','fetch-response-'+response.status);
        if (!response.ok) throw Error('Fotoshi API: HTTP ' + response.status);
        json = await response.json();
        document.body.setAttribute('data-f2o-stage','parsed-json');
      } finally {
        clearTimeout(timeout);
      }
      const rows = Array.isArray(json) ? json : Array.isArray(json.data) ? json.data : [];
      const converted = rows.map(adapt).filter(Boolean).filter(p => included(p,this.state.mission));
      document.body.setAttribute('data-f2o-stage','converted-'+converted.length);
      this.setState({places:converted,loading:false,message:converted.length?'':'No matching photographed places in this area.'},()=>this.loadOsm());
    } catch(e) {
      document.body.setAttribute('data-f2o-stage','failed-'+String(e.message).slice(0,100));
      this.setState({loading:false,message:e.message,places:[]});
    }
  }
  async loadOsm() {
    const p = this.current;
    if (!p || !p.osm) { this.setState({osmTags:{},osmError:''}); return; }
    const fid = p.fid;
    try {
      const r = await fetch('/fotoshi2osm/api/osm/' + encodeURIComponent(p.osm));
      if (!r.ok) throw Error('OSM unavailable');
      const data = await r.json();
      if (this.current && this.current.fid === fid) this.setState({osmTags:data.tags||{},osmError:''});
    } catch(e) { if(this.current&&this.current.fid===fid) this.setState({osmTags:{},osmError:e.message}); }
  }
  next(step) {
    if (!this.state.places.length) return;
    const selected = Math.min(this.state.places.length-1,Math.max(0,this.state.selected+step));
    this.setState({selected,photo:0,answer:null,osmTags:{},osmError:''},()=>this.loadOsm());
  }
  async event(action) {
    const p=this.current;
    if (!this.state.shareActivity || !p) return;
    try {
      await fetch(REVIEW_EVENTS,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({
        fid:p.fid,osm:p.osm||null,origin:p.source,queue:this.state.mission,action,session:this.session
      }),keepalive:true});
    } catch(e) { /* Telemetry is optional and never blocks editing */ }
  }
  answer(a) {
    this.setState({answer:a});
    // Only an affirmative, human-confirmed candidate is recorded.
    if (a && a.label === 'Yes, review') {
      this.event(this.current && this.current.osm ? 'candidate_update':'candidate_add');
    }
  }
  edit() {
    const p=this.current;
    if(!p)return;
    this.event('open_editor');
    const id=p.osm;
    const url=id ? OSM_BASE+'/edit?editor=id&'+({n:'node',w:'way',r:'relation'}[id[0]])+'='+id.slice(1)
      : OSM_BASE+'/edit?editor=id#map=19/'+p.feature.coordinates[0]+'/'+p.feature.coordinates[1];
    window.open(url,'_blank','noopener,noreferrer');
  }
  changeMission(e) { this.setState({mission:e.target.value,selected:0},()=>this.load()); }
  changeArea(e) { this.setState({area:e.target.value,selected:0},()=>this.load()); }
  renderQuestion(p) {
    const question=p.osm ? 'Does this photo support an OSM update?' : 'Can you confirm this place exists here?';
    return <div>
      <Question key={p.fid} data={{
        type:'choice',question:question,
        answers:[
          {label:'Yes, review',tags:{}},
          {label:'Unsure',tags:{}},
          {label:'Not visible',tags:{}}
        ]
      }} feature={p.feature} onAnswerChange={a=>this.answer(a)} />
      <div className="f2o-tags">
        <strong>{p.name}</strong>{p.name !== p.category && <span style={{color:'#8b9196'}}> ({p.category})</span>}
        {p.osm && <div>OSM: {p.osm}</div>}
        {!p.osm && <div>No linked OSM ID. Check for duplicates before adding.</div>}
        {p.gers && <div>Overture: {p.gers.slice(0,12)}…</div>}
        <div style={{color:'#8b9196'}}>{p.source} origin. {p.images.length} photos.</div>
        {Object.keys(this.state.osmTags).length>0 && <details><summary>Current OSM tags</summary>{Object.entries(this.state.osmTags).slice(0,20).map(([k,v])=><div key={k}><code>{k}</code>: {v}</div>)}</details>}
      </div>
      <div className="f2o-actions">
        <button disabled={this.state.selected===0} onClick={()=>this.next(-1)}>◀ PREV</button>
        <button className="primary" onClick={()=>this.edit()}>✎ EDIT</button>
        <button onClick={()=>{this.event('skip');this.next(1)}}>SKIP ▶</button>
      </div>
    </div>;
  }
  render() {
    const p=this.current, area=AREAS[this.state.area], title=MISSIONS[this.state.mission].title;
    return <MuiThemeProvider theme={createMuiTheme({
      palette:{primary:{light:'#ff8257',main:'#f24e1e',dark:'#c73f12',contrastText:'#fff'}},
      typography:{fontFamily:'"Noto Sans", system-ui, sans-serif'}
    })}>
      <div className="f2o-root">
        <header className="f2o-head">
          <a href="https://fotoshi.com" className="f2o-brand" aria-label="fotoshi2OSM">
            <img src="images/logo.svg" alt="" aria-hidden="true"/>
            <img className="f2o-brand-word" src="images/wordmark.svg" alt="fotoshi2OSM"/>
          </a>
          <div className="f2o-head-center"><div className="f2o-title">{title}</div><div className="f2o-subtitle">{area.name}</div></div>
          <div className="f2o-head-right">
            <select value={this.state.mission} onChange={e=>this.changeMission(e)} aria-label="Review mission">
              {Object.entries(MISSIONS).map(([key,m])=><option key={key} value={key}>{m.title}</option>)}
            </select>
            <select value={this.state.area} onChange={e=>this.changeArea(e)} aria-label="Area">
              {Object.entries(AREAS).map(([key,a])=><option key={key} value={key}>{a.name}</option>)}
            </select>
          </div>
        </header>
        <main className="f2o-main">
          <section className="f2o-side">
            <div className="f2o-question">
              {this.state.loading ? <div className="f2o-state">Loading Fotoshi photos…</div>
               : p ? this.renderQuestion(p)
               : <div className="f2o-state">{this.state.message||'No photos available'}</div>}
            </div>
            <div className="f2o-smallmap">
              {p && <ReviewMap
                key={p.fid} feature={p.feature} geometry={p.feature.geometry}
                pictures={p.images} currentPictureId={this.state.photo}
                onPicClicked={photo=>this.setState({photo})}
                onFeatureClicked={()=>{}} onZoomChange={()=>{}} onBaseLayerChange={v=>this.setState({baseLayer:v})}
                zoom={17} baseLayer={this.state.baseLayer}
                layers={TILE_LAYERS} featureMove={false} style={{height:'100%'}} width="lg"
              />}
            </div>
          </section>
          <section className="f2o-photo">
            {p ? <Gallery
              key={p.fid} pictures={p.images} currentPictureId={this.state.photo}
              onCenterPicChanged={photo=>this.setState({photo})} onPicSelected={()=>{}}
              onPicDetails={()=>{}} onShowMore={()=>{}} showMore={false}
              onPicMarked={()=>{}} onPicUnmarked={()=>{}} picMarked={-1} missionId={this.state.mission}
            /> : <div className="f2o-blank">{this.state.loading?'Finding photos…':'No photographs to review'}</div>}
          </section>
        </main>
        <footer className="f2o-footer">
          <label title="Only anonymized review choices, no OSM edit is submitted."><input type="checkbox" checked={this.state.shareActivity} onChange={e=>this.setState({shareActivity:e.target.checked})}/> Share anonymous review choices</label>
          {'  ·  '}Fotoshi photos retain their individual licences. Map data © OSM contributors.
          {'  ·  '}Based on <a href="https://framagit.org/Pic4Carto/Pic4Review" target="_blank" rel="noopener noreferrer">Pic4Review by Adrien Pavie</a> (AGPL-3.0).
        </footer>
      </div>
    </MuiThemeProvider>;
  }
}
render(<App/>,document.getElementById('app'));
