import GridList from 'material-ui/GridList';
import { findDOMNode } from 'react-dom';

class HorizontalScrollGridList extends GridList {
	componentDidMount() {
		super.componentDidMount();
		
		//Horizontal scroll
		const that = findDOMNode(this);
		const speed = this.props.speed || 1;
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

export default HorizontalScrollGridList;
