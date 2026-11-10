import React, { Component } from 'react';
import { ContentDuplicate, Delete, Eye, EyeOff, Information, Pencil, Star, StarOutline } from 'mdi-material-ui';
import Button from 'material-ui/Button';
import Dialog, { DialogActions, DialogContent, DialogContentText, DialogTitle } from 'material-ui/Dialog';
import { HorizontalBar } from 'react-chartjs-2';
import IconButton from 'material-ui/IconButton';
import { Link } from 'react-router-dom';
import Paper from 'material-ui/Paper';
import Table, { TableBody, TableCell, TableFooter, TableHead, TablePagination, TableRow, TableSortLabel } from 'material-ui/Table';
import Tooltip from 'material-ui/Tooltip';

class MissionsTableComponent extends Component {
	constructor() {
		super();
		
		this.state = {
			confirmDelete: null
		};
	}
	
	render() {
		const style = { margin: 0, padding: 0 };
		const styleCentered = Object.assign({}, style, { textAlign: "center" });
		const styleId = Object.assign({}, styleCentered, { paddingRight: 10, paddingLeft: 10 });
		const styleProgress = Object.assign({}, styleCentered, { whiteSpace: "nowrap" });
		
		return <Paper>
			<Table>
				<TableHead>
					<TableRow>
						<TableCell style={styleId}>#</TableCell>
						<TableCell style={style}>{I18n.t("Name")}</TableCell>
						<TableCell style={styleCentered}>{I18n.t("Completion")}</TableCell>
						<TableCell style={styleCentered}>{I18n.t("Actions")}</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
				{this.props.missions.map(m => {
					const completion = (m.options && m.options.stats) ? Math.floor(100 - (m.options.stats.new / m.options.stats.total)*100) : 0;
					const backcolor = m.status === "online" ? (completion < 100 ? "white" : "#FFECB3") : "#E0E0E0";
					
					//Prepare dataset
					const statusesKeys = (m.options && m.options.stats) ? Object.keys(m.options.stats).filter(s => STATUSES[s]) : [];
					statusesKeys.sort((a, b) => STATUSES[b].priority - STATUSES[a].priority);
					
					return <TableRow key={m.id} className="missions-table-row" style={{backgroundColor: backcolor}}>
						<TableCell style={styleId}>{m.id}</TableCell>
						<TableCell style={style}>
							<Link to={'/mission/'+m.id} title={I18n.t("See mission details")}>
								{m.description.short}<br />{m.area.name}
							</Link>
						</TableCell>
						<TableCell style={styleProgress}>
							{m.options && m.options.stats && m.options.stats.total && I18n.t("%{count} features", { count: m.options.stats.total })}
							{m.options && m.options.stats && m.options.stats.total && <br />}
							{statusesKeys.map(s => {
								const mylength = Math.round(m.options.stats[s]*100/m.options.stats.total/2)+"%";
								return <span key={s} title={STATUSES[s].name+" : "+m.options.stats[s]} style={{backgroundColor: STATUSES[s].color, height: 15, paddingLeft: mylength, paddingRight: mylength }}> </span>;
							})}
						</TableCell>
						<TableCell style={styleCentered}>
							<Tooltip title={I18n.t("Duplicate mission")}>
								<IconButton
									component={Link}
									to={'/mission/new/'+m.id}
									target="_blank"
								>
									<ContentDuplicate />
								</IconButton>
							</Tooltip>
							<Tooltip title={I18n.t("Edit mission")}>
								<IconButton
									component={Link}
									to={'/mission/'+m.id+'/edit'}
									target="_blank"
								>
									<Pencil />
								</IconButton>
							</Tooltip>
							{m.status === "online" &&
								<Tooltip title={I18n.t("Hide mission from public list")}>
									<IconButton onClick={() => this.props.onChangeMissionStatus(m, "canceled")}>
										<Eye />
									</IconButton>
								</Tooltip>
							}
							{m.status !== "online" &&
								<Tooltip title={I18n.t("Show mission in public list")}>
									<IconButton onClick={() => this.props.onChangeMissionStatus(m, "online")}>
										<EyeOff />
									</IconButton>
								</Tooltip>
							}
							{this.props.admin && m.options.template &&
								<Tooltip title={I18n.t("Remove this mission from template list")}>
									<IconButton onClick={() => this.props.onSetTemplate(m, false)}>
										<Star />
									</IconButton>
								</Tooltip>
							}
							{this.props.admin && !m.options.template &&
								<Tooltip title={I18n.t("Set this mission as a template")}>
									<IconButton onClick={() => this.props.onSetTemplate(m, true)}>
										<StarOutline />
									</IconButton>
								</Tooltip>
							}
							<Tooltip title={I18n.t("Permanently delete this mission")}>
								<IconButton onClick={() => this.setState({ confirmDelete: m })}>
									<Delete />
								</IconButton>
							</Tooltip>
						</TableCell>
					</TableRow>;
				})}
				</TableBody>
			</Table>
			
			<Dialog
				open={this.state.confirmDelete !== null}
				onClose={() => this.setState({ confirmDelete: null })}
			>
				<DialogTitle>{I18n.t("Delete this mission ?")}</DialogTitle>
				<DialogContent>
					<DialogContentText>
						{I18n.t("Deleting a mission makes it unaccessible for everyone including you. This action cannot be reverted. If you just want to hide the mission to users, use instead the \"Hide\" button (eye symbol).")}
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={() => this.setState({ confirmDelete: null })}
						color="primary"
					>
						{I18n.t("Cancel")}
					</Button>
					<Button
						onClick={() => {
							this.props.onChangeMissionStatus(this.state.confirmDelete, "deleted");
							this.setState({ confirmDelete: null });
						}}
						color="secondary"
					>
						{I18n.t("Delete the mission")}
					</Button>
				</DialogActions>
			</Dialog>
		</Paper>;
	}
}

export default MissionsTableComponent;
