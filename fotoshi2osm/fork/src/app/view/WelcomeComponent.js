import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {
	AccountGroup, ArrowDownThick, ArrowRightThick, At, BookOpenVariant, ChartPie,
	CommentCheck, ImageMultiple, MapMarkerMultiple, Play, SourceBranch, TagMultiple, TagFaces
} from 'mdi-material-ui';
import API from '../ctrl/API';
import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import Hidden from 'material-ui/Hidden';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';
import P4C from 'pic4carto';
import Wait from './WaitComponent';

/**
 * Welcome component shows a synthetic description of what this tool is about.
 */
class WelcomeComponent extends Component {
	constructor() {
		super();
		this.state = {
			stats: null
		};
	}
	
	render() {
		const styleMain = Object.assign({}, this.props.style, {textAlign: "center", margin: "-15px -20px", width: "unset"});
		const styleBlock = { margin: 20 };
		const styleHeadblock = {
			height: 600, background: "url('images/background.jpg') no-repeat center center",
			display: "flex", flexDirection: "row", alignItems: "center", backgroundSize: "cover",
			marginBottom: 20, padding: 20
		};
		const stylePics = { height: 128, width: 128 };
		const styleStats = { height: 64, width: 64 };
		const styleIconButton = { marginRight: 5, marginBottom: 3 };
		
		const howItWorks = [
			{
				title: I18n.t("Check street pictures"),
				subtitle: I18n.t("And find the answer of a simple thematic question"),
				content: <ImageMultiple color="primary" style={stylePics} />
			},
			"arrow",
			{
				title: I18n.t("Answer and contribute"),
				subtitle: I18n.t("One click and you have contributed to OpenStreetMap !"),
				content: <CommentCheck color="primary" style={stylePics} />
			},
			"arrow",
			{
				title: I18n.t("Start again on other missions"),
				subtitle: I18n.t("Choose between several themes and areas worldwide"),
				content: <TagFaces color="primary" style={stylePics} />
			}
		];
		
		return <Grid container justify="center" style={styleMain}>
			<Grid item xs={12} style={styleHeadblock}>
				<div style={{width: "100%"}}>
					<img src="images/logo.512.png" style={{ height: 128 }} />
					
					<Typography variant="display2" style={{marginBottom: 10, color: "white", textShadow: "2px 2px 5px black"}}>{I18n.t("Improving OpenStreetMap has never been easier !")}</Typography>
					<Typography variant="title" style={{color: "white", textShadow: "2px 2px 5px black"}}>{I18n.t("Contribute to OpenStreetMap simply by looking at pictures of your city")}</Typography>
					
					<Button variant="raised" size="large" color="secondary" style={{marginTop: 20, paddingLeft: 15}} component={Link} to='/missions'>
						<Play style={styleIconButton} /> {I18n.t("Start now")}
					</Button>
				</div>
			</Grid>
			
			<Grid item xs={12} md={10} lg={8} xl={6}>
				<div style={styleBlock}>
					<Typography variant="display1" style={{marginBottom: 10}}>{I18n.t("How does it work ?")}</Typography>
					
					<div style={{padding: 20, marginBottom: 20}}>
						<Hidden smUp>
							<Grid container justify="center" alignItems="center">
								{howItWorks.map((hiw,i) => {
									if(hiw === "arrow") {
										return <Grid item xs={12} key={i}><ArrowDownThick color="primary" style={{width: 64, height: 64}} /></Grid>;
									}
									else {
										return <Grid item xs={12} key={i}>
											{hiw.content}
											<Typography variant="title">{hiw.title}</Typography>
											<Typography variant="body1">{hiw.subtitle}</Typography>
										</Grid>;
									}
								})}
							</Grid>
						</Hidden>
							
						<Hidden only="xs">
							<Grid container justify="center" alignItems="center">
								{howItWorks.map((hiw,i) => {
									if(hiw === "arrow") {
										return <Grid item sm={1} key={i}><ArrowRightThick color="primary" style={{width: 64, height: 64}} /></Grid>;
									}
									else {
										return <Grid item sm={3} key={i}>{hiw.content}</Grid>;
									}
								})}
							</Grid>
						</Hidden>
						<Hidden only="xs">
							<Grid container justify="center">
								{howItWorks.map((hiw,i) => {
									if(hiw === "arrow") {
										return <Grid item sm={1} key={i}></Grid>;
									}
									else {
										return <Grid item sm={3} key={i}>
											<Typography variant="title">{hiw.title}</Typography>
											<Typography variant="body1">{hiw.subtitle}</Typography>
										</Grid>;
									}
								})}
							</Grid>
						</Hidden>
					</div>
					
					<Typography variant="subheading">{I18n.t("Our free-licensed pictures come from various communities")}</Typography>
					{Object.entries((new P4C.PicturesManager())
						.getFetcherDetails())
						.filter(e => e[0] !== "flickr")
						.map(e => (
							<a href={e[1].homepageUrl} key={e[0]}><img src={e[1].logoUrl} title={e[1].name} alt={e[1].name} style={{ maxHeight: 48, maxWidth: 48, margin: "10px 20px", verticalAlign: "middle" }} /></a>
						))
					}
				</div>
			</Grid>
			
			<Grid item xs={12} style={{backgroundColor: "#eee"}}>
				<Grid container justify="center">
					<Grid item xs={12} lg={6} style={{display: "none"}}>
						<div style={styleBlock}>
							<Typography variant="display1" style={{marginBottom: 10}}>{I18n.t("Quick introduction")}</Typography>
							<div style={{height: 300, width: 400, color: "white", backgroundColor: "black", lineHeight:"300px", display: "inline-block"}}>
								Video (soon !)
							</div>
						</div>
					</Grid>
					<Grid item xs={12} md={10} lg={8} xl={6}>
						<div style={styleBlock}>
							<Typography variant="display1" style={{marginBottom: 10}}>{I18n.t("The Pic4Review community")}</Typography>
							
							{!this.state.stats && <Wait />}
							{this.state.stats &&
								<div style={{padding: "20px 10px", marginBottom: 10}}>
									<Grid container>
										<Grid item xs={12} sm={4}>
											<AccountGroup color="primary" style={styleStats} />
											<Typography variant="subheading">{I18n.t("%{val} users", { val: this.state.stats.users })}</Typography>
										</Grid>
										<Grid item xs={12} sm={4}>
											<TagMultiple color="primary" style={styleStats} />
											<Typography variant="subheading">{I18n.t("%{val} missions", { val: this.state.stats.missions })}</Typography>
										</Grid>
										<Grid item xs={12} sm={4}>
											<MapMarkerMultiple color="primary" style={styleStats} />
											<Typography variant="subheading">{I18n.t("%{val} edits", { val: this.state.stats.edits })}</Typography>
										</Grid>
									</Grid>
								</div>
							}
							
							<Button
								variant="flat"
								component={Link}
								to='/statistics'
								color="primary"
							>
								<ChartPie style={styleIconButton} /> {I18n.t("More statistics")}
							</Button>
						</div>
					</Grid>
				</Grid>
			</Grid>
			
			<Grid item xs={12} md={10} lg={8} xl={6}>
				<div style={styleBlock}>
					<Typography variant="display1" style={{marginBottom: 10}}>{I18n.t("About")}</Typography>
					<Typography variant="body1" style={{margin: 10}}>
						{I18n.t("Pic4Review is an easy editor for OpenStreetMap. It was created by Adrien Pavie in 2017, and is maintained by a community of contributors.")}
						<br />
						{I18n.t("It is free and open source software, everyone is welcome to help us and make it even better !")}
					</Typography>
					
					<Button
						variant="flat"
						color="primary"
						href="https://wiki.openstreetmap.org/wiki/Pic4Review"
					>
						<BookOpenVariant style={styleIconButton} /> {I18n.t("Documentation")}
					</Button>
					<Button
						variant="flat"
						color="primary"
						href="https://pavie.info/contact/"
					>
						<At style={styleIconButton} /> {I18n.t("Contact us")}
					</Button>
					<Button
						variant="flat"
						color="primary"
						href="https://framagit.org/Pic4Carto/Pic4Review"
					>
						<SourceBranch style={styleIconButton} /> {I18n.t("Code repository")}
					</Button>
				</div>
			</Grid>
		</Grid>;
	}
	
	componentDidMount() {
		PubSub.publish("UI.TITLE.RESET");
		
		API.GetInstanceStatistics()
		.then(stats => {
			this.setState({ stats: stats });
		});
	}
	
	componentWillUnmount() {
		clearInterval(this.timer);
	}
}

export default WelcomeComponent;
