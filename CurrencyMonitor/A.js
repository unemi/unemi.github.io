/*	Drawing a trend graph of Crypto Currency price in JPY
	Data is loaded by publick API by GMO coins.
	Assumed to be used in Japan.
	(c) Tatsuo Unemi, 2025. */
const endPt = "https://api.coin.z.com/public/v1/";
const XOffset = 80, YOffset = 30;
let canvas, gctx, dateInput,
	NPoints, LastDate, Currency, Refresh, LogScale,
	Sequence, IntervalID, DateUpdater;
function numFormat(x) {
	const n = Math.max(0, Math.floor(6 - Math.log10(x)));
	return new Intl.NumberFormat("en-US",
	{minimumFractionDigits:n, maximumFractionDigits:n, useGrouping:true})
		.format(x);
}
function dateStr(dat, d) {
	if (!d) d = "";
	const mm = dat.getMonth() + 1, dd = dat.getDate();
	return `${dat.getFullYear()}${d}${(mm>9)?mm:"0"+mm}${d}${(dd>9)?dd:"0"+dd}`;
}
function dateUpdate(date) {
	clearInterval(DateUpdater);
	const dtStr = dateStr(date, "-");
	if (dateInput.value == dateInput.max) dateInput.value = dtStr;
	if (LastDate == dateInput.max) LastDate = dtStr;
	dateInput.max = dtStr;
	date.setDate(date.getDate() + 1);
	DateUpdater = setInterval(dateUpdate, 24*3600*1000, date);
}
function setup() {
	dateInput = document.getElementById("date");
	canvas = document.getElementsByTagName("canvas")[0];
	gctx = canvas.getContext("2d");
	canvas.width = document.body.clientWidth;
	NPoints = Math.floor((canvas.width - XOffset) / 2);
	onresize = (ev)=>{
		canvas.width = document.body.clientWidth;
		drawData();
	};
	Refresh = document.getElementById("refresh").value;
	LogScale = document.getElementById("logScale").checked;
	const date = new Date();
	if (date.getHours() < 6) date.setDate(date.getDate() - 1);
	dateInput.max = dateInput.value = dateStr(date, "-");
	date.setDate(date.getDate() + 1);
	date.setHours(6,1,0,0);	// next six am
	DateUpdater = setInterval(dateUpdate, date.getTime() - Date.now(), date);
	getData();
}
function showTimeStamp(time) {
	document.getElementById("timeStamp").innerText = new Date(time);
}
function update() {
	if (LastDate != dateInput.max) {
		clearInterval(IntervalID);
		IntervalID = undefined;
	} else fetch(new Request(endPt + "ticker?symbol=" + Currency))
		.then((r)=>r.json()).then((obj)=> {
		if (obj.status != 0) throw new Error(JSON.stringify(obj));
		const item = obj.data[0],
			v = {x: new Date(item.timestamp).getTime(), y:item.last},
			lastIdx = Sequence.length - 1;
		if (Sequence[lastIdx].x - Sequence[lastIdx - 1].x
			< Sequence[1].x - Sequence[0].x) {
			if (v.y != Sequence[lastIdx].y) {
				Sequence.splice(lastIdx, 1, v);
				drawData();
			} else showTimeStamp(Sequence[lastIdx].x = v.x);
		} else {
			Sequence.splice(0, 1);
			Sequence.push(v);
			drawData();
		}
	});
}
function refreshChanged(newRate) {
	if (newRate == Refresh) return;
	Refresh = newRate;
	if (IntervalID) {
		clearInterval(IntervalID);
		IntervalID = setInterval(update, Refresh * 1000);
	}
}
function yScaleChanged(btn) {
	const newValue = btn.checked && btn.value == "log";
	if (newValue != LogScale) { LogScale = newValue; drawData(); }
}
function drawData() {
	gctx.fillStyle = "black";
	gctx.fillRect(0,0,canvas.width,canvas.height);
	let min=1e10, max=-1e10, vmin = 1e10, vmax = -1e10;
	for (const v of Sequence) {
		if (min > v.y) min = v.y; if (max < v.y) max = v.y;
		if (v.v) { if (vmin > v.v) vmin = v.v; if (vmax < v.v) vmax = v.v; }
	}
	const P = LogScale?
		(v, mx, mi)=>(Math.log(mx) - Math.log(v)) / (Math.log(mx) - Math.log(mi)) * h :
		(v, mx, mi)=>(mx - v) / (mx - mi) * h,
		Y = (v)=>P(v, max, min),
		V = (v)=>P(v, vmax, vmin);
	const len = Sequence.length;
	const w = canvas.width - XOffset, h = canvas.height - YOffset;
	// y tics
	let sp = (max - min) / 5;
	const colm = Math.pow(10., Math.floor(Math.log10(sp))), mts = sp / colm;
	sp = ((mts < 2)? 1 : (mts < 5)? 2 : 5) * colm;
	gctx.beginPath();
	gctx.font = "16px sans-serif";
	gctx.fillStyle = "white";
	gctx.textAlign = "right";
	gctx.textBaseline = "middle";
	for (let y = Math.ceil(min / sp) * sp; y < max; y += sp) {
		const yy = Y(y);
		gctx.moveTo(XOffset, yy); gctx.lineTo(canvas.width, yy);
		gctx.fillText(y, XOffset - 5, yy);
	}
	// x tics
	gctx.textBaseline = "top";
	const tmStart = Sequence[0].x, tmEnd = Sequence[len - 1].x;
	const prcs = document.getElementsByClassName("price"),
		prcStr = numFormat(Sequence[len - 1].y);
	for (let i = 0; i < prcs.length; i ++)
		prcs[i].innerText = prcStr;
	showTimeStamp(tmEnd);
	document.getElementById("monitor").innerText =
		 `min=${min}, max=${max}, max/min=${numFormat(max/min)}`
		 + `, vmax=${Math.round(vmax)}, vmin=${Math.round(vmin)}`;
	const dt = new Date(tmStart);
	sp = (tmEnd - tmStart) / 7;
	if (sp > 24*3600*1000) {
		dt.setDate(dt.getDate() + 1);
		dt.setHours(0,0,0,0);
		gctx.textAlign = "left";
		for (let t = 0; (t = dt.getTime()) < tmEnd;
			dt.setDate(dt.getDate() + 1)) {
			const x = (t - tmStart) / (tmEnd - tmStart) * w + XOffset;
			gctx.moveTo(x, 0); gctx.lineTo(x, h);
			gctx.fillText(`${dt.getMonth()+1}/${dt.getDate()}`, x, h + 5);
		}
	} else {
		let inc = Math.ceil(sp / (2.4*3600*1000));
		while (24 % inc > 0 && inc > 1) inc --;
		dt.setHours((Math.floor(dt.getHours() / inc) + 1) * inc, 0,0,0);
		gctx.textAlign = "center";
		let d = dt.getDate();
		for (let t = 0; (t = dt.getTime()) < tmEnd;
			dt.setHours(dt.getHours() + inc)) {
			const x = (t - tmStart) / (tmEnd - tmStart) * w + XOffset;
			gctx.moveTo(x, 0); gctx.lineTo(x, h);
			let s = "";
			if (d != dt.getDate())
				{ d = dt.getDate(); s = `${dt.getMonth()+1}/${d} `; }
			gctx.fillText(`${s}${dt.getHours()}:00`, x, h + 5);
		}
	}
	gctx.strokeStyle = "#08f";
	gctx.stroke();
	// volume graph
	if (Sequence[0].v) {
		gctx.beginPath();
		gctx.moveTo(XOffset, V(Sequence[0].v))
		for (let i = 1; i < len && Sequence[i].v; i ++)
			gctx.lineTo(i * w / (len - 1) + XOffset, V(Sequence[i].v));
		gctx.strokeStyle = "#d00";
		gctx.stroke();
	}
	// graph
	gctx.beginPath();
	gctx.moveTo(0, h); gctx.lineTo(canvas.width, h);
	gctx.moveTo(XOffset, 0); gctx.lineTo(XOffset, canvas.height);
	gctx.moveTo(XOffset, Y(Sequence[0].y))
	for (let i = 1; i < len; i ++)
		gctx.lineTo(i * w / (len - 1) + XOffset, Y(Sequence[i].y));
	gctx.strokeStyle = "white";
	gctx.stroke();
}
function getData() {
	const urlStr = endPt + "klines"
		+ "?symbol=" + (Currency = document.getElementById("symbol").value)
		+ "&interval=" + document.getElementById("interval").value
		+ "&date=", dat = new Date(LastDate = dateInput.value);
	try {
		const fetchData = (seq, resTm, cnt) => {
			if (seq.length < NPoints && cnt <= 32) {
				fetch(new Request(urlStr + dateStr(dat))).then((r)=>r.json())
				.then((obj)=> {
					if (obj.status != 0) throw new Error(JSON.stringify(obj));
					dat.setDate(dat.getDate() - 1);
					fetchData(Array.from(obj.data).concat(seq),
						(resTm == 0)? new Date(obj.responsetime).getTime() : resTm,
						cnt + 1);
				});
			} else if (seq.length >= NPoints) {
				seq.splice(0, seq.length - NPoints);
				Sequence = seq.map((x)=>{ return {x:new Number(x.openTime), y:x.open} });
				let v = new Number(seq[0].volume);
				Sequence[0].v = v;
				for (let i = 1; i < seq.length; i ++)
					Sequence[i].v = (v += (new Number(seq[i].volume) - v) * 0.1);
				Sequence.push({x:resTm, y:seq[seq.length-1].close});
				drawData();
				if (LastDate == dateInput.max) {
					if (!IntervalID) IntervalID = setInterval(update, Refresh * 1000);
				} else if (IntervalID) {
					clearInterval(IntervalID); IntervalID = undefined;
				}
			} };
		fetchData([], 0, 0);
	} catch (err) { alert(err.toString()) }
}
